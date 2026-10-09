import os
import re
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SRC_DIR = r"D:\UMA ERP\ERP-Test-1\src"

results = []

# Pattern to detect any array literal with object inside: [ { ... } ]
array_of_objects_pattern = re.compile(r'=\s*\[\s*\{\s*["\']?[a-zA-Z0-9_]+["\']?\s*:', re.MULTILINE)

# Pattern to detect fallback arrays: (|| or ??) [ { ... } ]
fallback_objects_pattern = re.compile(r'(\?\?|\|\|)\s*\[\s*\{', re.MULTILINE)

for root, dirs, files in os.walk(SRC_DIR):
    for f in files:
        if not f.endswith(('.ts', '.tsx')):
            continue
        filepath = os.path.join(root, f)
        rel_path = os.path.relpath(filepath, SRC_DIR).replace('\\', '/')
        
        # skip types definition files
        if rel_path.startswith('types/'):
            continue
            
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
            
        # check array of objects
        matches = array_of_objects_pattern.finditer(content)
        for m in matches:
            start_pos = m.start()
            line_num = content[:start_pos].count('\n') + 1
            line_str = content.split('\n')[line_num - 1].strip()
            # filter out harmless definitions like navigation links, tabs, column definitions
            if any(term in line_str.lower() for term in ['columns', 'tabs', 'nav', 'menu', 'options', 'breadcrumbs', 'headers', 'links', 'actions', 'steps', 'filters', 'fields', 'badges', 'config', 'stages', 'statusoptions', 'categories', 'colors', 'metrics_config', 'cards_config']):
                continue
            # check the block
            snippet = content[start_pos:start_pos + 120].replace('\n', ' ')
            results.append({
                'file': rel_path,
                'line': line_num,
                'type': 'LITERAL_OBJECT_ARRAY',
                'snippet': snippet[:120]
            })
            
        # check fallback objects
        fb_matches = fallback_objects_pattern.finditer(content)
        for m in fb_matches:
            start_pos = m.start()
            line_num = content[:start_pos].count('\n') + 1
            line_str = content.split('\n')[line_num - 1].strip()
            snippet = content[start_pos:start_pos + 120].replace('\n', ' ')
            results.append({
                'file': rel_path,
                'line': line_num,
                'type': 'FALLBACK_OBJECT_ARRAY',
                'snippet': snippet[:120]
            })

with open(r"D:\UMA ERP\ERP-Test-1\scripts\mock_array_findings.json", "w", encoding="utf-8") as out:
    json.dump(results, out, indent=2)

print(f"Total array findings: {len(results)}")
for r in results:
    print(f"{r['file']}:{r['line']} [{r['type']}] -> {r['snippet']}")
