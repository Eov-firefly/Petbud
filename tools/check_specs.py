"""Validate the design bundle only; no product implementation is tested."""
import json, math, re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
errors=[]
jsons={}
for p in sorted((root/'specs').glob('*.json')):
    try: jsons[p.name]=json.loads(p.read_text())
    except Exception as e: errors.append(f'{p.name}: {e}')
for p in root.rglob('*.md'):
    for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
        if '://' in link or link.startswith('#') or link.startswith('mailto:'): continue
        target=link.split('#',1)[0]
        if target and not (p.parent/target).exists(): errors.append(f'{p.relative_to(root)}: missing {target}')
c=jsons.get('life-config.example.json',{})
try:
    assert c['mortality']['mode']=='shadow'
    m=c['mortality']
    annual=-math.expm1(-m['sudden_hazard_per_hour']*8760)
    assert math.isclose(annual,m['annual_sudden_probability_candidate'],rel_tol=1e-10)
    assert annual < m['annual_total_budget_candidate']
    stages=c['stages']; starts=[x['start_s'] for x in stages]
    assert starts[0]==0 and all(a<b for a,b in zip(starts,starts[1:]))
    assert c['time']['self_care_after_s']<c['time']['boarding_after_s']
    assert set(c['species'])=={'dog','cat','turtle'}
    assert c['economy']['free_basic_treatment'] and c['economy']['free_replacement_egg']
    assert 'chase' not in c['species']['turtle']['allowed_play']
    state=jsons['pet-state.example.json']
    assert set(state['rng']['streams'])==set(c['rng']['streams'])
    assert all(0<=v<=1 for v in state['physiology'].values())
    t=jsons['transfer.example.json']['allowed_transitions']
    assert not t['COMMITTED'] and not t['CANCELLED'] and not t['EXPIRED']
except (AssertionError,KeyError,TypeError) as e: errors.append(f'Constraint check failed: {e}')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(list(root.rglob("*.md")))} Markdown files, {len(jsons)} JSON examples, local links and design constraints. No runtime/hardware tests performed.')
