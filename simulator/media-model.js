/** Pure media contract: exact species/stage identity, no fabricated sleep or gait coverage. */
export const MEDIA_SPECIES=['dog','cat','turtle'];
export const MEDIA_STAGES=['baby','juvenile','adult'];
export const STAGE_LABELS={baby:'幼年',juvenile:'少年',adult:'成年'};
export const REQUIRED_ACTIONS=['idle','eat','play','call','touch','look','happy','sleep_enter','sleep_loop','sleep_exit','walk_left','walk_right','run_left','run_right'];
export function mediaStage(pet){return pet.age<336?'baby':pet.age<1104?'juvenile':'adult';}
export function actionsFor(species){return species==='turtle'?REQUIRED_ACTIONS.filter(a=>!a.startsWith('run_')):REQUIRED_ACTIONS;}
export function coverage(pack,species=pack?.species){const required=actionsFor(species);const have=Object.keys(pack?.clips||{});return{available:have.filter(x=>required.includes(x)),missing:required.filter(x=>!have.includes(x)),total:required.length};}
export function validatePack(pack){const errors=[];if(pack?.format!=='petbud-species-video-v2')errors.push('format必须为petbud-species-video-v2');if(!MEDIA_SPECIES.includes(pack?.species))errors.push('不支持的物种');if(!MEDIA_STAGES.includes(pack?.stage))errors.push('不支持的成长阶段');if(typeof pack?.character_id!=='string'||!pack.character_id.trim())errors.push('缺少固定角色character_id');if(!pack?.clips||typeof pack.clips!=='object'||Array.isArray(pack.clips))errors.push('clips必须为对象');
 for(const [action,c]of Object.entries(pack?.clips||{})){if(!actionsFor(pack.species).includes(action))errors.push(`不支持的动作 ${action}`);if(!c||typeof c!=='object'){errors.push(`${action}:无效条目`);continue;}
 if(typeof c.path!=='string'||!/^([A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(mp4|webm)$/.test(c.path)||c.path.split('/').includes('..'))errors.push(`${action}:需要安全的相对视频路径`);
 if(!Number.isFinite(c.duration)||c.duration<=0||c.duration>60)errors.push(`${action}:duration范围0—60秒`);
 if(!Number.isInteger(c.frames)||c.frames<24)errors.push(`${action}:至少24个真实源帧`);
 if(!Number.isFinite(c.fps)||c.fps<15||c.fps>60)errors.push(`${action}:fps范围15—60`);
 if(!Number.isFinite(c.width)||!Number.isFinite(c.height)||c.width<192||c.height<192||c.width>4096||c.height>4096)errors.push(`${action}:分辨率无效`);
 if(!['black','alpha','opaque'].includes(c.background))errors.push(`${action}:需声明background`);
 if(c.anchor&&(!Array.isArray(c.anchor)||c.anchor.length!==2||c.anchor.some(n=>!Number.isFinite(n)||n<0||n>1)))errors.push(`${action}:anchor必须为[0,1]脚底基准`);
 if(/^(walk|run)_/.test(action)){if(c.background==='opaque')errors.push(`${action}:步态需透明或纯黑背景`);const g=c.gait;if(!g||!Number.isFinite(g.stride_px)||g.stride_px<=0||!Number.isFinite(g.start)||!Number.isFinite(g.end)||g.start<0||g.end<=g.start||g.end>c.duration)errors.push(`${action}:缺少有效的步幅/循环时间范围`);}
 if(action==='sleep_loop'&&c.loop!==true)errors.push('sleep_loop必须显式循环');
 }
 if(!pack?.clips?.idle)errors.push('至少提供idle');return errors;}
export function gaitSample(gait,distance){if(!gait||!Number.isFinite(distance)||distance<0)throw Error('Invalid gait input');const phase=(distance/gait.stride_px)%1;return{phase,time:gait.start+phase*(gait.end-gait.start)};}
export function gaitAction(species,speed,direction){const type=species==='turtle'||speed<100?'walk':'run';return `${type}_${direction<0?'left':'right'}`;}
export function sleepAction(current,requested,clips){if(requested==='sleep'){if(!clips.sleep_loop)return null;return clips.sleep_enter?'sleep_enter':'sleep_loop';}if(requested==='wake')return clips.sleep_exit?'sleep_exit':'idle';if(current==='sleep_enter')return 'sleep_loop';if(current==='sleep_exit')return 'idle';return null;}
