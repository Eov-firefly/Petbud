"""Verify a Petbud video pack with ffprobe. Does not generate missing animation detail."""
import argparse, hashlib, json, subprocess
from fractions import Fraction
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('pack',nargs='?',default='assets/cinema');args=parser.parse_args()
root=Path(args.pack).resolve();manifest=json.loads((root/'manifest.json').read_text());frames=0;total=0
for name,clip in manifest['clips'].items():
    file=(root/clip['path']).resolve()
    if not file.is_relative_to(root): raise SystemExit('Unsafe clip path')
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height,avg_frame_rate,nb_frames,duration','-of','json',str(file)]))['streams'][0]
    for key in ['width','height']: assert info[key]==clip[key],(name,key)
    assert int(info['nb_frames'])==clip['frames'],name
    assert abs(float(info['duration'])-clip['duration'])<.05,name
    assert float(Fraction(info['avg_frame_rate']))>=15,name
    frames+=int(info['nb_frames']);total+=file.stat().st_size
    print(f"{name:7s} {info['nb_frames']:>4s} frames {info['avg_frame_rate']:>5s} fps {file.stat().st_size:>7d} bytes sha256={hashlib.sha256(file.read_bytes()).hexdigest()[:16]}")
print(f'PASS: {len(manifest["clips"])} clips, {frames} source frames, {total} bytes. Runtime performance and subjective quality require browser review.')
