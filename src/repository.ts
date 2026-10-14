import type { Dataset } from './domain/types';
export async function loadDataset(db:D1Database):Promise<Dataset> {
 const meta=await db.prepare('SELECT d.* FROM datasets d JOIN active_dataset a ON a.dataset_id=d.id WHERE a.singleton=1 AND d.validated=1').first<{id:string;reference:string;imported_at:string;version:string}>();
 if(!meta)throw new Error('Není aktivní ověřený dataset.');
 const tables=['employees','courses','completions','sessions','audit'] as const;
 const results=await db.batch<{payload:string}>(tables.map(table=>db.prepare(`SELECT payload FROM ${table} WHERE dataset_id=?`).bind(meta.id)));
 const data=Object.fromEntries(tables.map((table,i)=>{if(!results[i].success)throw new Error('Data nelze načíst.');return [table,results[i].results.map(r=>JSON.parse(r.payload))];}));
 return {...data,meta:{reference:meta.reference,importedAt:meta.imported_at,version:meta.id}} as Dataset;
}
