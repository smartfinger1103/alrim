import sys,cv2,numpy as np
from ext2 import analyze
T_={b:[cv2.cvtColor(cv2.imread(f'/tmp/p/w/tpl{b}_{i}.png'),cv2.COLOR_BGR2GRAY) for i in range(1,6)] for b in ('16','17')}; T_['18']=T_['17']
def rings_of(xg,bk,thr=0.5):
    T=T_[bk]
    pts=[]
    for k,t in enumerate(T):
        r=cv2.matchTemplate(xg,t,cv2.TM_CCOEFF_NORMED)
        ys,xs=np.where(r>thr)
        for y,x in zip(ys,xs): pts.append((float(r[y,x]),x+11,y+11,k+1))
    pts.sort(reverse=True);keep=[]
    for s,x,y,k in pts:
        if all(abs(x-a)>9 or abs(y-b)>9 for _,a,b,_ in keep): keep.append((s,x,y,k))
    return [(x,y,k) for s,x,y,k in keep if x>200 and x<1000]
def groups(rs):
    rs=sorted(rs,key=lambda r:(round(r[1]/18),r[0]))
    # fix row banding: cluster by y gaps
    rs=sorted(rs,key=lambda r:r[1]);rows=[];
    for r in rs:
        if rows and abs(r[1]-rows[-1][0][1])<=10: rows[-1].append(r)
        else: rows.append([r])
    flat=[r for row in rows for r in sorted(row,key=lambda r:r[0])]
    # 번호 모양은 믿지 않고 위치로 묶어요: 왼쪽 첫 칸에서 시작, 같은 줄은 오른쪽으로 330px 안, 다음 줄은 왼쪽 첫 칸으로 (표 안의 ○ 같은 것은 버려요)
    if not flat: return [],0
    left=min(r[0] for r in flat)+20; gs=[]; cur=None
    for r in flat:
        if cur and len(cur)<5:
            p=cur[-1]; same=abs(r[1]-p[1])<=10
            if same and 60<r[0]-p[0]<420: cur.append(r); continue
            if not same and 0<r[1]-p[1]<80 and r[0]<left: cur.append(r); continue
            if same: continue
        if r[0]<left or cur is None or len(cur)>=5: cur=[r]; gs.append(cur)
    gs=[g for g in gs if len(g)==5]
    return gs,5*len(gs)
def pages_for(bk,N):
    if bk in ('17','18'): s=1+16*(N-1); return list(range(s,s+4))
    s=1+12*(N-1); return list(range(s,s+5))
def run(bk,N,pages=None):
    ans=[];flags=[];qn=0;qp=[]
    for p in (pages or pages_for(bk,N)):
        a=analyze(bk,p);xg=cv2.cvtColor(a['x'],cv2.COLOR_BGR2GRAY)
        for thr in (0.62,0.55,0.5,0.45,0.4,0.7):
            gs,tot=groups(rings_of(xg,bk,thr))
            if len(gs)==len(a['marks']):
                pm=[0]*len(gs)
                ok=True
                break
        else: gs,tot=groups(rings_of(xg,bk,0.62))
        if tot%5: flags.append((p,'rings',tot))
        used=[0]*len(gs)
        for g in gs: pass
        mk=a['marks'];per=[[] for _ in gs]
        for (mx,my) in mk:
            best=None
            for gi,g in enumerate(gs):
                for si,r in enumerate(g):
                    d=((r[0]-mx)**2+(r[1]-my)**2)**.5
                    if best is None or d<best[0]: best=(d,gi,si,r[2])
            if best and best[0]<40: per[best[1]].append((best[2]+1,best[3]))
        for gi,g in enumerate(gs):
            qn+=1;m=per[gi];qp.append(p)
            if len(m)!=1 or len(g)!=5: flags.append((qn,p,m,len(g)))
            ans.append(m[0][0] if m else 0)
    run.qp=qp
    return ans,flags
if __name__=='__main__':
    bk,N=sys.argv[1],int(sys.argv[2])
    pg=[int(x) for x in sys.argv[3].split(',')] if len(sys.argv)>3 else None
    ans,fl=run(bk,N,pg);print(len(ans),ans);print('flags',fl)
