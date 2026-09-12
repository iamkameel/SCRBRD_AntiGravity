/* Wagon-wheel field geometry and shot-line styling. */

import { D } from './design';

export const CX=150,CY=150,R_IN=48,R_MID=96,R_BND=126;
export const toXY=(deg:number,r:number):[number,number]=>[CX+r*Math.sin(deg*Math.PI/180),CY-r*Math.cos(deg*Math.PI/180)];
export const arcPath=(s:number,e:number,ro:number,ri:number)=>{
  const[ax,ay]=toXY(s,ro);const[bx,by]=toXY(e,ro);
  const[cx,cy]=toXY(s,ri);const[dx,dy]=toXY(e,ri);
  const lg=((e-s+360)%360)>180?1:0;
  return `M${cx} ${cy} L${ax} ${ay} A${ro} ${ro} 0 ${lg} 1 ${bx} ${by} L${dx} ${dy} A${ri} ${ri} 0 ${lg} 0 ${cx} ${cy} Z`;
};
export const piePath=(s:number,e:number,ro:number)=>{
  const[ax,ay]=toXY(s,ro);const[bx,by]=toXY(e,ro);
  const lg=((e-s+360)%360)>180?1:0;
  return `M${CX} ${CY} L${ax} ${ay} A${ro} ${ro} 0 ${lg} 1 ${bx} ${by} Z`;
};
export const SEGS=[
  {id:0,label:'Fine Leg',short:'FLG',angle:27,side:'leg'},
  {id:1,label:'Square Leg',short:'SQL',angle:80,side:'leg'},
  {id:2,label:'Mid Wicket',short:'MWK',angle:117,side:'leg'},
  {id:3,label:'Mid On',short:'MON',angle:148,side:'leg'},
  {id:4,label:'Long On',short:'LON',angle:164,side:'leg'},
  {id:5,label:'Straight',short:'STR',angle:180,side:'neutral'},
  {id:6,label:'Long Off',short:'LOF',angle:196,side:'off'},
  {id:7,label:'Mid Off',short:'MOF',angle:212,side:'off'},
  {id:8,label:'Cover',short:'COV',angle:243,side:'off'},
  {id:9,label:'Point',short:'PNT',angle:280,side:'off'},
  {id:10,label:'Gully',short:'GUL',angle:313,side:'off'},
  {id:11,label:'Third Man',short:'3MN',angle:333,side:'off'},
] as const;
export const SEG_BOUNDS=SEGS.map((_,i)=>{
  const prev=SEGS[(i-1+SEGS.length)%SEGS.length];
  const next=SEGS[(i+1)%SEGS.length];
  const cur=SEGS[i];
  let diff=(cur.angle-prev.angle+360)%360;
  const s=(prev.angle+diff/2+360)%360;
  diff=(next.angle-cur.angle+360)%360;
  const e=(cur.angle+diff/2)%360;
  return{s,e};
});
export const LK_COLS:{[k:string]:string}={'4':D.indigo,'6':D.amber,'1-3':D.emerald,'0':D.textMuted,'W':D.rose,'extras':D.orange};
export const lineKey=(b:any)=>{
  if(b.isWicket||b.type==='W')return'W';
  if(b.extraType==='wide'||b.extraType==='noball'||b.type==='Wd'||b.type==='Nb')return'extras';
  const runs=b.runs??b.value??0;
  if(runs===6)return'6';if(runs===4)return'4';if(runs===0)return'0';return'1-3';
};
export const heatColor=(v:number,mx:number)=>{
  if(!mx||!v)return null;const t=v/mx;
  if(t<.25)return`rgba(16,185,129,${.22+t*2})`;
  if(t<.5)return`rgba(245,158,11,${.3+t*1.2})`;
  if(t<.75)return`rgba(249,115,22,${.38+t})`;
  return`rgba(244,63,94,${.5+t*.5})`;
};
export const wagEnd=(angle:number,b:any):[number,number]=>{
  const runs=b.runs??b.value??0;
  let r;
  if(b.isWicket||b.type==='W')r=28;
  else if(runs===6)r=R_BND+13;
  else if(runs===4)r=R_BND-1;
  else if(runs===3)r=R_MID-10;
  else if(runs===2)r=R_MID-24;
  else if(runs===1)r=R_IN+10;
  else r=R_IN-16;
  return toXY(angle,r);
};

/** Index of the SEGS entry whose centre angle is nearest to `angle`. */
export function inferSegment(angle: number): number {
  return SEGS.reduce((ci, s, i) => {
    const diff = Math.abs(((angle - s.angle) + 360) % 360);
    const cdiff = Math.abs(((angle - SEGS[ci].angle) + 360) % 360);
    return diff < cdiff ? i : ci;
  }, 0);
}
