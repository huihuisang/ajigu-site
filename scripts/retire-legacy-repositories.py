"""Delete only the five approved repositories after backup and edge validation."""

import argparse
from datetime import datetime, timezone
from hashlib import sha256
import json
import os
from pathlib import Path
import re
import runpy
import subprocess
from urllib.parse import urlsplit, urlunsplit

helpers = runpy.run_path(str(Path(__file__).with_name('backup-legacy-repositories.py')))
REPOSITORIES = helpers['REPOSITORIES']
require = helpers['require']
execute = helpers['execute']
api = helpers['api']
save = helpers['save']
SOURCE_REPOSITORY = 'huihuisang/ajigu-site'
LEGACY_HOSTS = {name + '.ajigu.com' for name in ['typenote', 'moodsk', 'gosleep', 'dailyapod', 'tutu']}


def validate_inventory(items):
    require(len(items) == 5, 'Exactly five repository identities are required.')
    actual = {item['repository']: item['id'] for item in items}
    require(actual == REPOSITORIES, 'Repository names or numeric identities do not match the approved set.')
    require(SOURCE_REPOSITORY not in actual, 'The source repository must never be deleted.')


def validate_completion(manifest):
    require(manifest.get('exportComplete') is True and manifest.get('restorationVerified') is True, 'Export and independent restoration must both be complete.')


def validate_edge(evidence):
    require(evidence.get('complete') is True and evidence.get('count') == 184, 'The full edge redirect matrix must pass.')
    results = evidence.get('results', [])
    require(len(results) == 184, 'The edge result count does not match.')
    require(all(item.get('status') == 301 and item.get('targetStatus') == 200 and item.get('edge') == 'cloudflare' for item in results), 'Every redirect must use Cloudflare 301 and reach a valid target.')


def validate_browser(browser):
    checks = browser.get('checks', [])
    require(browser.get('complete') is True and len(checks) == 5, 'Five browser URL/fragment checks are required.')
    require({urlsplit(item['source']).hostname for item in checks} == LEGACY_HOSTS, 'Each legacy domain needs its own browser check.')
    for item in checks:
        source = urlsplit(item['source'])
        expected = urlunsplit(('https', 'ajigu.com', '/' + source.hostname.split('.')[0] + source.path, source.query, source.fragment))
        require(item['url'] == item['expected'] == expected and item['language'] == 'zh-Hans', 'Browser URL, query, fragment or locale mismatch.')


def validate_output(output, task, backup, inputs):
    output = output.resolve()
    require(output.is_relative_to(task.resolve()) and not output.is_relative_to(backup.resolve()), 'Keep deletion receipts inside this task directory and outside persistent backups.')
    require(output not in {source.resolve() for source in inputs}, 'A receipt must not overwrite validation inputs.')
    require(not output.exists(), 'Use a fresh receipt path; never overwrite an existing result.')


def validate_dns(evidence):
    require(evidence.get('hostCount') == 5 and evidence.get('totalRecordCount') == 23 and evidence.get('unchangedOtherRecords') == 18, 'Unexpected DNS change scope or incomplete row inventory.')
    after = evidence.get('after', {})
    require(set(after) == LEGACY_HOSTS, 'The DNS evidence must cover exactly the five legacy hosts.')
    for host, row in after.items():
        require(len(row) >= 7 and row[2] == host and row[3:7] == ['CNAME', 'ajigu.com', 'Proxied', 'Auto'], 'A legacy DNS record still depends on its old origin.')


def validate_metadata(repository, directory):
    saved = json.loads((directory / 'repository.json').read_text())
    current = api('repos/' + repository)
    for key in ['id', 'full_name', 'default_branch', 'description', 'homepage', 'private', 'archived', 'has_wiki', 'has_discussions', 'topics']:
        require(saved.get(key) == current.get(key), 'Repository metadata changed after backup: ' + repository + ' ' + key)
    require(current['permissions']['admin'], 'Admin access was lost: ' + repository)
    for resource in ['branches', 'tags', 'releases', 'labels', 'milestones', 'issues']:
        query = '?state=all&per_page=100' if resource in ['issues', 'milestones'] else '?per_page=100'
        require(api(f'repos/{repository}/{resource}{query}', True) == json.loads((directory / (resource + '.json')).read_text()), 'Repository inventory changed after backup: ' + repository + ' ' + resource)
    for issue in json.loads((directory / 'issues.json').read_text()):
        number = issue['number']
        for resource in ['comments', 'events']:
            require(api(f'repos/{repository}/issues/{number}/{resource}?per_page=100', True) == json.loads((directory / f'issues/{number}-{resource}.json').read_text()), 'Issue history changed after backup.')
        if 'pull_request' in issue:
            original = json.loads((directory / f'pulls/{number}.json').read_text())
            live = api(f'repos/{repository}/pulls/{number}')
            for key in ['mergeable', 'mergeable_state', 'rebaseable']:
                original.pop(key, None)
                live.pop(key, None)
            require(live == original, 'PR metadata changed after backup.')
            for resource in ['comments', 'reviews', 'files', 'commits']:
                require(api(f'repos/{repository}/pulls/{number}/{resource}?per_page=100', True) == json.loads((directory / f'pulls/{number}-{resource}.json').read_text()), 'PR history changed after backup.')
    if current['has_wiki']:
        wiki = subprocess.run(['git', 'ls-remote', 'https://github.com/' + repository + '.wiki.git'], capture_output=True, text=True)
        require(wiki.returncode != 0 and 'Repository not found' in wiki.stderr, 'Wiki content appeared after the backup.')


