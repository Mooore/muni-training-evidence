import {expect,test} from 'vitest';
import {readFileSync} from 'node:fs';
import {summarize} from '../src/domain/summary';
import {overview,eligibility} from '../src/domain/evidence';
import type {Dataset,Employee,Obligation,State} from '../src/domain/types';
const employee=(id:string):Employee=>({id,name:id,department:'IT',position:'Test',start:'2020-01-01',end:null,status:'aktivní',issues:[]});
const row=(e:Employee,code:string,state:State,required:boolean|null=true):Obligation=>({employee:e,course:{code,name:code,months:12,requirement:'VSICHNI',issues:[]},required,state,expiry:null,completion:null,warnings:[]});
test('progress counts each person once while task categories may overlap',()=>{
 const a=employee('A'),b=employee('B');const result=summarize([a,b],[row(a,'X','expired'),row(a,'Y','missing'),row(b,'X','valid'),row(b,'Y','expiring')]);
 expect(result).toMatchObject({total:2,fulfilled:1,needsAttention:1,states:{expired:{people:1,obligations:1},missing:{people:1,obligations:1},expiring:{people:1,obligations:1}}});
});
test('uncertain obligation blocks fulfilled status, optional courses and other people do not affect selection',()=>{
 const a=employee('A'),b=employee('B');const result=summarize([a],[row(a,'X','valid'),row(a,'Y','uncertain',null),row(a,'Z','missing',false),row(b,'X','expired')]);
 expect(result.fulfilled).toBe(0);expect(result.needsAttention).toBe(1);expect(result.states.uncertain).toEqual({people:1,obligations:1});expect(result.states.missing.people).toBe(0);expect(result.states.expired.people).toBe(0);
});
test('real snapshot summary is disjoint and empty selection has no results',()=>{
 const data=JSON.parse(readFileSync('data/demo.json','utf8')) as Dataset;const people=data.employees.filter(e=>eligibility(e,'2026-10-01')==='active');const obligations=overview(data,'2026-10-01');
 expect(summarize(people,obligations)).toMatchObject({total:153,fulfilled:90,needsAttention:63,states:{expired:{people:21,obligations:39},missing:{people:42,obligations:49},uncertain:{people:4,obligations:8},expiring:{people:73,obligations:82}}});
 expect(summarize([],obligations)).toMatchObject({total:0,fulfilled:0,needsAttention:0});
});
