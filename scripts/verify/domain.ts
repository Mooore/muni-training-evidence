import {readFileSync,writeFileSync} from 'node:fs';
import type {Dataset} from '../../src/domain/types';
import {overview,eligibility} from '../../src/domain/evidence';
import {plan} from '../../src/domain/planning';
const source=JSON.parse(readFileSync('data/demo.json','utf8')) as Dataset;
const results=[];
for(const scale of [1,10]){
 const d={...source,employees:Array.from({length:scale},(_,i)=>source.employees.map(e=>({...e,id:e.id+'-'+i}))).flat(),completions:Array.from({length:scale},(_,i)=>source.completions.map(c=>({...c,id:c.id+'-'+i,employeeId:c.employeeId+'-'+i}))).flat(),sessions:source.sessions.map(s=>({...s,capacity:s.capacity*scale,occupied:s.occupied*scale}))};
 const begin=performance.now();const obligations=overview(d,'2026-10-01');const evaluated=performance.now();const proposal=plan(d,'2026-10-01');const planned=performance.now();
 for(const s of d.sessions)if(proposal.assignments.filter(a=>a.sessionId===s.id).length>Math.max(0,s.capacity-s.occupied))throw Error('Capacity violated');
 const seen=new Set<string>();for(const a of proposal.assignments){const key=a.employeeId+'|'+a.code;if(seen.has(key))throw Error('Duplicate');seen.add(key);const s=d.sessions.find(s=>s.id===a.sessionId)!;const e=d.employees.find(e=>e.id===a.employeeId)!;if(s.issues.length||s.status!=='plánováno'||eligibility(e,s.date!)!=='active')throw Error('Invalid eligibility/session');}
 const booked=new Map<string,typeof d.sessions>();for(const a of proposal.assignments){const s=d.sessions.find(s=>s.id===a.sessionId)!;const list=booked.get(a.employeeId)??[];if(list.some(b=>b.date===s.date&&b.start!<s.end!&&s.start!<b.end!))throw Error('Collision');list.push(s);booked.set(a.employeeId,list);}
 const reversed=plan({...d,employees:[...d.employees].reverse(),courses:[...d.courses].reverse(),completions:[...d.completions].reverse(),sessions:[...d.sessions].reverse()},'2026-10-01');if(JSON.stringify(proposal)!==JSON.stringify(reversed))throw Error('Not deterministic');
 results.push({scale,employees:d.employees.length,completions:d.completions.length,obligations:obligations.length,overviewMs:evaluated-begin,planningMs:planned-evaluated,assignments:proposal.assignments.length,unassigned:proposal.unassigned.length,invariants:'capacity, unique employee/course, collisions, eligibility, cancellation, deterministic permutation passed'});
}
console.log(JSON.stringify(results,null,2));if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify({timestamp:new Date().toISOString(),environment:process.version,results},null,2));
