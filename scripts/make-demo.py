"""Make a short, labelled walkthrough from real published-frontend captures.
This is a screenshot sequence, not a real-time screen recording.
"""
from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[1]
frames=[('01-confirm.jpg',6,'1. Confirm commit_proposal - existing deployed contract'),('02-proposal.jpg',8,'2. Proposal #2 finalized - returned ID and real transaction hash'),('03-review-confirm.jpg',6,'3. Sign review_bundle against Proposal #2 in the app'),('04-live-result.jpg',10,'4. Review #4 finalized as MATCH - live evidence and receipt'),('05-live-records.jpg',8,'5. Published frontend lists Proposal #2 and Review #4')]
for f,_,_ in frames:
 assert (root/'docs/demo'/f).is_file(), 'Missing live capture: '+f
concat=root/'docs/demo/frames.txt'
concat.write_text(''.join("file '"+str(root/'docs/demo'/f)+"'\nduration "+str(d)+'\n' for f,d,_ in frames)+"file '"+str(root/'docs/demo'/frames[-1][0])+"'\n")
filters=['scale=1280:-2','pad=1280:960:0:0:color=0x0d2224','setsar=1']
start=0
for f,d,caption in frames:
 filters.append("drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='"+caption+"':fontcolor=white:fontsize=20:x=(w-tw)/2:y=903:enable='between(t,"+str(start)+','+str(start+d)+")'")
 start+=d
filters.append("drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='Real published frontend captures - consensus wait times omitted':fontcolor=0xb8f46d:fontsize=15:x=(w-tw)/2:y=938")
subprocess.run(['ffmpeg','-y','-f','concat','-safe','0','-i',str(concat),'-vf',','.join(filters),'-t',str(start),'-r','15','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(root/'docs/demo/mandatecheck-demo.mp4')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
concat.unlink()
print('Created',start,'second screenshot walkthrough.')
