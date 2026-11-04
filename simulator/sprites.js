/** Codex Pets community atlases. Provenance and commercial-use limits: assets/NOTICE.md. */
export const FRAME_COUNTS=[7,8,8,4,5,8,6,6,6,8,8];
export const ACTION_LABELS={observe:'抬头观察',wander:'慢慢散步',sit:'安静坐着',stretch:'伸展身体',groom:'整理自己',sleep:'安心休息',rest:'低头休息',come:'跑向你',tilt:'好奇歪头',chirp:'轻声回应',chase:'追逐小球',pounce:'轻轻跃起',nudge:'靠近小球',happy:'开心招呼',eat:'低头吃饭',sniff:'闻闻周围',look:'看看远处',wave:'抬爪招呼',jump:'轻轻跳起',memorial:'回忆中的模样'};
export function spriteRow(action,direction=1){if(['come','chase','wander','nudge'].includes(action))return direction>=0?1:2;return{observe:6,sit:0,stretch:4,groom:8,sleep:5,rest:5,tilt:6,chirp:3,pounce:4,happy:3,eat:8,sniff:8,look:direction>=0?9:10,wave:3,jump:4,memorial:0}[action]??0;}
export class PetSprites{constructor(){this.images={};this.errors=[];this.ready=Promise.all(['dog','cat','turtle'].map(kind=>new Promise(resolve=>{const img=new Image();img.onload=()=>{this.images[kind]=img;resolve(true);};img.onerror=()=>{this.errors.push(kind);resolve(false);};img.src=`assets/pets/${kind}-sheet.webp`;})));}
 draw(ctx,{x,y,scale,species,action,time,direction=1,reduced=false}){const img=this.images[species];if(!img){ctx.fillStyle='#7c8c6c';ctx.font='14px sans-serif';ctx.fillText(this.errors.includes(species)?'形象加载失败，请检查本地素材':'小家伙正在赶来…',x-70,y);return;}
 const row=species==='turtle'&&['stretch','jump','pounce'].includes(action)?6:spriteRow(action,direction),count=FRAME_COUNTS[row],fps=['wander','nudge'].includes(action)?7:['chase','come'].includes(action)?11:7;
 const frame=action==='memorial'?6:action==='sleep'?4:reduced?0:Math.floor(time*fps)%count;
 let w=235*scale,h=w*208/192;const sleep=action==='sleep';if(sleep)h*=.86;
 ctx.save();ctx.globalAlpha=action==='memorial'?.65:1;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.beginPath();ctx.ellipse(x,y+68*scale,w*.28,10*scale,0,0,Math.PI*2);ctx.fillStyle='#596a431a';ctx.fill();ctx.drawImage(img,frame*192,row*208,192,208,x-w/2,y+75*scale-h,w,h);ctx.restore();
 if(sleep){ctx.fillStyle='#91a77a';ctx.font='18px Georgia';ctx.fillText('z Z',x+w*.28,y-h*.35);}if(['happy','come','wave'].includes(action)){ctx.fillStyle='#be9284';ctx.font='21px serif';ctx.fillText('♡',x-w*.4,y-h*.45+(reduced?0:Math.sin(time*3)*3));}}
}
