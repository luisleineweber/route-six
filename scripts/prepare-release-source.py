"""Create a source archive without local history, logs or agent records."""
import json
import subprocess
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
output = root / 'output'
output.mkdir(exist_ok=True)
paths = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
folders = {'src', 'scripts', 'tests', 'data', 'public', 'docs', '.github'}
files = {'README.md', 'LICENSE', 'NOTICE.md', 'DESIGN.md', 'CONTEXT.md', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'index.html', '.gitignore', '.env.example'}
included = sorted({name for name in paths if name and (Path(name).parts[0] in folders or name in files)
                   and not name.endswith(('.log', '.tsbuildinfo', '.pyc')) and '__pycache__' not in Path(name).parts})
archive = output / 'route-six-release-source.zip'
with ZipFile(archive, 'w', ZIP_DEFLATED) as target:
    for name in included:
        target.write(root / name, name)
with ZipFile(archive) as target:
    assert target.testzip() is None
    assert all(not name.startswith(('output/', '.git/', 'node_modules/')) for name in target.namelist())
    assert 'package-lock.json' in target.namelist()
    assert {'LICENSE', 'NOTICE.md'} <= set(target.namelist())
    assert '.github/workflows/pages.yml' in target.namelist()
(output / 'release-source-manifest.json').write_text(json.dumps({'files': included, 'count': len(included), 'archive': str(archive)}, indent=2) + '\n', encoding='utf-8')
print(f'Checked source archive: {archive} ({len(included)} files)')
