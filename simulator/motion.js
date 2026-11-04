/** Frame-rate independent grounded locomotion. No visual-only teleporting. */
export class Locomotion{
 constructor(x=400,y=385){this.x=x;this.y=y;this.vx=0;this.vy=0;this.facing=1;this.distance=0;this.target={x,y};this.mode='still';}
 reset(x=400,y=385){Object.assign(this,{x,y,vx:0,vy:0,distance:0,target:{x,y},mode:'still',facing:1});}
 stop(){this.target={x:this.x,y:this.y};this.vx=this.vy=0;this.mode='still';}
 step(dt,{action='observe',species='cat',ball={x:600,y:440},nest=false}={}){
 dt=Math.max(0,Math.min(.05,dt));const entering=action!==this.mode;
 if(entering){this.mode=action;if(action==='wander'){this.target={x:this.x>410?245:545,y:390};}else if(action==='come'){this.target={x:400,y:427};}else if(action==='eat'){this.target={x:615,y:403};}else if(action==='sleep'&&nest){this.target={x:156,y:398};}else if(!['chase','nudge','pounce'].includes(action)){this.target={x:this.x,y:this.y};}}
 if(['chase','nudge','pounce'].includes(action))this.target={x:Math.max(100,Math.min(690,ball.x-35)),y:Math.max(360,Math.min(438,ball.y-22))};
 const dx=this.target.x-this.x,dy=this.target.y-this.y,dist=Math.hypot(dx,dy);const maxSpeed=species==='turtle'?22:['chase','come'].includes(action)?130:70,accel=species==='turtle'?55:340;
 const desiredSpeed=dist<3?0:Math.min(maxSpeed,Math.sqrt(2*accel*dist)*.8);
 const tx=dist?dx/dist*desiredSpeed:0,ty=dist?dy/dist*desiredSpeed:0;
 const dvx=tx-this.vx,dvy=ty-this.vy,dv=Math.hypot(dvx,dvy),blend=dv?Math.min(1,accel*dt/dv):0;this.vx+=dvx*blend;this.vy+=dvy*blend;
 const speed=Math.hypot(this.vx,this.vy),travel=speed*dt;
 if(dist<3&&speed<.5){this.x=this.target.x;this.y=this.target.y;this.vx=this.vy=0;}else if(travel>=dist&&dist>0){this.x=this.target.x;this.y=this.target.y;this.vx=this.vy=0;}else{this.x+=this.vx*dt;this.y+=this.vy*dt;this.distance+=travel;}
 if(Math.abs(this.vx)>8)this.facing=this.vx>0?1:-1;
 return{moving:Math.hypot(this.vx,this.vy)>5,speed:Math.hypot(this.vx,this.vy),facing:this.facing,distance:this.distance};
 }
}
/** One independent clock per animated character. Reset at action boundaries, never use global time. */
export class AnimationClock{
 constructor(){this.action='';this.elapsed=0;this.previous=null;this.transition=1;}
 step(action,dt){if(action!==this.action){this.previous={action:this.action,elapsed:this.elapsed};this.action=action;this.elapsed=0;this.transition=0;}else this.elapsed+=Math.max(0,dt);this.transition=Math.min(1,this.transition+Math.max(0,dt)/.14);return this;}
}
