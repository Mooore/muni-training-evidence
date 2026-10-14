import type { Audit,Dataset } from './domain/types';
// Immutable datasets may be reused inside one isolate. Always verify the active
// pointer first: DB failure must not silently turn into a stale-data fallback.
const snapshots=new WeakMap<D1Database,{id:string;data:Dataset;auditLoaded:boolean}>();
interface ActiveDataset {id:string;reference:string;imported_at:string;version:string}
async function activeDataset(db:D1Database):Promise<ActiveDataset> {
 const meta=await db.prepare('SELECT d.* FROM datasets d JOIN active_dataset a ON a.dataset_id=d.id WHERE a.singleton=1 AND d.validated=1').first<ActiveDataset>();
 if(!meta)throw new Error('Není aktivní ověřený dataset.');
 return meta;
}
export async function loadDataset(db:D1Database,includeAudit=true):Promise<Dataset> {
 const meta=await activeDataset(db);
 const cached=snapshots.get(db);
 if(cached?.id===meta.id){
  if(includeAudit&&!cached.auditLoaded){const result=await db.prepare('SELECT payload FROM audit WHERE dataset_id=?').bind(meta.id).all<{payload:string}>();if(!result.success)throw new Error('Audit nelze načíst.');cached.data.audit=result.results.map(r=>JSON.parse(r.payload));cached.auditLoaded=true;}
  return cached.data;
 }
 const tables=includeAudit?['employees','courses','completions','sessions','audit'] as const:['employees','courses','completions','sessions'] as const;
 const results=await db.batch<{payload:string}>(tables.map(table=>db.prepare(`SELECT payload FROM ${table} WHERE dataset_id=?`).bind(meta.id)));
 const data={employees:[],courses:[],completions:[],sessions:[],audit:[],...Object.fromEntries(tables.map((table,i)=>{if(!results[i].success)throw new Error('Data nelze načíst.');return [table,results[i].results.map(r=>JSON.parse(r.payload))];})),meta:{reference:meta.reference,importedAt:meta.imported_at,version:meta.id}} as Dataset;
 snapshots.set(db,{id:meta.id,data,auditLoaded:includeAudit});return data;
}

export interface AuditPage {
 meta:Dataset['meta']; rows:Audit[]; total:number; page:number; pageSize:number;
 counts:Record<Audit['level'],number>;
 reasons:{reason:string;count:number}[];
}
/** Fetch one audit page and small SQL aggregates; never load training data. */
export async function loadAuditPage(db:D1Database,q:string,level:Audit['level']|'',requestedPage:number):Promise<AuditPage> {
 if(q.length>100||!['','repair','reject','warning'].includes(level)||!Number.isInteger(requestedPage)||requestedPage<1||requestedPage>9999)throw new Error('Neplatný filtr auditu.');
 const meta=await activeDataset(db),pageSize=30;
 const conditions=['dataset_id=?'];const args:(string|number)[]=[meta.id];
 // instr implements a literal substring, preserving existing ID search semantics.
 if(q){conditions.push("instr(lower(json_extract(payload,'$.id')),lower(?))>0");args.push(q);}
 if(level){conditions.push("json_extract(payload,'$.level')=?");args.push(level);}
 const where=conditions.join(' AND ');
 const results=await db.batch<{level:Audit['level'];reason:string;count:number;total:number}>([
  db.prepare("SELECT json_extract(payload,'$.level') AS level,json_extract(payload,'$.reason') AS reason,COUNT(*) AS count FROM audit WHERE dataset_id=? GROUP BY json_extract(payload,'$.level'),json_extract(payload,'$.reason')").bind(meta.id),
  db.prepare(`SELECT COUNT(*) AS total FROM audit WHERE ${where}`).bind(...args)
 ]);
 if(results.some(r=>!r.success))throw new Error('Audit nelze načíst.');
 const total=results[1].results[0]?.total;
 if(typeof total!=='number')throw new Error('Počet auditních událostí není dostupný.');
 const page=Math.min(requestedPage,Math.max(1,Math.ceil(total/pageSize)));
 const rows=await db.prepare(`SELECT payload FROM audit WHERE ${where} ORDER BY id LIMIT ? OFFSET ?`).bind(...args,pageSize,(page-1)*pageSize).all<{payload:string}>();
 if(!rows.success)throw new Error('Audit nelze načíst.');
 const counts:AuditPage['counts']={repair:0,reject:0,warning:0};const reasons=new Map<string,number>();
 for(const group of results[0].results){counts[group.level]+=group.count;reasons.set(group.reason,(reasons.get(group.reason)??0)+group.count);}
 return {meta:{reference:meta.reference,importedAt:meta.imported_at,version:meta.id},rows:rows.results.map(r=>JSON.parse(r.payload)),total,page,pageSize,counts,reasons:[...reasons].map(([reason,count])=>({reason,count})).sort((a,b)=>b.count-a.count||a.reason.localeCompare(b.reason))};
}
/** Read-only readiness probes need counts, not thousands of entity payloads. */
export async function loadHealth(db:D1Database) {
 const meta=await activeDataset(db);
 const counts=await db.prepare('SELECT (SELECT COUNT(*) FROM employees WHERE dataset_id=?) AS employees,(SELECT COUNT(*) FROM courses WHERE dataset_id=?) AS courses,(SELECT COUNT(*) FROM completions WHERE dataset_id=?) AS completions,(SELECT COUNT(*) FROM sessions WHERE dataset_id=?) AS sessions').bind(meta.id,meta.id,meta.id,meta.id).first<{employees:number;courses:number;completions:number;sessions:number}>();
 if(!counts)throw new Error('Počty datasetu nejsou dostupné.');
 return {dataset:meta.id,reference:meta.reference,...counts};
}
