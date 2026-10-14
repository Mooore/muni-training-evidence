export interface Employee { id:string; name:string; department:string; position:string; start:string|null; end:string|null; status:string; issues:string[] }
export interface Course { code:string; name:string; months:number|null; requirement:string; issues:string[] }
export interface Completion { id:string; employeeId:string; code:string; date:string|null; expiry:string|null; issues:string[]; sourceRow:number; derivedExpiry:boolean }
export interface Session { id:string; code:string; date:string|null; start:number|null; end:number|null; place:string; capacity:number; occupied:number; status:string; issues:string[] }
export interface Audit { file:string; row:number; id:string; level:'repair'|'reject'|'warning'; reason:string }
export interface Dataset { employees:Employee[]; courses:Course[]; completions:Completion[]; sessions:Session[]; audit:Audit[]; meta:{reference:string; importedAt:string; version:string} }
export type State = 'valid'|'expiring'|'expired'|'missing'|'uncertain';
export interface Obligation { employee:Employee; course:Course; required:boolean|null; state:State; expiry:string|null; completion:Completion|null; warnings:string[] }
