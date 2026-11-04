"""One-time design example generator; not a runtime engine."""
import json, math
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'specs'
def put(name,value):
    (root/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
put('life-config.example.json',{
 'schema_version':1,'config_version':'design-0.1','status':'uncalibrated_design_example',
 'time':{'physiology_step_s':60,'self_care_after_s':43200,'boarding_after_s':86400},
 'stages':[{'id':'newborn','start_s':0},{'id':'infant','start_s':259200},{'id':'juvenile','start_s':1209600},{'id':'maturing','start_s':3024000},{'id':'adult','start_s':3974400}],
 'mortality':{'mode':'shadow','enabled_supported':True,'annual_total_budget_candidate':0.002,'annual_sudden_probability_candidate':0.0002,'sudden_hazard_per_hour':-math.log1p(-0.0002)/8760,'pause_in_boarding':True,'critical_min_window_s':86400},
 'behavior':{'algorithm':'contextual_softmax','temperature':0.7,'fallback':'idle','rng_stream':'behavior'},
 'rng':{'algorithm':'PCG32','version':1,'streams':['behavior','growth','disease','mortality']},
 'economy':{'daily_typical_stars_candidate':50,'daily_cap_candidate':80,'nest_price_candidate':180,'free_basic_treatment':True,'free_replacement_egg':True},
 'species':{
   'dog':{'growth_multiplier':1.0,'allowed_play':['chase','fetch','observe'],'metabolism_multiplier':1.0},
   'cat':{'growth_multiplier':1.0,'allowed_play':['stalk','pounce','bat','observe'],'metabolism_multiplier':0.95},
   'turtle':{'growth_multiplier':0.9,'allowed_play':['approach','nudge','forage','observe'],'metabolism_multiplier':0.7}},
 'notice':'Illustrative subset, not complete runtime configuration. Disease rates and physiology constants require calibration.'})
put('pet-state.example.json',{
 'schema_version':1,'pet_id':'pet_demo_001','species':'dog','name':'小y','writer_epoch':1,'device_seq':42,
 'config_version':'design-0.1','core_version':'unimplemented','born_at':'2026-11-04T06:00:00Z','bio_age_s':3600,'lifecycle':'alive',
 'physiology':{'satiety':0.8,'hydration':0.9,'energy':0.7,'sleep_debt':0.1,'hygiene':0.9,'health':1.0},
 'growth':{'development':0.01,'mass_ratio':0.12,'coordination':0.1,'coat_stage':0},
 'psychology':{'valence':0.6,'arousal':0.4,'security':0.5,'attachment':0.1},
 'disease':None,'current_action':'observe','boarding':False,
 'rng':{'algorithm':'PCG32','state_encoding':'illustrative_hex','streams':{s:{'state':'0000000000000001','increment':hex(2*i+1),'draw_count':0} for i,s in enumerate(['behavior','growth','disease','mortality'])}},
 'note':'PRNG values are structural placeholders, not seed initialization or golden test vectors.'})
put('event.example.json',{'schema_version':1,'event_id':'evt_demo_0042','pet_id':'pet_demo_001','writer_epoch':1,'seq':42,'command_id':'cmd_demo_feed_01','type':'food_consumed','logical_time_s':3600,'occurred_at':'2026-11-04T07:00:00Z','config_version':'design-0.1','previous_event_hash':'placeholder_not_valid_hash','payload':{'food_type':'basic_meal','portion':0.2,'reason_code':'USER_FEED','reward_stars':5},'note':'Hash and signature omitted from this non-production example.'})
put('ble-message.example.json',{'v':1,'type':'PLAY_READY','message_id':'msg_demo_01','session_id':'session_demo_01','seq':3,'ack':2,'payload':{'encounter_id':'enc_demo_01','action_id':'greeting_gentle','shared_seed':12345,'start_after_ms':500,'pet_public':{'species':'dog','display_name':'小y','coat':'cream'}}})
put('transfer.example.json',{'transfer_id':'tr_demo_01','sender_pet_id':'pet_demo_001','recipient_pet_id':'pet_demo_002','item_instance_id':'item_ball_001','item_version':3,'status':'RESERVED','expires_at':'2026-11-04T07:10:00Z','allowed_transitions':{'CREATED':['RESERVED'],'RESERVED':['COMMITTED','CANCELLED','EXPIRED'],'COMMITTED':[],'CANCELLED':[],'EXPIRED':[]}})
