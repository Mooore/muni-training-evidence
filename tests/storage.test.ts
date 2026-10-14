import {expect,test} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {loadDataset,loadAuditPage,loadHealth} from '../src/repository';
import app from '../src/index';
function storage(){const sqlite=new DatabaseSync(':memory:');for(const file of readdirSync('migrations').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('migrations/'+file,'utf8'));sqlite.exec(readFileSync('data/seed.sql','utf8'));sqlite.exec(readFileSync('data/activate.sql','utf8'));
 const db={prepare(sql:string){return {bind(...args:unknown[]){return {first:async()=>sqlite.prepare(sql).get(...args as never[]),all:async()=>({results:sqlite.prepare(sql).all(...args as never[]),success:true})};},first:async()=>sqlite.prepare(sql).get()};},batch:async(statements:{all:()=>Promise<unknown>}[])=>Promise.all(statements.map(s=>s.all()))} as unknown as D1Database;
 return {sqlite,db};}
test('clean migration+seed loads representative route and escapes source text',async()=>{const {sqlite,db}=storage();try{const d=await loadDataset(db);expect(d.employees).toHaveLength(174);expect(d.completions).toHaveLength(2860);expect(d.courses).toHaveLength(10);const res=await app.request('/',{}, {DB:db});expect(res.status).toBe(200);expect(res.headers.get('content-security-policy')).toContain("default-src 'none'");expect(await res.text()).toContain('Přehled školení');const bad=await app.request('/?scope=invalid',{}, {DB:db});expect(bad.status).toBe(400);const attack=await app.request('/?q='+encodeURIComponent('<script>alert(1)</script>'),{}, {DB:db});const html=await attack.text();expect(html).not.toContain('<script>');expect(html).toContain('&lt;script&gt;');}finally{sqlite.close();}});
test('partial staging cannot replace active dataset; prior dataset can be restored',async()=>{const {sqlite,db}=storage();try{const original=(await loadDataset(db)).meta.version;sqlite.prepare('INSERT INTO datasets VALUES (?, ?, ?, ?, 0)').run('incomplete','2026-10-01','test','test');const activation=readFileSync('data/activate.sql','utf8').replaceAll(original,'incomplete');sqlite.exec(activation);expect((await loadDataset(db)).meta.version).toBe(original);
 // Rehearse an immutable new snapshot, then restore only the active pointer.
 sqlite.prepare('INSERT INTO datasets VALUES (?, ?, ?, ?, 1)').run('rollback-rehearsal','2026-10-01','test','test');for(const table of ['employees','courses','completions','sessions','audit']){const cols=sqlite.prepare(`PRAGMA table_info(${table})`).all().map(c=>c.name as string);sqlite.prepare(`INSERT INTO ${table} SELECT ?,${cols.slice(1).join(',')} FROM ${table} WHERE dataset_id=?`).run('rollback-rehearsal',original);}
 sqlite.exec("UPDATE active_dataset SET dataset_id='rollback-rehearsal'");expect((await loadDataset(db)).meta.version).toBe('rollback-rehearsal');sqlite.prepare('UPDATE active_dataset SET dataset_id=?').run(original);expect((await loadDataset(db)).meta.version).toBe(original);expect((await loadDataset(db)).employees).toHaveLength(174);
 }finally{sqlite.close();}});
test('warm snapshot never hides database outage',async()=>{const {sqlite,db}=storage();expect((await app.request('/',{},{DB:db})).status).toBe(200);sqlite.close();const response=await app.request('/',{},{DB:db});expect(response.status).toBe(503);expect(await response.text()).toContain('Data nyní nejsou dostupná');});
test('SQL audit pages preserve global aggregates, literal filters and stable pagination',async()=>{
 const {sqlite,db}=storage();try{
  const source=JSON.parse(readFileSync('data/demo.json','utf8'));
  const first=await loadAuditPage(db,'','',1),second=await loadAuditPage(db,'','',2);
  expect(first.rows).toEqual(source.audit.slice(0,30));expect(second.rows).toEqual(source.audit.slice(30,60));expect(first.total).toBe(source.audit.length);
  for(const level of ['repair','reject','warning'] as const)expect(first.counts[level]).toBe(source.audit.filter((a:{level:string})=>a.level===level).length);
  expect(first.reasons.reduce((sum,r)=>sum+r.count,0)).toBe(source.audit.length);
  const filtered=await loadAuditPage(db,'e0020','repair',1);const expected=source.audit.filter((a:{id:string;level:string})=>a.id.toLowerCase().includes('e0020')&&a.level==='repair');
  expect(filtered.rows).toEqual(expected);expect(filtered.total).toBe(expected.length);expect(filtered.counts).toEqual(first.counts);
  const malicious=await loadAuditPage(db,"%' OR 1=1 --",'',1);expect(malicious.total).toBe(0);expect(malicious.rows).toEqual([]);
  const last=await loadAuditPage(db,'','',9999);expect(last.page).toBe(Math.ceil(source.audit.length/30));expect(last.rows.length).toBe(source.audit.length%30);
  await expect(loadAuditPage(db,'','',0)).rejects.toThrow('Neplatný');
 }finally{sqlite.close();}
});
test('audit and health work without loading employee or completion payloads; DB failures stay visible',async()=>{
 const {sqlite,db}=storage();
 expect(await loadHealth(db)).toMatchObject({employees:174,courses:10,completions:2860,sessions:34});
 // A broken, unrelated training payload must not break the independent audit route or count probe.
 sqlite.exec('PRAGMA ignore_check_constraints=ON');sqlite.exec("UPDATE completions SET payload='broken-json'");
 expect((await app.request('/health',{},{DB:db})).status).toBe(200);
 const audit=await app.request('/quality?q=E0020&level=repair',{},{DB:db});expect(audit.status).toBe(200);expect(await audit.text()).toContain('Opraven zápis křestního jména');
 expect((await app.request('/',{},{DB:db})).status).toBe(503);
 sqlite.close();expect((await app.request('/quality',{},{DB:db})).status).toBe(503);
 expect((await app.request('/quality?level=invalid',{},{DB:db})).status).toBe(400);
});
