import type { Dataset } from './domain/types';
// Immutable datasets may be reused inside one isolate. Always verify the active
// pointer first: DB failure must not silently turn into a stale-data fallback.
const snapshots=new WeakMap<D1Database,{id:string;data:Dataset;auditLoaded:boolean}>();
export async function loadDataset(db:D1Database,includeAudit=true):Promise<Dataset> {
 const meta=await db.prepare('SELECT d.* FROM datasets d JOIN active_dataset a ON a.dataset_id=d.id WHERE a.singleton=1 AND d.validated=1').first<{id:string;reference:string;imported_at:string;version:string}>();
 if(!meta)throw new Error('Není aktivní ověřený dataset.');
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
