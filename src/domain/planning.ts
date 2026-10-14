import type { Dataset,Obligation,Session } from './types';
import { eligibility,overview } from './evidence';
import { addDays } from './dates';
export interface Assignment { employeeId:string; code:string; sessionId:string; late:boolean; reason:string }
export interface Unassigned { employeeId:string; code:string; reason:string }
export interface Proposal { assignments:Assignment[]; unassigned:Unassigned[]; reviewed:number; excludedSessions:string[] }
export function plan(data:Dataset,day:string,horizon=60):Proposal {
 if(!Number.isInteger(horizon)||horizon<1||horizon>180)throw new Error('Horizont musí být 1–180 dní.');
 const until=addDays(day,horizon),assignments:Assignment[]=[],unassigned:Unassigned[]=[];
 const all=overview(data,day).filter(o=>o.required!==false && o.state!=='valid');
 const needs:Obligation[]=[];
 for(const o of all){const state=eligibility(o.employee,day);if(state!=='active'){unassigned.push({employeeId:o.employee.id,code:o.course.code,reason:{parental:'Rodičovská: návrat není znám.',future:'Budoucí nástup: samostatně ověřit.',ended:'Pracovní poměr již skončil.',uncertain:'Nejasná způsobilost zaměstnance.'}[state]});continue;}
  if(o.state==='uncertain'||o.required===null){unassigned.push({employeeId:o.employee.id,code:o.course.code,reason:'Nejistá povinnost nebo doklad: nejprve ruční ověření.'});continue;}needs.push(o);
 }
 const sessions=data.sessions.filter(s=>!s.issues.length && s.status==='plánováno' && s.date && s.date>=day && s.date<=until && s.capacity>s.occupied).sort((a,b)=>a.date!.localeCompare(b.date!) || a.start!-b.start! || a.id.localeCompare(b.id));
 const available=new Map(sessions.map(s=>[s.id,s.capacity-s.occupied]));const booked=new Map<string,Session[]>();
 const deadline=(o:Obligation)=>o.expiry??o.employee.start??day;
 const courseDeadline=new Map<string,string>();for(const o of needs){const previous=courseDeadline.get(o.course.code);if(!previous||deadline(o)<previous)courseDeadline.set(o.course.code,deadline(o));}
 const courseCodes=[...courseDeadline.keys()].sort((a,b)=>courseDeadline.get(a)!.localeCompare(courseDeadline.get(b)!)||a.localeCompare(b));
 for(const code of courseCodes) for(const o of needs.filter(o=>o.course.code===code).sort((a,b)=>deadline(a).localeCompare(deadline(b))||a.employee.id.localeCompare(b.employee.id))){
  const candidates=sessions.filter(s=>s.code===code);const onTime=candidates.filter(s=>!o.expiry||s.date!<=o.expiry);
  // Renewal prefers the last date before expiry; urgent cases prefer the earliest.
  const ordered=o.state==='expiring'?[...onTime].reverse().concat(candidates.filter(s=>s.date!>o.expiry!)):candidates;
  let selected:Session|undefined;let full=false,collision=false,ineligible=false;
  for(const s of ordered){if(!available.get(s.id)){full=true;continue;}if(eligibility(o.employee,s.date!)!=='active'){ineligible=true;continue;}
   if((booked.get(o.employee.id)??[]).some(b=>b.date===s.date&&b.start!<s.end!&&s.start!<b.end!)){collision=true;continue;}selected=s;break;
  }
  if(selected){available.set(selected.id,available.get(selected.id)!-1);const list=booked.get(o.employee.id)??[];list.push(selected);booked.set(o.employee.id,list);const late=!!o.expiry&&selected.date!>o.expiry;
   assignments.push({employeeId:o.employee.id,code,sessionId:selected.id,late,reason:late?'Termín po expiraci: neobnovuje souvislou platnost.':o.state==='expiring'?'Nejpozdější dostupná obnova před expirací.':'Nejbližší volný termín pro chybějící nebo prošlé školení.'});
  }else unassigned.push({employeeId:o.employee.id,code,reason:!candidates.length?'V horizontu není použitelný termín.':`Heuristika nenalezla přiřazení.${full?' Kapacita vyčerpána.':''}${collision?' Časová kolize.':''}${ineligible?' Nezpůsobilost v den termínu.':''}`});
 }
 return {assignments,unassigned:unassigned.sort((a,b)=>a.employeeId.localeCompare(b.employeeId)||a.code.localeCompare(b.code)),reviewed:all.length,excludedSessions:data.sessions.filter(s=>!sessions.includes(s)).map(s=>s.id).sort()};
}
