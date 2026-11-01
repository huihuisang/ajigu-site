from pathlib import Path
import runpy
import os
import tempfile
import json
from unittest.mock import patch
import unittest

module = runpy.run_path(str(Path(__file__).parents[1] / 'scripts/retire-legacy-repositories.py'))


class RetirementTests(unittest.TestCase):
    def inventory(self):
        return [{'repository': name, 'id': identity} for name, identity in module['REPOSITORIES'].items()]

    def test_exact_inventory_passes(self):
        module['validate_inventory'](self.inventory())

    def test_source_repository_is_rejected(self):
        values = self.inventory()
        values[0]['repository'] = 'huihuisang/ajigu-site'
        with self.assertRaises(RuntimeError):
            module['validate_inventory'](values)

    def test_changed_identity_is_rejected(self):
        values = self.inventory()
        values[0]['id'] += 1
        with self.assertRaises(RuntimeError):
            module['validate_inventory'](values)

    def test_missing_and_duplicate_targets_are_rejected(self):
        for values in [self.inventory()[:-1], self.inventory() + self.inventory()[:1]]:
            with self.assertRaises(RuntimeError):
                module['validate_inventory'](values)

    def test_incomplete_backup_audit_is_rejected(self):
        for manifest in [{}, {'exportComplete': True}, {'exportComplete': True, 'restorationVerified': False}]:
            with self.assertRaises(RuntimeError):
                module['validate_completion'](manifest)
        module['validate_completion']({'exportComplete': True, 'restorationVerified': True})

    def test_edge_evidence_rejects_missing_or_non_edge_redirects(self):
        good = {'complete': True, 'count': 184, 'results': [{'status': 301, 'targetStatus': 200, 'edge': 'cloudflare'}] * 184}
        module['validate_edge'](good)
        for changed in [{**good, 'count': 183}, {**good, 'complete': False}, {**good, 'results': [{'status': 200, 'targetStatus': 200, 'edge': 'github'}] * 184}]:
            with self.assertRaises(RuntimeError):
                module['validate_edge'](changed)

    def test_browser_evidence_requires_each_domain_and_preserves_the_fragment(self):
        checks = [{'source': f'https://{host}/?lang=zh#faq', 'url': f"https://ajigu.com/{host.split('.')[0]}/?lang=zh#faq", 'expected': f"https://ajigu.com/{host.split('.')[0]}/?lang=zh#faq", 'language': 'zh-Hans'} for host in sorted(module['LEGACY_HOSTS'])]
        module['validate_browser']({'complete': True, 'checks': checks})
        with self.assertRaises(RuntimeError):
            module['validate_browser']({'complete': True, 'checks': [checks[0]] * 5})
        checks[0]['url'] = checks[0]['url'].replace('#faq', '')
        with self.assertRaises(RuntimeError):
            module['validate_browser']({'complete': True, 'checks': checks})

    def test_dns_inventory_counts_records_instead_of_unique_hostnames(self):
        good = {'hostCount': 5, 'totalRecordCount': 23, 'unchangedOtherRecords': 18, 'after': {host: ['', '', host, 'CNAME', 'ajigu.com', 'Proxied', 'Auto'] for host in module['LEGACY_HOSTS']}}
        module['validate_dns'](good)
        with self.assertRaises(RuntimeError):
            module['validate_dns']({'hostCount': 5, 'totalRecordCount': 23, 'unchangedOtherRecords': 12})
        with self.assertRaises(RuntimeError):
            module['validate_dns']({**good, 'after': {}})
        good['after']['typenote.ajigu.com'][5] = 'DNS only'
        with self.assertRaises(RuntimeError):
            module['validate_dns'](good)

    def test_receipts_cannot_overwrite_backups_or_inputs(self):
        with tempfile.TemporaryDirectory(dir=os.environ.get('TASK_ARTIFACT_DIR')) as root:
            root = Path(root)
            task, backup = root / 'task', root / 'backup'
            task.mkdir()
            backup.mkdir()
            source = task / 'browser.json'
            source.write_text('{}')
            for output in [backup / 'repository.bundle', source, root / 'outside.json']:
                with self.assertRaises(RuntimeError):
                    module['validate_output'](output, task, backup, [source])
            module['validate_output'](task / 'fresh.json', task, backup, [source])

    def test_new_release_assets_or_issue_comments_block_deletion_without_ref_changes(self):
        with tempfile.TemporaryDirectory(dir=os.environ.get('TASK_ARTIFACT_DIR')) as root:
            directory = Path(root)
            repository = {'id': 1, 'full_name': 'test/repository', 'permissions': {'admin': True}, 'has_wiki': False}
            (directory / 'repository.json').write_text(json.dumps(repository))
            for resource in ['branches', 'tags', 'releases', 'labels', 'milestones']:
                (directory / (resource + '.json')).write_text('[]')
            (directory / 'issues.json').write_text('[{"number": 1}]')
            (directory / 'issues').mkdir()
            (directory / 'issues/1-comments.json').write_text('[]')
            (directory / 'issues/1-events.json').write_text('[]')
            def response(endpoint, paginate=False):
                if endpoint == 'repos/test/repository':
                    return repository
                if '/issues?' in endpoint:
                    return [{'number': 1}]
                return []
            function = module['validate_metadata']
            with patch.dict(function.__globals__, {'api': response}):
                function('test/repository', directory)
            for changed in ['releases?', 'issues/1/comments?']:
                def modified(endpoint, paginate=False):
                    return [{'id': 99, 'body': 'New content'}] if changed in endpoint else response(endpoint, paginate)
                with patch.dict(function.__globals__, {'api': modified}):
                    with self.assertRaises(RuntimeError):
                        function('test/repository', directory)


if __name__ == '__main__':
    unittest.main()
