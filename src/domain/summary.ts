import type {Employee,Obligation,State} from './types';
export interface Summary {
 total:number;
 fulfilled:number;
 needsAttention:number;
 states:Record<State,{people:number;obligations:number}>;
}
/** People in the progress indicator are disjoint; people in task categories may overlap. */
export function summarize(employees:Employee[],obligations:Obligation[]):Summary {
 const byPerson=new Map(employees.map(e=>[e.id,[] as Obligation[]]));
 const buckets=new Map<State,{people:Set<string>;obligations:number}>();
 for(const state of ['valid','expiring','expired','missing','uncertain'] as State[])buckets.set(state,{people:new Set(),obligations:0});
 for(const o of obligations){
  if(o.required===false||!byPerson.has(o.employee.id))continue;
  byPerson.get(o.employee.id)!.push(o);
  const bucket=buckets.get(o.state)!;bucket.people.add(o.employee.id);bucket.obligations++;
 }
 const fulfilled=[...byPerson.values()].filter(items=>items.every(o=>o.required===true&&(o.state==='valid'||o.state==='expiring'))).length;
 return {total:employees.length,fulfilled,needsAttention:employees.length-fulfilled,states:Object.fromEntries([...buckets].map(([state,bucket])=>[state,{people:bucket.people.size,obligations:bucket.obligations}])) as Summary['states']};
}
