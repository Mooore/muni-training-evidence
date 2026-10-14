import { Hono } from 'hono';
import { loadDataset,loadAuditPage,loadHealth } from './repository';
import { overview } from './domain/evidence';
import { plan } from './domain/planning';
import { parseDate } from './domain/dates';
import * as view from './views';
import type { Dataset } from './domain/types';
type Env={Bindings:{DB:D1Database;APP_REVISION?:string};Variables:{data:Dataset;date:string}};
const app=new Hono<Env>();
app.use('*',async(c,next)=>{
 const started=performance.now();
 c.header('Content-Security-Policy',"default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
 c.header('X-Content-Type-Options','nosniff');c.header('Referrer-Policy','no-referrer');c.header('X-Frame-Options','DENY');c.header('Cache-Control','no-store');
 if(c.req.method!=='GET' && c.req.method!=='HEAD')return c.text('Pouze čtení.',405);
 await next();
 c.header('Server-Timing',`app;dur=${(performance.now()-started).toFixed(2)}`);
});
app.get('/health',async c=>{
 try {const health=await loadHealth(c.env.DB);return c.json({status:'ok',version:'0.2.0',revision:c.env.APP_REVISION??'development',...health});}
 catch{return c.json({status:'unavailable',version:'0.2.0',revision:c.env?.APP_REVISION??'development'},503);}
});
app.use('*',async(c,next)=>{
 const raw=c.req.query('date')??'2026-10-01';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(raw)||parseDate(raw)!==raw)return c.html(view.layout('Neplatný vstup','<p>Zadejte platné referenční datum ve formátu RRRR-MM-DD.</p><a href="/">Zpět na přehled</a>','2026-10-01'),400);
 if(c.req.url.length>2000)return c.text('Příliš dlouhý požadavek.',400);
 const page=c.req.query('page')??'1';
 if(!/^[1-9]\d{0,3}$/.test(page)||(c.req.query('q')??'').length>100)return c.html(view.layout('Neplatný vstup','<p>Neplatná stránka nebo příliš dlouhé vyhledávání.</p>',raw),400);
 c.set('date',raw);if(c.req.path!=='/quality')c.set('data',await loadDataset(c.env.DB,false));await next();
});
app.get('/',c=>{
 const data=c.get('data'),date=c.get('date');const scope=c.req.query('scope')??'active',state=c.req.query('state')??'',department=c.req.query('department')??'',course=c.req.query('course')??'';
 if((course&&!data.courses.some(c=>c.code===course))||!['active','all','parental','future','ended','uncertain'].includes(scope)||(state&&!Object.keys(view.labels).includes(state))||(department&&!data.employees.some(e=>e.department===department)))return c.html(view.layout('Neplatný filtr','<p>Vybraný filtr není známý.</p><a href="/">Zrušit filtry</a>',date),400);
 const body=view.dashboard(data,overview(data,date),{date,scope,state,department,course,q:c.req.query('q')??'',page:Number(c.req.query('page')??1)});
 return c.html(view.layout('Přehled školení',body,date,data.meta.version));
});
app.get('/employees/:id',c=>{
 const data=c.get('data'),date=c.get('date'),e=data.employees.find(e=>e.id===c.req.param('id'));
 if(!e)return c.html(view.layout('Zaměstnanec nenalezen','<p>Požadované ID neexistuje.</p><a href="/">Přehled</a>',date),404);
 return c.html(view.layout(e.name,view.employeeDetail(data,e,overview(data,date).filter(o=>o.employee.id===e.id),date),date,data.meta.version));
});
app.get('/planning',c=>{const data=c.get('data'),date=c.get('date');try{return c.html(view.layout('Návrh přiřazení',view.planning(data,plan(data,date),date,Number(c.req.query('page')??1)),date,data.meta.version));}catch{return c.html(view.layout('Návrh se nepodařilo sestavit','<p>Žádná rezervace nebyla vytvořena. <a href="/planning">Zkusit znovu</a> nebo <a href="/">otevřít přehled</a>.</p>',date),503);}});
app.get('/quality',async c=>{
 const date=c.get('date'),level=c.req.query('level')??'';
 if(!['','warning','reject','repair'].includes(level))return c.text('Neplatný typ události.',400);
 const audit=await loadAuditPage(c.env.DB,c.req.query('q')??'',level as ''|'warning'|'reject'|'repair',Number(c.req.query('page')??1));
 return c.html(view.layout('Kvalita dat',view.quality(audit,date,c.req.query('q')??'',level),date,audit.meta.version));
});
app.get('/sessions',c=>{const data=c.get('data'),date=c.get('date');return c.html(view.layout('Termíny školení',view.sessionList(data,date),date,data.meta.version));});
app.notFound(c=>c.html(view.layout('Stránka nenalezena','<p>Tato stránka neexistuje.</p><a href="/">Přehled</a>',c.get('date')??'2026-10-01'),404));
app.onError((_err,c)=>c.html(view.layout('Data nyní nejsou dostupná','<p>Ověřený dataset nelze načíst. Nezobrazujeme neověřené počty ani stav splnění. <a href="/">Zkusit znovu</a>.</p>','2026-10-01'),503));
export default app;
