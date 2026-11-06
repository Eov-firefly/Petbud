"""Package real, reviewed footage. Requires ffprobe; does not invent animations."""
import argparse,json,shutil,subprocess
from pathlib import Path
from fractions import Fraction
ACTIONS=['idle','eat','play','call','touch','look','happy','sleep_enter','sleep_loop','sleep_exit','walk_left','walk_right','run_left','run_right']
p=argparse.ArgumentParser();p.add_argument('--species',choices=['dog','cat','turtle'],required=True);p.add_argument('--stage',choices=['baby','juvenile','adult'],required=True);p.add_argument('--character',required=True);p.add_argument('--input',type=Path,required=True);p.add_argument('--output',type=Path,required=True);p.add_argument('--source',required=True);p.add_argument('--gait-config',type=Path);p.add_argument('--background',choices=['black','alpha'],default='black');p.add_argument('--allow-partial',action='store_true');a=p.parse_args()
required=[x for x in ACTIONS if a.species!='turtle' or not x.startswith('run_')];gaits=json.loads(a.gait_config.read_text())if a.gait_config else{}
manifest={'format':'petbud-species-video-v2','species':a.species,'stage':a.stage,'character_id':a.character,'source':a.source,'clips':{}};copies=[]
for name in required:
    candidates=[a.input/(name+'.mp4'),a.input/(name+'.webm')];f=next((f for f in candidates if f.is_file()),None)
    if not f:continue
    stream=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=width,height,avg_frame_rate,nb_read_frames,duration:format=duration','-of','json',str(f)]));s=stream['streams'][0]
    duration=float(s.get('duration',stream['format']['duration']));fps=float(Fraction(s['avg_frame_rate']));frames=int(s['nb_read_frames'])
    if duration<=0 or duration>60 or fps<15 or fps>60 or frames<24:raise SystemExit('Rejected duration/fps/frames: '+name)
    c={'path':f.name,'duration':duration,'frames':frames,'fps':fps,'width':s['width'],'height':s['height'],'background':a.background,'loop':name in ['idle','sleep_loop']or name.startswith(('walk_','run_')),'anchor':[.5,.94]}
    if name.startswith(('walk_','run_')):
        g=gaits.get(name)
        if not g or g.get('stride_px',0)<=0 or not(0<=g.get('start',-1)<g.get('end',-1)<=duration):raise SystemExit('Missing or invalid reviewed gait config: '+name)
        c['gait']=g
    manifest['clips'][name]=c;copies.append((f,f.name))
missing=[x for x in required if x not in manifest['clips']]
if 'idle'not in manifest['clips']:raise SystemExit('idle video is required')
if missing and not a.allow_partial:raise SystemExit('Missing real clips: '+', '.join(missing)+'; use --allow-partial only for an explicitly incomplete review pack')
manifest['complete']=not missing;manifest['missing_actions']=missing;a.output.mkdir(parents=True,exist_ok=True)
for src,name in copies:
    dst=a.output/name
    if src.resolve()!=dst.resolve():shutil.copy2(src,dst)
(a.output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'output':str(a.output),'complete':not missing,'real_clips':len(copies),'missing':missing},ensure_ascii=False))
