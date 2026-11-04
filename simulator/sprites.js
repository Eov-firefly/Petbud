/** Codex Pets community atlases. Provenance and commercial-use limits: assets/NOTICE.md. */
export const FRAME_COUNTS=[7,8,8,4,5,8,6,6,6,8,8];
export const ACTION_LABELS={observe:'抬头观察',wander:'慢慢散步',sit:'安静坐着',stretch:'伸展身体',groom:'整理自己',sleep:'安心休息',rest:'低头休息',come:'跑向你',tilt:'好奇歪头',chirp:'轻声回应',chase:'追逐小球',pounce:'轻轻跃起',nudge:'靠近小球',happy:'开心招呼',eat:'低头吃饭',sniff:'闻闻周围',look:'看看远处',wave:'抬爪招呼',jump:'轻轻跳起',memorial:'回忆中的模样'};
export function spriteRow(action,direction=1){if(['come','chase','wander','nudge'].includes(action))return direction>=0?1:2;return{observe:6,sit:0,stretch:4,groom:8,sleep:5,rest:5,tilt:6,chirp:3,pounce:4,happy:3,eat:8,sniff:8,look:direction>=0?9:10,wave:3,jump:4,memorial:0}[action]??0;}
export class PetSprites{constructor(){this.images={};this.errors=[];this.ready=Promise.all(['dog','cat','turtle'].map(kind=>new Promise(resolve=>{const img=new Image();img.onload=()=>{this.images[kind]=img;resolve(true);};img.onerror=()=>{this.errors.push(kind);resolve(false);};img.src=`assets/pets/${kind}-sheet.webp`;})));}
 draw(ctx,{x,y,scale,species,action,time,direction=1,reduced=false,clock=null,moving=false,distance=0,speed=0}){const img=this.images[species];if(!img){ctx.fillStyle='#7c8c6c';ctx.font='14px sans-serif';ctx.fillText('形象正在加载…',x-60,y);return;}
 const visual=moving?'locomotion':action;
 const rowFor=a=>a==='locomotion'?(direction>=0?1:2):species==='turtle'&&['stretch','jump','pounce'].includes(a)?6:spriteRow(a,direction);
 const frameFor=(a,elapsed)=>{const row=rowFor(a),count=FRAME_COUNTS[row];if(a==='memorial')return 6;if(a==='sleep')return 4;if(reduced)return 0;
 if(a==='locomotion')return Math.floor(distance/(species==='turtle'?6:14))%count;
 // Idle mostly holds a relaxed pose; blinking/look beats have pauses rather than constant twitching.
 if(['sit','observe','tilt','look','rest'].includes(a)){const cycle=elapsed%5.5;if(cycle<3.1)return 0;return Math.min(count-1,Math.floor((cycle-3.1)*count/2.4));}
 const fps=['happy','wave','chirp'].includes(a)?5:6;
 if(['jump','stretch','pounce','wave','happy'].includes(a))return Math.min(count-1,Math.floor(elapsed*fps));
 return Math.floor(elapsed*fps)%count;};
 let w=235*scale,h=w*208/192;const top=y+75*scale-h;ctx.save();ctx.globalAlpha=action==='memorial'?.65:1;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.beginPath();ctx.ellipse(x,y+68*scale,w*.26,8*scale,0,0,Math.PI*2);ctx.fillStyle='#596a4314';ctx.fill();
 const paint=(a,elapsed,alpha)=>{const row=rowFor(a),frame=frameFor(a,elapsed);ctx.globalAlpha*=alpha;ctx.drawImage(img,frame*192,row*208,192,208,x-w/2,top,w,h);ctx.globalAlpha/=alpha||1;};
 const elapsed=clock?.elapsed??time;
 // Brief dissolve only between still poses. Locomotion frames remain crisp and footfall-driven.
 if(!moving&&clock?.previous?.action&&clock.transition<1){paint(clock.previous.action,clock.previous.elapsed,1-clock.transition);paint(visual,elapsed,clock.transition||.001);}else paint(visual,elapsed,1);
 ctx.restore();if(action==='sleep'){ctx.fillStyle='#91a77a';ctx.font='15px Georgia';ctx.fillText('z',x+w*.3,y-h*.35);}
 }
}
