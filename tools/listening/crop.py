import sys,os,cv2,numpy as np,subprocess,json
from ext import BOOK
from auto2 import pages_for,run
def qboxes(x,bk,first):
    H,W=x.shape[:2]
    if bk=='17' and first and W>1500: x=x[:,:W//2]
    b,g,r=x[:,:,0].astype(int),x[:,:,1].astype(int),x[:,:,2].astype(int)
    m=((r>185)&(g<130)&(b<170)&(r-g>90)&((b>85) if bk=='17' else True)).astype(np.uint8);m[:,270 if bk=='16' else 215]=0 if False else 0;m[:,(270 if bk=='16' else 215):]=0
    if bk=='17' and first: m[:300,:]=0
    if bk=='16' and first: m[:300,:]=0
    n,l,st,c=cv2.connectedComponentsWithStats(cv2.dilate(m,np.ones((5,17),np.uint8)),8)
    ys=sorted(st[i,1] for i in range(1,n) if st[i,3]>=30 and st[i,2]>=18 and st[i,4]>250)
    ml=((r>185)&(g<130)&(b<170)&(r-g>90)&((b>85) if bk=='17' else True)).astype(np.uint8);ml[:,270:]=0
    if bk=='17' and first: ml[:300,:]=0
    if bk=='16' and first: ml[:300,:]=0
    n2,l2,st2,c2=cv2.connectedComponentsWithStats(cv2.dilate(ml,np.ones((7,25),np.uint8)),8)
    labs=sorted(st2[i,1] for i in range(1,n2) if st2[i,2]>=60 and 10<=st2[i,3]<34 and st2[i,1]>(380 if first else 150))
    return ys,labs,H,W
def crops(bk,N,out):
    run(bk,N);qp=run.qp;pages=pages_for(bk,N);k=0;res=[]
    os.makedirs(out,exist_ok=True)
    for pi,p in enumerate(pages):
        subprocess.run(['pdftoppm','-r','130','-f',str(p),'-l',str(p),'-png','-singlefile',BOOK[bk][1],'/tmp/p/w/cx'],check=True)
        x=cv2.imread('/tmp/p/w/cx.png');first=pi==0
        subprocess.run(['pdftoppm','-r','195','-f',str(p),'-l',str(p),'-png','-singlefile',BOOK[bk][1],'/tmp/p/w/cy'],check=True)
        hi=cv2.imread('/tmp/p/w/cy.png');SC=hi.shape[1]/x.shape[1]
        ys,labs,H,W=qboxes(x,bk,first);want=qp.count(p)
        if len(ys)!=want: res.append(('MISMATCH',p,len(ys),want));
        X0,X1=120,(W//2-60 if (bk=='17' and first and W>1500) else W-100)
        bottom=1303
        for i,y in enumerate(ys[:want]):
            def start(j):
                L=[l for l in labs if ys[j]-140<l<ys[j]-5]
                return (L[0]-14) if L else ys[j]-40
            top=max(0,start(i));bot=(start(i+1)-8) if i+1<len(ys) else bottom
            im=hi[int(top*SC):int(bot*SC),int(X0*SC):int(X1*SC)]
            gr=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY);rows=np.where((gr<205).sum(axis=1)>0)[0]
            if len(rows): im=im[max(0,rows[0]-12):rows[-1]+18]
            gr=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY);cols=np.where((gr<205).sum(axis=0)>0)[0]
            if len(cols): im=im[:,max(0,cols[0]-14):cols[-1]+16]
            k+=1;cv2.imwrite(f'{out}/{k:02d}.jpg',im,[cv2.IMWRITE_JPEG_QUALITY,70])
    return k,res
if __name__=='__main__':
    bk,N=sys.argv[1],int(sys.argv[2]);out=sys.argv[3]
    print(crops(bk,N,out))
