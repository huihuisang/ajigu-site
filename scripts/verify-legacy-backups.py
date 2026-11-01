"""Restore and audit the exported repositories before any remote deletion."""

import argparse
from datetime import datetime, timezone
from hashlib import sha256
import json
import os
from pathlib import Path
import runpy
import subprocess

helpers = runpy.run_path(str(Path(__file__).with_name('backup-legacy-repositories.py')))
REPOSITORIES = helpers['REPOSITORIES']
require = helpers['require']
execute = helpers['execute']
save = helpers['save']


def verify(destination, task):
    manifest = json.loads((destination / 'manifest.json').read_text())
    identities = {item['repository']: item['id'] for item in manifest['repositories']}
    require(identities == REPOSITORIES, 'The export does not contain exactly the five approved repository identities.')
    results = []
    for item in manifest['repositories']:
        repository = item['repository']
        directory = Path(item['directory']).resolve()
        require(directory.parent == destination, 'Backup path leaves the export directory.')
        for name, digest in json.loads((directory / 'sha256.json').read_text()).items():
            source = (directory / name).resolve()
            require(source.is_relative_to(directory), 'Archive path leaves the backup directory.')
            require(sha256(source.read_bytes()).hexdigest() == digest, 'Archive digest mismatch: ' + name)
        bundle = directory / 'repository.bundle'
        restore = task / 'restore-checkouts' / repository.replace('/', '--')
        execute(['jj', 'git', 'clone', '--colocate', str(bundle), str(restore)])
        execute(['git', 'fsck', '--full'], restore)
        refs = (directory / 'refs.txt').read_text()
        require(execute(['git', 'ls-remote', '--heads', '--tags', 'https://github.com/' + repository + '.git']) == refs, 'Remote refs changed since export: ' + repository)
        for line in refs.splitlines():
            commit, ref = line.split()
            execute(['git', 'cat-file', '-e', commit + '^{object}'], restore)
        for commits in (directory / 'pulls').glob('*-commits.json') if (directory / 'pulls').exists() else []:
            for commit in json.loads(commits.read_text()):
                execute(['git', 'cat-file', '-e', commit['sha'] + '^{commit}'], restore)
        releases = json.loads((directory / 'releases.json').read_text())
        assets = [asset for release in releases for asset in release['assets']]
        require(not assets, 'Release attachments require a separate binary export: ' + repository)
        # Scan all archived commits, not only the default branch checkout.
        commits = execute(['git', 'rev-list', '--all'], restore).splitlines()
        for commit in commits:
            tree = execute(['git', 'ls-tree', '-r', commit], restore)
            require(not any(line.startswith('160000 ') for line in tree.splitlines()), 'Submodule repositories need a separate export: ' + repository)
        objects = execute(['git', 'rev-list', '--objects', '--all'], restore).splitlines()
        object_ids = '\n'.join(line.split()[0] for line in objects) + '\n'
        details = subprocess.run(['git', 'cat-file', '--batch-check=%(objecttype) %(objectsize) %(objectname)'], input=object_ids, text=True, capture_output=True, check=True, cwd=restore).stdout
        for line in details.splitlines():
            kind, size, identity = line.split()
            if kind == 'blob' and int(size) <= 1024:
                blob = subprocess.run(['git', 'cat-file', 'blob', identity], capture_output=True, check=True, cwd=restore).stdout
                require(not blob.startswith(b'version https://git-lfs.github.com/spec/'), 'LFS content needs a separate export: ' + repository)
        metadata = json.loads((directory / 'repository.json').read_text())
        require(not metadata['has_discussions'], 'GitHub Discussions require a separate export: ' + repository)
        wiki = 'disabled'
        if metadata['has_wiki']:
            result = subprocess.run(['git', 'ls-remote', 'https://github.com/' + repository + '.wiki.git'], capture_output=True, text=True)
            if result.returncode:
                require('Repository not found' in result.stderr, 'Wiki inventory failed: ' + repository)
                wiki = 'not-created'
            elif result.stdout.strip():
                raise RuntimeError('Wiki content needs a separate export: ' + repository)
            else:
                wiki = 'empty'
        results.append({'repository': repository, 'id': item['id'], 'restored': True, 'fsck': 'passed', 'refCount': len(refs.splitlines()), 'commitCount': len(commits), 'releaseAssets': len(assets), 'lfsPointers': 0, 'submodules': 0, 'wiki': wiki, 'discussions': False, 'bundleSHA256': sha256(bundle.read_bytes()).hexdigest()})
        print('Restore and content audit passed: ' + repository, flush=True)
    report = {'verifiedAt': datetime.now(timezone.utc).isoformat(), 'complete': True, 'repositories': results}
    save(destination / 'restoration-verification.json', report)
    manifest.update({'exportComplete': True, 'restorationVerified': True, 'limits': ['No release assets, LFS pointers, submodules or Discussions were present; wiki inventory is recorded per repository.', 'Git objects, source refs and issue/PR JSON are retained. Original GitHub identities, URLs, stars, issue numbers and settings cannot be restored exactly.', 'Actions logs/caches, credentials and platform secrets are not included.']})
    save(destination / 'manifest.json', manifest)
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--destination', required=True, type=Path)
    parser.add_argument('--evidence', required=True, type=Path)
    args = parser.parse_args()
    task = os.environ.get('TASK_ARTIFACT_DIR')
    require(bool(task), 'Run this audit through task-artifacts.')
    report = verify(args.destination.resolve(), Path(task))
    save(args.evidence, report)
