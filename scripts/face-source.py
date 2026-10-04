"""
The face diagram's source image: `npm run face:source`.

Renders `features/my-skin/assets/source/LeePerrySmith.glb` (a free head scan,
CC BY 3.0, see CREDITS.md beside it) as a front view of light lines on black,
856 x 976, which is what `scripts/face-art.mjs` traces. Added 4 Oct 2026 to
replace a wireframe head found on Pinterest ("just use free images").

A scan is a dense triangle mesh, and drawn as triangles it reads as noise
round the eyes and mouth. So the lines are not the mesh's edges: the surface
is cut by two families of angles about a point behind the face (longitudes
about the vertical axis, latitudes about the horizontal one), which gives the
curved quad grid a modelled head has, plus the edges where the surface folds
(eyelids, nostrils, lips) so the features read. Hidden lines are removed with
an id buffer. Each line's brightness rises toward the rim, which face-art.mjs
keeps as the stroke's opacity.

The head is framed crown at row 10, chin at the bottom edge (face-art.mjs
expects the image cut at the chin and draws the neck itself). On the result
the eyes are row 510, the lips 757 and the centre column 428: those are
`SOURCE` in face-art.mjs, and they move if anything here does.

Needs numpy and Pillow.
"""
import json, struct, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "features/my-skin/assets/source"

def load_glb(path):
  b = path.read_bytes()
  n = struct.unpack("<I", b[12:16])[0]
  js = json.loads(b[20:20 + n])
  o = 20 + n
  binary = b[o + 8:o + 8 + struct.unpack("<I", b[o:o + 4])[0]]
  prim = js["meshes"][0]["primitives"][0]
  def acc(i):
    a = js["accessors"][i]; v = js["bufferViews"][a["bufferView"]]
    dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16}[a["componentType"]]
    w = {"SCALAR": 1, "VEC2": 2, "VEC3": 3}[a["type"]]
    arr = np.frombuffer(binary, dtype=dt, count=a["count"] * w, offset=v.get("byteOffset", 0) + a.get("byteOffset", 0))
    return arr.reshape(-1, w) if w > 1 else arr
  return acc(prim["attributes"]["POSITION"]).astype(np.float64), acc(prim["indices"]).reshape(-1, 3).astype(np.int64)

P, I = load_glb(SRC / "LeePerrySmith.glb")
# px per scan unit, the crown's height, the centre column, the chin's height
k, top, cxm, chin = 202.36, 4.1075773, 0.0, -0.66609347
W, H = 856, 976
# slice centre behind the face (z), latitude origin (y), degrees between lines,
# and how sharp a fold must be to draw (cosine between the two faces)
ZC, YC, STEP, FOLD = -1.0, 1.0, 3.4, 0.80
x,y,z=P[:,0],P[:,1],P[:,2]
X=(x-cxm)*k+W/2; Y=(top-y)*k+10
a,b,c=P[I[:,0]],P[I[:,1]],P[I[:,2]]
n=np.cross(b-a,c-a); nn=n/np.linalg.norm(n,axis=1,keepdims=True)
front=nn[:,2]>0.02
zc=(a[:,2]+b[:,2]+c[:,2])/3; yc=(a[:,1]+b[:,1]+c[:,1])/3
keep=front & ~((yc<chin+0.9) & (zc<0.6))
# id buffer: painter's, back to front, front-facing only (back faces fill too, to occlude)
idb=Image.new('I',(W,H),-1); d=ImageDraw.Draw(idb)
for t in np.argsort(zc):
  i0,i1,i2=I[t]
  d.polygon([(X[i0],Y[i0]),(X[i1],Y[i1]),(X[i2],Y[i2])],fill=int(t) if keep[t] else -1)
ID=np.asarray(idb)
# slicing by angle about a centre behind the face: longitudes (about the
# vertical axis) and latitudes (about the horizontal axis), so the lines bend
# with the face the way a modelled mesh's loops do
F=[np.degrees(np.arctan2(x-cxm, z-ZC)), np.degrees(np.arctan2(y-YC, z-ZC))]
vals=np.arange(-120,120,STEP)+STEP/2
S=3
img=Image.new('L',(W*S,H*S),0); dr=ImageDraw.Draw(img)
def seg_for(t,axis,val):
  f=F[axis]; idx=I[t]; pts=[]
  for j in range(3):
    i,q=idx[j],idx[(j+1)%3]; fp,fq=f[i]-val,f[q]-val
    if fp==fq: continue
    if (fp<=0<fq) or (fq<=0<fp):
      s_=fp/(fp-fq); pts.append(P[i]+(P[q]-P[i])*s_)
  return pts if len(pts)==2 else None
def visible(t,pt):
  px=int((pt[0]-cxm)*k+W/2); py=int((top-pt[1])*k+10)
  if not(0<=px<W and 0<=py<H): return False
  win=ID[max(0,py-1):py+2,max(0,px-1):px+2]
  return (win==t).any()
for t in np.nonzero(keep)[0]:

  # rim glow: brighter where the surface turns away
  g=0.35+0.65*(1-nn[t,2])**0.6
  for axis in (0,1):
    fv=F[axis][I[t]]; lo,hi=fv.min(),fv.max()
    for val in vals[(vals>=lo)&(vals<=hi)]:
      s=seg_for(t,axis,val)
      if not s: continue
      p,q=s; m=(p+q)/2
      if not visible(t,m): continue
      dr.line([(((p[0]-cxm)*k+W/2)*S,((top-p[1])*k+10)*S),(((q[0]-cxm)*k+W/2)*S,((top-q[1])*k+10)*S)],fill=int(255*g),width=int(1.6*S))
# feature lines: mesh edges where the surface folds (eyelids, lips, nostrils)
E=defaultdict(list)
for t in range(len(I)):
  for j in range(3):
    e=tuple(sorted((I[t,j],I[t,(j+1)%3]))); E[e].append(t)
for (u,v),ts in E.items():
  if len(ts)!=2: continue
  t1,t2=ts
  if not(keep[t1] or keep[t2]): continue
  if np.dot(nn[t1],nn[t2])>FOLD: continue
  m=(P[u]+P[v])/2
  if not(visible(t1,m) or visible(t2,m)): continue
  dr.line([(X[u]*S,Y[u]*S),(X[v]*S,Y[v]*S)],fill=200,width=int(1.4*S))
img=img.resize((W,H),Image.LANCZOS)
glow=img.filter(ImageFilter.GaussianBlur(4))
out=np.clip(np.asarray(img,float)+np.asarray(glow,float)*0.7,0,255).astype('uint8')
Image.fromarray(out).save(SRC / 'head-wire.png')
print('wrote', SRC / 'head-wire.png')