def validate_backup(directory):
    manifest = json.loads((directory / 'manifest.json').read_text())
    report = json.loads((directory / 'restoration-verification.json').read_text())
    validate_completion(manifest)
    validate_inventory(manifest['repositories'])
    validate_inventory(report['repositories'])
    require(report.get('complete') is True, 'The restoration report is incomplete.')
    audited = {item['repository']: item for item in report['repositories']}
    for item in manifest['repositories']:
        backup = Path(item['directory']).resolve()
        require(backup.parent == directory, 'Backup location leaves the verified directory.')
        audit = audited[item['repository']]
        require(audit['restored'] is True and audit['fsck'] == 'passed', 'Restoration validation failed.')
        require(audit['releaseAssets'] == audit['lfsPointers'] == audit['submodules'] == 0, 'External binary dependencies were not exported.')
        require(audit['wiki'] in ['disabled', 'not-created', 'empty'] and audit['discussions'] is False, 'Unexported platform content remains.')
        require(sha256((backup / 'repository.bundle').read_bytes()).hexdigest() == item['bundleSHA256'] == audit['bundleSHA256'], 'Bundle digest mismatch.')
        for name, digest in json.loads((backup / 'sha256.json').read_text()).items():
            source = (backup / name).resolve()
            require(source.is_relative_to(backup), 'Archive path leaves its backup.')
            require(sha256(source.read_bytes()).hexdigest() == digest, 'Backup file digest mismatch: ' + name)
        refs = execute(['git', 'ls-remote', '--heads', '--tags', 'https://github.com/' + item['repository'] + '.git'])
        require(refs == (backup / 'refs.txt').read_text(), 'Source refs changed after backup: ' + item['repository'])
    return manifest


def retire(args):
    task = os.environ.get('TASK_ARTIFACT_DIR')
    require(bool(task), 'Run retirement through task-artifacts.')
    directory = args.backup.resolve()
    require(not directory.is_relative_to(Path(task).resolve()), 'Persistent backups must remain outside disposable task outputs.')
    validate_output(args.output, Path(task), directory, [args.browser_evidence, args.dns_evidence])
    manifest = validate_backup(directory)
    browser = json.loads(args.browser_evidence.read_text())
    validate_browser(browser)
    dns = json.loads(args.dns_evidence.read_text())
    age = (datetime.now(timezone.utc) - datetime.fromisoformat(dns['changedAt'])).total_seconds()
    require(age >= 300, 'Keep the old origins during the initial 300-second DNS transition.')
    validate_dns(dns)
    edge_path = Path(task) / 'retirement-edge-preflight.json'
    execute(['node', 'scripts/check-edge-redirects.mjs', str(edge_path)])
    validate_edge(json.loads(edge_path.read_text()))
    source = api('repos/' + SOURCE_REPOSITORY)
    require(source['full_name'] == SOURCE_REPOSITORY and source['permissions']['admin'], 'The source repository is unavailable.')
    plans = []
    for item in manifest['repositories']:
        validate_metadata(item['repository'], Path(item['directory']))
        current = api('repos/' + item['repository'])
        require(current['id'] == item['id'] and current['full_name'] == item['repository'] and current['permissions']['admin'], 'Repository identity or permissions changed.')
        plans.append({'repository': item['repository'], 'id': item['id'], 'backup': item['directory'], 'bundleSHA256': item['bundleSHA256']})
    validate_inventory(plans)
    result = {'verifiedAt': datetime.now(timezone.utc).isoformat(), 'apply': args.apply, 'plans': plans, 'deleted': [], 'complete': False}
    save(args.output, result)
    if not args.apply:
        print('Dry run passed: five verified backups and five independent edge redirects; no repositories deleted.')
        return
    authorization = execute(['gh', 'api', '--include', 'user'])
    scopes = re.search(r'^x-oauth-scopes:\s*(.*)$', authorization, re.MULTILINE | re.IGNORECASE)
    require(scopes is not None and 'delete_repo' in [value.strip() for value in scopes.group(1).split(',')], 'GitHub CLI requires the delete_repo OAuth scope before deletion.')
    for item in plans:
        validate_metadata(item['repository'], Path(item['backup']))
        current = api('repos/' + item['repository'])
        require(current['id'] == item['id'] and current['full_name'] == item['repository'], 'Repository identity changed at deletion time.')
        refs = execute(['git', 'ls-remote', '--heads', '--tags', 'https://github.com/' + item['repository'] + '.git'])
        require(refs == (Path(item['backup']) / 'refs.txt').read_text(), 'Source refs changed at deletion time.')
        execute(['gh', 'repo', 'delete', item['repository'], '--yes'])
        check = subprocess.run(['gh', 'api', 'repos/' + item['repository']], capture_output=True, text=True)
        require(check.returncode != 0 and '(HTTP 404)' in check.stderr, 'Repository deletion was not confirmed: ' + item['repository'])
        result['deleted'].append({'repository': item['repository'], 'id': item['id'], 'confirmedStatus': 404})
        save(args.output, result)
    after_path = Path(task) / 'retirement-edge-after.json'
    execute(['node', 'scripts/check-edge-redirects.mjs', str(after_path)])
    after = json.loads(after_path.read_text())
    validate_edge(after)
    require(api('repos/' + SOURCE_REPOSITORY)['id'] == source['id'], 'The retained repository identity changed.')
    result.update({'complete': True, 'edgeAfter': after, 'retainedRepository': {'repository': SOURCE_REPOSITORY, 'id': source['id']}})
    save(args.output, result)
    print('Five repositories deleted; 184 edge redirects still pass; ajigu-site is retained.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--backup', required=True, type=Path)
    parser.add_argument('--browser-evidence', required=True, type=Path)
    parser.add_argument('--dns-evidence', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--apply', action='store_true')
    retire(parser.parse_args())
