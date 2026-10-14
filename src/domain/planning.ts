import type { Dataset,Obligation,Session } from './types';
import { eligibility,overview } from './evidence';
import { addDays } from './dates';

export interface Priority {
 courseOrder:number;
 withinCourse:number;
 overall:number;
 date:string;
 basis:'missing'|'expired'|'expiring';
}
export interface Assignment {
 employeeId:string; code:string; sessionId:string; late:boolean; reason:string;
 priority:Priority;
 freePlacesBefore:number;
 skipped:{full:number;collision:number;ineligible:number};
}
export interface Unassigned {
 employeeId:string; code:string; reason:string;
 category:'data-review'|'ineligible'|'no-slot';
 priority?:Priority;
}
export interface Proposal {
 assignments:Assignment[]; unassigned:Unassigned[]; reviewed:number; excludedSessions:string[];
 coursePriorities:{code:string;order:number;date:string}[];
}
export function plan(data:Dataset,day:string,horizon=60):Proposal {
 if(!Number.isInteger(horizon)||horizon<1||horizon>180)throw new Error('Horizont musí být 1–180 dní.');
 const until=addDays(day,horizon),assignments:Assignment[]=[],unassigned:Unassigned[]=[];
 const all=overview(data,day).filter(o=>o.required!==false && o.state!=='valid');
 const needs:Obligation[]=[];
 for(const o of all){
  const state=eligibility(o.employee,day);
  if(state!=='active'){
   unassigned.push({employeeId:o.employee.id,code:o.course.code,category:state==='uncertain'?'data-review':'ineligible',reason:{parental:'Rodičovská: návrat není znám.',future:'Budoucí nástup: samostatně ověřit.',ended:'Pracovní poměr již skončil.',uncertain:`Nejasná způsobilost zaměstnance. ${o.employee.issues.join(' ')} Ověřte stav a data pracovního poměru v detailu zaměstnance.`}[state]});
   continue;
  }
  if(o.state==='uncertain'||o.required===null){
   unassigned.push({employeeId:o.employee.id,code:o.course.code,category:'data-review',reason:`Před plánováním je nutné ruční ověření. ${o.warnings.join(' ') || 'Chybí důvěryhodný údaj o platnosti.'} Otevřete detail zaměstnance a zkontrolujte údaje u tohoto školení.`});
   continue;
  }
  needs.push(o);
 }
 const sessions=data.sessions.filter(s=>!s.issues.length && s.status==='plánováno' && s.date && s.date>=day && s.date<=until && s.capacity>s.occupied).sort((a,b)=>a.date!.localeCompare(b.date!) || a.start!-b.start! || a.id.localeCompare(b.id));
 const available=new Map(sessions.map(s=>[s.id,s.capacity-s.occupied]));
 const booked=new Map<string,Session[]>();
 const deadline=(o:Obligation)=>o.expiry??o.employee.start??day;
 const courseDeadline=new Map<string,string>();
 for(const o of needs){const previous=courseDeadline.get(o.course.code);if(!previous||deadline(o)<previous)courseDeadline.set(o.course.code,deadline(o));}
 const courseCodes=[...courseDeadline.keys()].sort((a,b)=>courseDeadline.get(a)!.localeCompare(courseDeadline.get(b)!)||a.localeCompare(b));
 const coursePriorities=courseCodes.map((code,i)=>({code,order:i+1,date:courseDeadline.get(code)!}));
 let overall=0;
 for(const [courseIndex,code] of courseCodes.entries()){
  const orderedNeeds=needs.filter(o=>o.course.code===code).sort((a,b)=>deadline(a).localeCompare(deadline(b))||a.employee.id.localeCompare(b.employee.id));
  for(const [personIndex,o] of orderedNeeds.entries()){
   const priority:Priority={courseOrder:courseIndex+1,withinCourse:personIndex+1,overall:++overall,date:deadline(o),basis:o.state as Priority['basis']};
   const candidates=sessions.filter(s=>s.code===code);
   const onTime=candidates.filter(s=>!o.expiry||s.date!<=o.expiry);
   // Renewal prefers the last date before expiry; urgent cases prefer the earliest.
   const ordered=o.state==='expiring'?[...onTime].reverse().concat(candidates.filter(s=>s.date!>o.expiry!)):candidates;
   let selected:Session|undefined;
   const skipped={full:0,collision:0,ineligible:0};
   for(const s of ordered){
    if(!available.get(s.id)){skipped.full++;continue;}
    if(eligibility(o.employee,s.date!)!=='active'){skipped.ineligible++;continue;}
    if((booked.get(o.employee.id)??[]).some(b=>b.date===s.date&&b.start!<s.end!&&s.start!<b.end!)){skipped.collision++;continue;}
    selected=s;break;
   }
   if(selected){
    const freePlacesBefore=available.get(selected.id)!;
    available.set(selected.id,freePlacesBefore-1);
    const list=booked.get(o.employee.id)??[];list.push(selected);booked.set(o.employee.id,list);
    const late=!!o.expiry&&selected.date!>o.expiry;
    assignments.push({employeeId:o.employee.id,code,sessionId:selected.id,late,priority,freePlacesBefore,skipped,reason:late?'Vybrán nejbližší dostupný termín po konci platnosti; souvislá platnost není zajištěna.':o.state==='expiring'?'Vybrán nejpozdější dostupný termín do konce platnosti včetně posledního dne, aby se školení neopakovalo zbytečně brzy.':'Vybrán nejbližší dostupný termín pro doplnění chybějícího školení.'});
   }else{
    unassigned.push({employeeId:o.employee.id,code,category:'no-slot',priority,reason:!candidates.length?'V horizontu není použitelný termín.':`Návrh nenalezl použitelný termín.${skipped.full?' Kapacita vyčerpána.':''}${skipped.collision?' Časová kolize s jiným navrženým školením.':''}${skipped.ineligible?' Nezpůsobilost v den termínu.':''}`});
   }
  }
 }
 return {assignments,unassigned:unassigned.sort((a,b)=>a.employeeId.localeCompare(b.employeeId)||a.code.localeCompare(b.code)),reviewed:all.length,excludedSessions:data.sessions.filter(s=>!sessions.includes(s)).map(s=>s.id).sort(),coursePriorities};
}
