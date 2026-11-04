import sys,cv2,numpy as np,subprocess,json
from ext import BOOK,render
def analyze(bk,p,debug=False):
    o=render(BOOK[bk][0],p,'o');x=render(BOOK[bk][1],p,'x')
    H,W=x.shape[:2]
    d=cv2.absdiff(o,x).max(axis=2);m=(d>60).astype(np.uint8)
    m=cv2.dilate(m,np.ones((3,3),np.uint8))
    n,lab,st,cen=cv2.connectedComponentsWithStats(m,8)
    marks=[(cen[i][0],cen[i][1]) for i in range(1,n) if 150<st[i,4]<2500 and st[i,2]<60 and st[i,3]<60]
    g=cv2.cvtColor(x,cv2.COLOR_BGR2GRAY)
    cs=cv2.HoughCircles(cv2.medianBlur(g,3),cv2.HOUGH_GRADIENT,dp=1,minDist=8,param1=120,param2=14,minRadius=6,maxRadius=10)
    cs=[] if cs is None else [(c[0],c[1]) for c in cs[0]]
    # question numbers: magenta in left strip
    b,gc,r=x[:,:,0].astype(int),x[:,:,1].astype(int),x[:,:,2].astype(int)
    pm=((r>190)&(gc<90)&(b>70)&(b<200)).astype(np.uint8); pm[:,260:]=0
    n2,l2,s2,c2=cv2.connectedComponentsWithStats(cv2.dilate(pm,np.ones((5,9),np.uint8)),8)
    qs=sorted([ (s2[i,1],s2[i,0]) for i in range(1,n2) if s2[i,3]>=28 and s2[i,4]>200])
    return dict(marks=marks,circles=cs,qtops=[q[0] for q in qs],H=H,W=W,o=o,x=x)
if __name__=='__main__':
    a=analyze(sys.argv[1],int(sys.argv[2]))
    print('marks',len(a['marks']),'circles',len(a['circles']),'qtops',a['qtops'])
    vis=a['x'].copy()
    for c in a['circles']: cv2.circle(vis,(int(c[0]),int(c[1])),9,(0,160,0),1)
    for q in a['qtops']: cv2.line(vis,(0,q),(300,q),(255,0,0),2)
    for mk in a['marks']: cv2.circle(vis,(int(mk[0]),int(mk[1])),16,(0,0,255),2)
    cv2.imwrite('vis2.png',vis)
