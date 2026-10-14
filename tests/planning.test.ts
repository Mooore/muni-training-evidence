import {expect,test} from 'vitest';
import {plan} from '../src/domain/planning';
import type {Dataset,Session,Employee} from '../src/domain/types';
const employee=(id:string):Employee=>({id,name:id,department:'IT',position:'Test',start:'2020-01-01',end:null,status:'aktivní',issues:[]});
const session=(id:string,code='A',date='2026-10-05',start=540,end=600):Session=>({id,code,date,start,end,place:'Test',capacity:2,occupied:1,status:'plánováno',issues:[]});
function fixture():Dataset{return {employees:[employee('E1'),employee('E2'),employee('E3')],courses:[{code:'A',name:'A',months:12,requirement:'VSICHNI',issues:[]},{code:'B',name:'B',months:12,requirement:'VSICHNI',issues:[]}],completions:[],sessions:[session('T1'),session('T2','B'),session('T3','B','2026-10-06')],audit:[],meta:{reference:'2026-10-01',importedAt:'',version:'test'}};}
test('respects free capacity, no duplicates or collisions, deterministic input permutation',()=>{const d=fixture(),result=plan(d,'2026-10-01');for(const s of d.sessions)expect(result.assignments.filter(a=>a.sessionId===s.id).length).toBeLessThanOrEqual(s.capacity-s.occupied);expect(new Set(result.assignments.map(a=>a.employeeId+'|'+a.code)).size).toBe(result.assignments.length);for(const a of result.assignments)for(const b of result.assignments)if(a!==b&&a.employeeId===b.employeeId){const x=d.sessions.find(s=>s.id===a.sessionId)!,y=d.sessions.find(s=>s.id===b.sessionId)!;expect(x.date!==y.date||x.end!<=y.start!||y.end!<=x.start!).toBe(true);}const reversed={...d,employees:[...d.employees].reverse(),courses:[...d.courses].reverse(),sessions:[...d.sessions].reverse()};expect(plan(reversed,'2026-10-01')).toEqual(result);expect(result.unassigned.some(u=>u.reason.includes('Kapacita'))).toBe(true);});
test('cancelled, invalid and past sessions rejected; eligibility checked at session date',()=>{const d=fixture();d.sessions=[{...session('T1'),status:'zrušeno'},{...session('T2'),issues:['overfull']},session('T3','A','2026-09-30'),session('T4','A','2026-10-05')];d.employees=[{...employee('E1'),end:'2026-10-04'},{...employee('E2'),status:'rodičovská'}];const p=plan(d,'2026-10-01');expect(p.assignments).toHaveLength(0);expect(p.unassigned.some(u=>u.reason.includes('Nezpůsobilost'))).toBe(true);});
test('renewal chooses latest slot before expiry; late solution is explicit',()=>{const d=fixture();d.employees=[employee('E1')];d.courses=d.courses.slice(0,1);d.completions=[{id:'Z1',employeeId:'E1',code:'A',date:'2025-10-20',expiry:'2026-10-20',issues:[],sourceRow:2,derivedExpiry:false}];d.sessions=[session('T1'),session('T2','A','2026-10-19'),session('T3','A','2026-10-21')];expect(plan(d,'2026-10-01').assignments[0].sessionId).toBe('T2');d.sessions=d.sessions.slice(2);expect(plan(d,'2026-10-01').assignments[0].late).toBe(true);});
test('uncertain evidence is held for manual review',()=>{const d=fixture();d.completions=[{id:'Z1',employeeId:'E1',code:'A',date:null,expiry:null,issues:['invalid'],sourceRow:2,derivedExpiry:false}];const p=plan(d,'2026-10-01');expect(p.assignments.some(a=>a.employeeId==='E1'&&a.code==='A')).toBe(false);expect(p.unassigned.some(a=>a.employeeId==='E1'&&a.code==='A'&&a.reason.includes('ruční'))).toBe(true);});
test('priority explains course-first ordering: old missing evidence can precede recent expiry',()=>{
 const d=fixture();d.employees=[{...employee('E1'),start:'2010-01-01'}];
 d.completions=[{id:'Z1',employeeId:'E1',code:'A',date:'2024-10-01',expiry:'2025-10-01',issues:[],sourceRow:2,derivedExpiry:false}];
 const p=plan(d,'2026-10-01');
 expect(p.coursePriorities).toEqual([{code:'B',order:1,date:'2010-01-01'},{code:'A',order:2,date:'2025-10-01'}]);
 expect(p.assignments[0]).toMatchObject({code:'B',priority:{overall:1,withinCourse:1,courseOrder:1,date:'2010-01-01',basis:'missing'},freePlacesBefore:1});
 expect(p.unassigned.find(u=>u.code==='A')).toMatchObject({category:'no-slot',priority:{overall:2,date:'2025-10-01',basis:'expired'}});
});
test('priority ties follow employee ID and trace skipped capacity and collisions',()=>{
 const p=plan(fixture(),'2026-10-01');
 expect(p.assignments[0]).toMatchObject({employeeId:'E1',priority:{overall:1,withinCourse:1}});
 expect(p.assignments.find(a=>a.employeeId==='E1'&&a.code==='B')?.skipped.collision).toBe(1);
 const ranks=[...p.assignments,...p.unassigned].flatMap(x=>x.priority?[x.priority.overall]:[]).sort((a,b)=>a-b);
 expect(ranks).toEqual([1,2,3,4,5,6]);
});
test('data review identifies missing department and actual conflicting document',()=>{
 const d=fixture();d.employees=[{...employee('E1'),department:''}];d.courses[0].requirement='UTVAR:Laboratoře';
 d.completions=[{id:'Z-conflict',employeeId:'E1',code:'B',date:'2026-01-01',expiry:null,issues:['Platnost je v rozporu s periodou katalogu.'],sourceRow:9,derivedExpiry:false}];
 const p=plan(d,'2026-10-01');
 expect(p.assignments).toHaveLength(0);
 expect(p.unassigned.find(u=>u.code==='A')).toMatchObject({category:'data-review',reason:expect.stringContaining('Chybí útvar')});
 expect(p.unassigned.find(u=>u.code==='B')?.reason).toContain('Z-conflict (řádek 9)');
 expect(p.unassigned.every(u=>!u.priority)).toBe(true);
});
