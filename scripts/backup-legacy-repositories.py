"""Export the five retired website repositories without changing remote data."""

import argparse
from datetime import datetime, timezone
from hashlib import sha256
import json
import os
from pathlib import Path
import subprocess

REPOSITORIES = {
    'huihuisang/typenote-landing': 1201352821,
    'Ajigu-Studio/moodsk-website': 1370096346,
    'huihuisang/snorz-site': 1333696286,
    'huihuisang/dailyapod-site': 1340149861,
    'huihuisang/tutu-site': 1381405252,
}


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def execute(args, cwd=None):
    result = subprocess.run(args, cwd=cwd, capture_output=True, text=True, check=True)
    return result.stdout


def api(endpoint, paginate=False):
    args = ['gh', 'api', endpoint]
    if paginate:
        pages = json.loads(execute(args + ['--paginate', '--slurp']))
        return [item for page in pages for item in page]
    return json.loads(execute(args))


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')


def backup(destination, checkout_root):
    destination.mkdir(parents=True, exist_ok=False)
    results = []
    for repository, identity in REPOSITORIES.items():
        metadata = api('repos/' + repository)
        require(metadata['id'] == identity and metadata['full_name'] == repository, 'Repository identity changed: ' + repository)
        require(metadata['permissions']['admin'], 'Admin access is required: ' + repository)
        directory = destination / repository.replace('/', '--')
        directory.mkdir()
        save(directory / 'repository.json', metadata)
        for resource in ['branches', 'tags', 'releases', 'labels', 'milestones']:
            query = '?state=all&per_page=100' if resource == 'milestones' else '?per_page=100'
            save(directory / (resource + '.json'), api(f'repos/{repository}/{resource}{query}', True))
        save(directory / 'pages.json', api(f'repos/{repository}/pages'))
        issues = api(f'repos/{repository}/issues?state=all&per_page=100', True)
        save(directory / 'issues.json', issues)
        for issue in issues:
            number = issue['number']
            for resource in ['comments', 'events']:
                save(directory / f'issues/{number}-{resource}.json', api(f'repos/{repository}/issues/{number}/{resource}?per_page=100', True))
            if 'pull_request' in issue:
                pull = api(f'repos/{repository}/pulls/{number}')
                save(directory / f'pulls/{number}.json', pull)
                for resource in ['comments', 'reviews', 'files', 'commits']:
                    save(directory / f'pulls/{number}-{resource}.json', api(f'repos/{repository}/pulls/{number}/{resource}?per_page=100', True))
        remote = 'https://github.com/' + repository + '.git'
        refs = execute(['git', 'ls-remote', '--heads', '--tags', remote])
        (directory / 'refs.txt').write_text(refs)
        checkout = checkout_root / repository.replace('/', '--')
        execute(['jj', 'git', 'clone', '--colocate', remote, str(checkout)])
        execute(['jj', 'git', 'fetch', '--remote', 'origin', '--branch', '*', '--tag', '*'], checkout)
        # Git exports the read-only archive; jj manages the temporary checkout.
        bundle = directory / 'repository.bundle'
        execute(['git', 'bundle', 'create', str(bundle), '--all'], checkout)
        execute(['git', 'bundle', 'verify', str(bundle)], checkout)
        bundle_heads = execute(['git', 'bundle', 'list-heads', str(bundle)])
        archived = {line.split()[0] for line in bundle_heads.splitlines()}
        for line in refs.splitlines():
            commit, ref = line.split()
            execute(['git', 'cat-file', '-e', commit + '^{object}'], checkout)
            if not ref.endswith('^{}'):
                require(commit in archived, 'A source ref is missing from the bundle: ' + repository + ' ' + ref)
        # Refuse to certify a backup if a branch moved during export.
        require(execute(['git', 'ls-remote', '--heads', '--tags', remote]) == refs, 'Source refs changed during export: ' + repository)
        files = {str(file.relative_to(directory)): sha256(file.read_bytes()).hexdigest() for file in directory.rglob('*') if file.is_file()}
        save(directory / 'sha256.json', files)
        results.append({'repository': repository, 'id': identity, 'directory': str(directory), 'bundleSHA256': sha256(bundle.read_bytes()).hexdigest(), 'refCount': len(refs.splitlines()), 'issuesAndPullRequests': len(issues), 'files': len(files)})
        print('Verified backup: ' + repository, flush=True)
        save(destination / 'manifest.json', {'createdAt': datetime.now(timezone.utc).isoformat(), 'exportComplete': len(results) == len(REPOSITORIES), 'restorationVerified': False, 'repositories': results, 'limits': ['Platform secrets, authentication grants, Actions logs and caches are not exported.', 'GitHub identities, URLs and issue numbers cannot be recreated exactly after repository deletion.', 'Source branches and tags are included in Git bundles; issue and PR conversations are exported as JSON.', 'Deletion also requires the separate restore, release asset, PR object, wiki, LFS and submodule audit.']})
    return results


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--destination', required=True, type=Path)
    args = parser.parse_args()
    task = os.environ.get('TASK_ARTIFACT_DIR')
    if not task:
        raise RuntimeError('Run this export through task-artifacts.')
    destination = args.destination.resolve()
    if destination.is_relative_to(Path(task).resolve()):
        raise RuntimeError('Keep persistent repository backups outside task outputs.')
    backup(destination, Path(task) / 'backup-checkouts')
