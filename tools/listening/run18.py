import json,sys
from auto2 import run
from crop import crops
out={}
for N in range(1,25):
    try: a,f=run('18',N)
    except Exception as e: a,f=[],[('err',str(e))]
    try: k,res=crops('18',N,'/tmp/p/w/q18/%d'%N)
    except Exception as e: k,res=0,[('err',str(e))]
    out[N]={'ans':a,'flags':[str(x) for x in f],'crops':k,'cres':[str(x) for x in res]}
    json.dump(out,open('/tmp/p/w/k18.json','w'))
    print(N,len(a),f,k,res,flush=True)
