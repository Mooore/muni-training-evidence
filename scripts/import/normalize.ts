import { parse } from 'csv-parse/sync';
import iconv from 'iconv-lite';
import { parseDate,addMonths } from '../../src/domain/dates';
import type { Dataset,Audit,Employee,Course,Completion,Session } from '../../src/domain/types';
export const config={zamestnanci:{encoding:'utf8',delimiter:',',headers:['id_zamestnance','jmeno','prijmeni','utvar','pozice','datum_nastupu','datum_ukonceni','stav']},katalog_skoleni:{encoding:'utf8',delimiter:',',headers:['kod','nazev','platnost_mesicu','povinne_pro']},terminy_skoleni:{encoding:'utf8',delimiter:';',headers:['id_terminu','kod_skoleni','datum','cas','misto','kapacita','obsazeno','stav']},absolvovana_skoleni:{encoding:'win1250',delimiter:';',headers:['id_zaznamu','id_zamestnance','kod_skoleni','datum_absolvovani','platnost_do']}} as const;
type File=keyof typeof config;
type Row=Record<string,string>;
export function readCsv(bytes:Buffer,file:File):Row[] {
 const c=config[file];const text=iconv.decode(bytes,c.encoding);
 if(text.includes('\ufffd')) throw new Error(`Neplatné kódování: ${file}`);
 const rows=parse(text,{bom:true,delimiter:c.delimiter,skip_empty_lines:true,columns:(headers:string[])=>{
  if(new Set(headers).size!==headers.length || c.headers.some(h=>!headers.includes(h))) throw new Error(`Chybná hlavička: ${file}`);
  return headers;
 }}) as Row[];
 if(!rows.length) throw new Error(`Prázdný soubor: ${file}`);return rows;
}
const departments:Record<string,string>={'Studijní':'Studijní oddělení','Studijni oddeleni':'Studijní oddělení','Sprava budov':'Správa budov','SPRÁVA BUDOV':'Správa budov','správa budov':'Správa budov','Laboratore':'Laboratoře','Personalni oddeleni':'Personální oddělení','VEDENÍ':'Vedení'};
const codes:Record<string,string>={'POZ_OCH':'POZ-OCH','POZ OCH':'POZ-OCH','BOZP_Z':'BOZP-Z','BOZP Z':'BOZP-Z'};
const integer=(value:string):number|null=>/^\d+$/.test(value.trim()) && Number.isSafeInteger(Number(value))?Number(value):null;
export function normalize(input:Record<File,Row[]>,importedAt=new Date().toISOString()):Dataset {
 const audit:Audit[]=[];
 const note=(file:string,row:number,id:string,level:Audit['level'],reason:string)=>audit.push({file,row,id,level,reason});
 const code=(value:string,file:File,row:number,id:string)=>{const normalized=value.trim().toUpperCase(); const result=codes[normalized]??normalized;if(result!==value) note(file,row,id,'repair','Normalizován kód explicitním pravidlem.');return result;};
 const date=(value:string,file:File,row:number,id:string,issues:string[],label:string,optional=false)=>{
  if(!value.trim() && optional) return null;const result=parseDate(value);if(!result){issues.push(`Neplatné ${label}.`);}else if(result!==value) note(file,row,id,'repair',`Normalizováno ${label}; Excel serial používá systém 1900.`);return result;
 };
 const employees:Employee[]=input.zamestnanci.map((r,i)=>{
  const row=i+2,id=r.id_zamestnance.trim(),issues:string[]=[];
  const department=departments[r.utvar.trim()]??r.utvar.trim();if(department!==r.utvar) note('zamestnanci',row,id,'repair','Normalizován útvar explicitním aliasem.');
  if(!department) note('zamestnanci',row,id,'warning','Chybí útvar; útvarové povinnosti jsou nejisté.');
  const start=date(r.datum_nastupu,'zamestnanci',row,id,issues,'datum nástupu'),end=date(r.datum_ukonceni,'zamestnanci',row,id,issues,'datum ukončení',true);
  if(end && start && end<start) issues.push('Ukončení před nástupem.');
  if(!['aktivní','ukončen','rodičovská'].includes(r.stav)) issues.push('Neznámý stav.');
  if(r.stav==='ukončen' && !end) issues.push('Ukončený zaměstnanec bez data ukončení.');
  if(r.stav==='aktivní' && end && end<'2026-10-01') issues.push('Aktivní stav je v rozporu s ukončením před exportem.');
  if(r.stav==='ukončen' && end && end>'2026-10-01') issues.push('Ukončený stav je v rozporu s budoucím ukončením k exportu.');
  for(const reason of issues) note('zamestnanci',row,id,'warning',reason);
  return {id,name:`${r.jmeno.trim()} ${r.prijmeni.trim()}`,department,position:r.pozice.trim(),start,end,status:r.stav,issues};
 });
 if(employees.some(e=>!e.id) || new Set(employees.map(e=>e.id)).size!==employees.length) throw new Error('Chybějící nebo duplicitní ID zaměstnance; import zastaven.');
 const courses:Course[]=input.katalog_skoleni.map((r,i)=>{const id=code(r.kod,'katalog_skoleni',i+2,r.kod),issues:string[]=[];let months=r.platnost_mesicu==='2 roky'?24:r.platnost_mesicu.trim()===''?null:integer(r.platnost_mesicu);
 if(r.platnost_mesicu==='2 roky') note('katalog_skoleni',i+2,id,'repair','2 roky interpretováno jako 24 kalendářních měsíců.');
 if(months===null && (r.platnost_mesicu.trim()!=='' || r.povinne_pro!=='NEPOVINNE')) issues.push('Neplatná nebo neznámá perioda školení.');
 if(!/^(VSICHNI|NEPOVINNE|UTVAR:.+|POZICE:.+)$/.test(r.povinne_pro)) issues.push('Neznámé pravidlo povinnosti.');
 for(const reason of issues) note('katalog_skoleni',i+2,id,'warning',reason);
 return {code:id,name:r.nazev,months,requirement:r.povinne_pro,issues};});
 if(courses.some(c=>!c.code) || new Set(courses.map(c=>c.code)).size!==courses.length) throw new Error('Nejednoznačný katalog.');
 const knownEmployees=new Set(employees.map(e=>e.id)),catalog=new Map(courses.map(c=>[c.code,c]));
 const seen=new Set<string>(),completions:Completion[]=[];
 for(const [i,r] of input.absolvovana_skoleni.entries()) {
  const row=i+2,id=r.id_zaznamu.trim(),issues:string[]=[];
  if(id==='id_zaznamu' && r.kod_skoleni==='kod_skoleni'){note('absolvovana_skoleni',row,id,'reject','Opakovaná hlavička.');continue;}
  const fingerprint=JSON.stringify(r);if(seen.has(fingerprint)){note('absolvovana_skoleni',row,id,'reject','Přesná duplicita ignorována.');continue;}seen.add(fingerprint);
  const employeeId=r.id_zamestnance.trim(),c=code(r.kod_skoleni,'absolvovana_skoleni',row,id);
  if(!id) issues.push('Chybí ID dokladu.');if(!knownEmployees.has(employeeId)) issues.push('Neznámé ID zaměstnance.');if(!catalog.has(c)) issues.push('Neznámý kód školení.');
  const completed=date(r.datum_absolvovani,'absolvovana_skoleni',row,id,issues,'datum absolvování');
  let expiry=date(r.platnost_do,'absolvovana_skoleni',row,id,issues,'datum platnosti',true);let derivedExpiry=false;
  const course=catalog.get(c);
  if(expiry && completed && expiry<completed) issues.push('Platnost končí před absolvováním.');
  if(course?.months && completed) {const computed=addMonths(completed,course.months);if(!r.platnost_do.trim()){expiry=computed;derivedExpiry=true;note('absolvovana_skoleni',row,id,'repair','Platnost dopočítána podle katalogu.');}else if(expiry && expiry!==computed) issues.push('Platnost je v rozporu s periodou katalogu.');}
  completions.push({id,employeeId,code:c,date:completed,expiry,derivedExpiry,sourceRow:row,issues});
 }
 const byId=new Map<string,Completion[]>();for(const c of completions){const group=byId.get(c.id)??[];group.push(c);byId.set(c.id,group);}for(const group of byId.values())if(group.length>1)for(const c of group)c.issues.push('Konfliktní verze ID dokladu.');
 for(const c of completions) for(const reason of new Set(c.issues)) note('absolvovana_skoleni',c.sourceRow,c.id,'warning',reason);
 const sessions:Session[]=input.terminy_skoleni.map((r,i)=>{
  const row=i+2,id=r.id_terminu.trim(),issues:string[]=[];const c=code(r.kod_skoleni,'terminy_skoleni',row,id);
  const day=date(r.datum,'terminy_skoleni',row,id,issues,'datum termínu');const match=/^(\d{2}):(\d{2})\s*[-–]\s*(\d{2}):(\d{2})$/.exec(r.cas.trim());let start:number|null=null,end:number|null=null;
  if(match){const [,h,m,hh,mm]=match.map(Number);if(h<24&&hh<24&&m<60&&mm<60){start=h*60+m;end=hh*60+mm;}}
  if(start===null||end===null||end<=start) issues.push('Neplatný časový interval.');
  const capacity=integer(r.kapacita),occupied=integer(r.obsazeno);
  if(capacity===null||occupied===null) issues.push('Neplatná kapacita nebo obsazenost.');
  if(capacity!==null&&occupied!==null&&occupied>capacity) issues.push('Přeplněný termín.');
  if(capacity===0) issues.push('Nulová kapacita.');if(!catalog.has(c)) issues.push('Neznámý kód školení.');
  if(!['plánováno','zrušeno'].includes(r.stav)) issues.push('Neznámý stav termínu.');
  for(const reason of issues) note('terminy_skoleni',row,id,'warning',reason);
  return {id,code:c,date:day,start,end,place:r.misto,capacity:capacity??0,occupied:occupied??0,status:r.stav,issues};
 });
 if(sessions.some(s=>!s.id)||new Set(sessions.map(s=>s.id)).size!==sessions.length) throw new Error('Nejednoznačné ID termínů.');
 return {employees,courses,completions,sessions,audit,meta:{reference:'2026-10-01',importedAt,version:'1'}};
}
