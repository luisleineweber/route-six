"""Check the prepared archive for local files and common credential formats."""
import json
import re
from pathlib import Path
from zipfile import ZipFile

root = Path(__file__).resolve().parent.parent
patterns = [rb'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----',
            rb'gh[pousr]_[A-Za-z0-9]{30,}', rb'github_pat_[A-Za-z0-9_]{40,}',
            rb'AKIA[A-Z0-9]{16}', rb'sk-(?:proj-)?[A-Za-z0-9_-]{40,}']
findings = []
with ZipFile(root / 'output/route-six-release-source.zip') as archive:
    for name in archive.namelist():
        if name.endswith('.log') or name.startswith(('output/', '.git/', 'node_modules/')) or (Path(name).name.startswith('.env') and name != '.env.example'):
            findings.append({'file': name, 'reason': 'local-only file'})
        data = archive.read(name)
        if any(re.search(pattern, data) for pattern in patterns):
            findings.append({'file': name, 'reason': 'possible credential; review without printing value'})
result = {'findings': findings, 'scope': 'Prepared source archive only. Pattern check; not proof that all secrets are absent.'}
(root / 'output/release-source-check.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(f'Source archive scan: {len(findings)} findings')
raise SystemExit(bool(findings))
