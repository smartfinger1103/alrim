import subprocess,sys,cv2,numpy as np,glob,os
U='/mnt/user-data/uploads/'
BOOK={'16':(U+'_16차_개정판_고교영어듣기_24회_모의고사_1학년_본문_정답표시O___1_.pdf',U+'_16차_개정판_고교영어듣기_24회_모의고사_1학년_본문_정답표시X___1_.pdf'),
      '17':(U+'17차_개정판_중학영어듣기_2학년_본문_정답O___2_.pdf',U+'17차_개정판_중학영어듣기_2학년_본문_정답X___1_.pdf')}
def render(pdf,p,tag,dpi=130):
    out=f'/tmp/p/w/{tag}'
    subprocess.run(['pdftoppm','-r',str(dpi),'-f',str(p),'-l',str(p),'-png','-singlefile',pdf,out],check=True)
    return cv2.imread(out+'.png')
if __name__=='__main__':
    bk,p=sys.argv[1],int(sys.argv[2])
    o=render(BOOK[bk][0],p,'o');x=render(BOOK[bk][1],p,'x')
    print(o.shape,x.shape)
    d=cv2.absdiff(o,x).max(axis=2)
    m=(d>60).astype(np.uint8)
    n,lab,st,cen=cv2.connectedComponentsWithStats(m,8)
    print(n-1,'blobs')
    vis=o.copy()
    for i in range(1,n):
        a=st[i,4]
        if a<15: continue
        x0,y0,w,h=st[i,:4];cv2.rectangle(vis,(x0-3,y0-3),(x0+w+3,y0+h+3),(0,0,255),1)
    cv2.imwrite('vis.png',vis)
