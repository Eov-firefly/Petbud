/** Independent Petbud browser reference engine. No third-party pet assets or code. */
export const SPECIES={dog:{label:'小狗',hint:'热情的小尾巴，想陪你看世界',color:'#d5a277'},cat:{label:'小猫',hint:'好奇的小耳朵，藏着自己的主意',color:'#a0aabc'},turtle:{label:'小龟',hint:'慢一点也没关系，一起长大吧',color:'#83a687'}};
const clamp=(v,a=0,b=100)=>Math.min(b,Math.max(a,v));
export function random(p,stream='behavior') {let x=p.rng[stream]>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;p.rng[stream]=x>>>0;return (x>>>0)/4294967296;}
export function createPet(species,seed=Date.now(),now=Date.now()) {if(!SPECIES[species])throw Error('Unknown species');let s=(seed>>>0)||1;const p={version:1,id:`pet-${now}-${s}`,species,name:'小芽',age:0,lastReal:now,alive:true,health:100,satiety:82,energy:85,hygiene:90,mood:75,bond:5,stars:0,day:0,rewardToday:0,poop:0,nest:false,ill:false,criticalHours:0,action:'observe',actionUntil:0,traits:{},rng:{behavior:s,growth:(s^0x9e3779b9)||2,disease:(s^0x85ebca6b)||3,mortality:(s^0xc2b2ae35)||4},memories:[],friend:null,boarding:false,mortality:'shadow',shadowDeaths:0,cooldowns:{},habits:{ball:0,walk:0},claim:null};p.traits={energy:random(p,'growth'),social:random(p,'growth'),curiosity:random(p,'growth')};remember(p,'born',`一颗魔法蛋里，住进了新的小生命。`);return p;}
export function stage(p){return p.age<72?'初生期':p.age<336?'幼年期':p.age<840?'少年期':p.age<1104?'成长期':'成年期';}
export function remember(p,type,text){p.memories.unshift({id:`${p.id}-${p.age}-${p.memories.length}-${type}`,age:p.age,type,text});p.memories=p.memories.slice(0,80);}
export function reward(p,n){const day=Math.floor(p.age/24);if(day!==p.day){p.day=day;p.rewardToday=0;}const gain=Math.min(n,80-p.rewardToday);p.stars+=gain;p.rewardToday+=gain;return gain;}
export function choose(p,context='idle'){if(!p.alive)return 'memorial';if(p.boarding)return 'sleep';let choices;
if(p.ill)choices=[['rest',5],['observe',2],['sleep',4]];
else if(p.energy<20)choices=[['sleep',7],['stretch',2],['observe',1]];
else if(context==='call')choices=[['come',3+5*p.traits.social],['tilt',3],['stretch',2],['chirp',1]];
else if(context==='ball')choices=[['chase',p.species==='turtle'?0:3+p.traits.energy*4+p.habits.ball*.03],['observe',2],['pounce',p.species==='cat'?4:0],['nudge',p.species==='turtle'?7:0]];
else choices=[['wander',2+p.traits.curiosity*3],['sit',3],['stretch',1],['groom',p.species==='cat'?3:1],['observe',2],['sleep',p.energy<50?3:0]];
choices=choices.map(([a,w])=>[a,a===p.action?w*.35:w]);let n=random(p)*choices.reduce((a,[,w])=>a+w,0);for(const [a,w]of choices){n-=w;if(n<=0)return a;}return choices.at(-1)[0];}
function die(p,reason){p.alive=false;p.action='memorial';p.death={age:p.age,reason};remember(p,'death',reason);}
export function advance(p,hours,{unattended=false}={}){if(!Number.isFinite(hours)||hours<0||hours>24*366)throw Error('Invalid elapsed time');if(!p.alive)return;const oldStage=stage(p);let left=hours;let elapsed=0;
while(left>0&&p.alive){const h=Math.min(left,.25);left-=h;elapsed+=h;p.age+=h;
// Unattended catch-up becomes protected boarding; live simulation can also enter it explicitly.
if(unattended&&elapsed>12)p.boarding=true;
if(p.boarding){p.energy=clamp(p.energy+8*h);p.satiety=Math.max(55,p.satiety);continue;}
const sleeping=p.action==='sleep';p.satiety=clamp(p.satiety-(1.0+p.traits.energy*.3)*h);p.energy=clamp(p.energy+(sleeping?9:-1.1)*h);p.hygiene=clamp(p.hygiene-.55*h);p.mood=clamp(p.mood+(p.satiety<15?-1.5:-.15)*h);
if(p.poop<3&&random(p,'disease')<1-Math.exp(-.045*h))p.poop++;
const stress=(p.satiety<12?5:0)+(p.hygiene<20?3:0)+(p.energy<10?3:0);
if(!p.ill&&random(p,'disease')<1-Math.exp(-(.0008+stress*.0015)*h)){p.ill=true;remember(p,'ill','今天有些不舒服，需要温柔的护理。');}
if(p.ill){p.health=clamp(p.health-(.2+stress*.12)*h);if(p.health<20)p.criticalHours+=h;else p.criticalHours=0;}
else p.health=clamp(p.health+.8*h);
const sudden=-Math.log1p(-.0002)/8760;const hazard=sudden+(p.criticalHours>=24?.0005:0);
if(random(p,'mortality')<1-Math.exp(-hazard*h)){if(p.mortality==='enabled')die(p,p.criticalHours>=24?'严重疾病后离世。':'极罕见的生命意外。');else p.shadowDeaths++;}
}
if(stage(p)!==oldStage&&p.alive)remember(p,'growth',`悄悄长大了，进入${stage(p)}。`);
}
export function interact(p,kind,now=Date.now()){if(!p.alive)return {ok:false,text:'它的故事留在回忆里。准备好时，可以免费领取新蛋。'};if(p.boarding&&kind!=='board')return{ok:false,text:'正在安心托管，先接它回家吧。'};if((p.cooldowns[kind]||0)>now)return{ok:false,text:'慢慢来，让它享受一下刚才的时光。'};let text='',gain=0,action='happy';
switch(kind){case'feed':if(p.satiety>92)return{ok:false,text:'小肚子饱饱的，先留着下一顿吧。'};p.satiety=clamp(p.satiety+25);p.mood=clamp(p.mood+4);text='认真吃饭，最后还舔了舔嘴。';gain=5;action='eat';break;
case'pet':p.bond=clamp(p.bond+.8);p.mood=clamp(p.mood+7);text=p.traits.social>.5?'主动把脑袋凑到了你的手心。':'起初有点害羞，慢慢放松下来。';gain=3;action=random(p)<.5?'happy':'tilt';break;
case'clean':if(!p.poop&&p.hygiene>95)return{ok:false,text:'小房间已经很干净啦。'};p.poop=0;p.hygiene=100;text='小房间又清清爽爽啦。';gain=4;action='happy';break;
case'sun':p.mood=clamp(p.mood+6);text='窝在暖暖的光里，舒服地伸了个懒腰。';gain=3;action='stretch';break;
case'sleep':p.action=p.action==='sleep'?'stretch':'sleep';text=p.action==='sleep'?'把世界调小一点，做个好梦。':'揉揉眼睛，又是新的小冒险。';action=p.action;break;
case'treat':if(!p.ill)return{ok:false,text:'检查完毕，身体状态不错，不需要用药。'};p.health=clamp(p.health+22);p.energy=clamp(p.energy+8);if(p.health>=65){p.ill=false;p.criticalHours=0;text='护理后恢复了精神，接下来好好休息。';}else text='接受了护理，身体在慢慢恢复。';action='rest';break;
case'call':action=choose(p,'call');text={come:'听见你的声音，开心地跑了过来。',tilt:'歪了歪头：是在叫我吗？',stretch:'先伸个懒腰，再慢慢靠近。',chirp:'远远地轻轻回应了一声。',sleep:'困得只动了动耳朵。',rest:'抬起头，轻轻回应你。',observe:'抬头看向你。'}[action]||'听见啦，正看着你。';p.bond=clamp(p.bond+.3);break;
case'walk':if(p.energy<12)return{ok:false,text:'有点累啦，休息后再出门。'};p.energy=clamp(p.energy-7);p.mood=clamp(p.mood+9);p.habits.walk++;text='一起散了会儿步，把今天的风也装进回忆。';gain=8;action='wander';break;
case'ball':action=choose(p,'ball');p.energy=clamp(p.energy-2);p.mood=clamp(p.mood+3);p.habits.ball++;text={chase:'追着小球跑，想把它带回来。',observe:'盯着小球，似乎在打自己的小算盘。',pounce:'伏低身体，准备来一次漂亮的扑击。',nudge:'慢慢靠近，用小脑袋顶了顶球。',sleep:'太困了，等睡醒了再玩吧。',rest:'今天想安静地休息。'}[action]||'看着小球轻轻弹起。';gain=2;break;
case'nest':if(p.nest)return{ok:false,text:'小窝已经在这里啦。'};if(p.stars<180)return{ok:false,text:`小窝需要180颗陪伴星，还差${180-p.stars}颗。`};p.stars-=180;p.nest=true;text='有自己的小窝啦！今晚会做个好梦。';break;
case'board':p.boarding=!p.boarding;action=p.boarding?'sleep':'stretch';text=p.boarding?'安心托管中，基本状态和生命风险受到保护。':'欢迎回家，我们继续一起生活。';break;
default:return{ok:false,text:'未知操作'};}
p.action=action;p.cooldowns[kind]=now+({call:3000,pet:4000,feed:15000,sun:15000,walk:20000,ball:1000,treat:10000}[kind]||1000);gain=reward(p,gain);if(!['call','ball'].includes(kind))remember(p,kind,text);return{ok:true,text,gain,action};}
export function meet(p,now=Date.now()){if(!p.alive||p.boarding)return{ok:false,text:'先回到日常生活，再邀请朋友吧。'};if((p.cooldowns.meet||0)>now)return{ok:false,text:'朋友刚刚来过，稍等一会儿再见面。'};p.cooldowns.meet=now+15000;let first=!p.friend;if(first)p.friend={id:'virtual-mochi',name:'糯米',visits:0,gifts:0};p.friend.visits++;p.mood=clamp(p.mood+8);p.action=p.traits.social>.5?'happy':'tilt';const text=first?'认识了模拟朋友糯米，先试探着打了个招呼。':`又遇见糯米啦，这是第${p.friend.visits}次见面。`;remember(p,'friend',text);return{ok:true,text};}
export function gift(p,now=Date.now()){if(!p.friend)return{ok:false,text:'先认识一位朋友吧。'};if((p.cooldowns.gift||0)>now)return{ok:false,text:'礼物已经送到啦，稍后再分享。'};p.cooldowns.gift=now+30000;p.friend.gifts++;remember(p,'gift','把散步捡到的小叶子送给糯米，留下一段共同回忆。');return{ok:true,text:'送出一片小叶子，糯米轻轻蹭了蹭你。'};}
export function validate(p){if(!p||p.version!==1||!SPECIES[p.species]||typeof p.alive!=='boolean'||typeof p.name!=='string'||p.name.length>80||!Number.isFinite(p.age)||p.age<0||p.age>24*366*100||!Number.isFinite(p.lastReal)||!Number.isFinite(p.stars)||p.stars<0||!Array.isArray(p.memories)||p.memories.length>80)return false;for(const k of ['satiety','energy','hygiene','mood','health','bond'])if(!Number.isFinite(p[k])||p[k]<0||p[k]>100)return false;for(const k of ['behavior','growth','disease','mortality'])if(!Number.isInteger(p.rng?.[k])||p.rng[k]<=0||p.rng[k]>0xffffffff)return false;return !!p.traits&&Object.values(p.traits).every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&!!p.cooldowns&&!!p.habits&&p.memories.every(m=>typeof m.text==='string'&&Number.isFinite(m.age));}
