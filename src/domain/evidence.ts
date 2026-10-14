import type { Employee, Course, Completion, Dataset, Obligation } from './types';
import { addDays } from './dates';
export function eligibility(e:Employee,day:string):'active'|'parental'|'future'|'ended'|'uncertain' {
 if(e.issues.length || !e.start || (e.end && e.end<e.start)) return 'uncertain';
 if(e.start>day) return 'future';
 if(e.end && e.end<day) return 'ended';
 if(e.status==='rodičovská') return 'parental';
 if(e.status==='ukončen' && !e.end) return 'uncertain';
 if(e.status==='ukončen' && e.end && e.end>=day) return 'uncertain';
 return e.status==='aktivní' ? 'active':'uncertain';
}
export function required(e:Employee,c:Course):boolean|null {
 if(c.issues.length) return null;
 if(c.requirement==='VSICHNI') return true;
 if(c.requirement==='NEPOVINNE') return false;
 const [kind,list]=c.requirement.split(':');
 if(kind==='UTVAR') return e.department ? list.split(';').includes(e.department):null;
 if(kind==='POZICE') return e.position ? list.split(';').includes(e.position):null;
 return null;
}
export function assess(e:Employee,c:Course,records:Completion[],day:string):Obligation {
 const mandatory=required(e,c); const warnings:string[]=[];
 const candidates=records.filter(x=>x.employeeId===e.id && x.code===c.code);
 const trusted=candidates.filter(x=>!x.issues.length && x.date && x.date<=day).sort((a,b)=>(b.date!).localeCompare(a.date!) || a.id.localeCompare(b.id));
 const completion=trusted[0]??null;
 if(candidates.some(x=>x.issues.length)) warnings.push('Existují problematické doklady; viz audit.');
 if(candidates.some(x=>x.date && x.date>day)) warnings.push('Budoucí absolvování není dokončeným školením.');
 if(mandatory===null) warnings.push('Povinnost nelze spolehlivě určit.');
 if(completion?.derivedExpiry) warnings.push('Platnost dopočítána podle katalogu.');
 let state:Obligation['state'];const expiry=completion?.expiry??null;
 if(mandatory===null || c.issues.length) state='uncertain';
 else if(!completion) state=candidates.some(x=>x.issues.length)?'uncertain':'missing';
 else if(c.months===0 || (c.months===null && mandatory===false)) state='valid';
 else if(!expiry) state='uncertain';
 else state=expiry<day?'expired':expiry<=addDays(day,60)?'expiring':'valid';
 return {employee:e,course:c,required:mandatory,state,expiry,completion,warnings};
}
export function overview(data:Dataset,day:string):Obligation[] {
 const index=new Map<string,Completion[]>();
 for(const row of data.completions) { const key=row.employeeId+'|'+row.code; const list=index.get(key)??[];list.push(row);index.set(key,list); }
 return data.employees.flatMap(e=>data.courses.map(c=>assess(e,c,index.get(e.id+'|'+c.code)??[],day)));
}
