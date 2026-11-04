import json,sys
from auto2 import run
out={}
for bk in ('17','16'):
    for N in range(1,25):
        try: a,f=run(bk,N)
        except Exception as e: a,f=[],[('err',str(e))]
        out[f'{bk}:{N}']={'ans':a,'flags':[str(x) for x in f]}
        json.dump(out,open('/tmp/p/w/all.json','w'),ensure_ascii=False)
        print(bk,N,len(a),len(f),flush=True)
