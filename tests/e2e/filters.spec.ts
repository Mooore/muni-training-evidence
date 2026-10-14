import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
import type {Dataset,State} from '../../src/domain/types';
import {eligibility,overview} from '../../src/domain/evidence';

// Oracle uses the imported snapshot and tested domain rules, never the view's
// filter implementation. Compare identities, not just a heading or one row.
const data=JSON.parse(readFileSync('data/demo.json','utf8')) as Dataset;
const reference=data.meta.reference;
const stateLabels:Record<State,string>={valid:'Platné',expiring:'Končí do 60 dnů',expired:'Prošlé',missing:'Chybí',uncertain:'K ověření'};
const selectedStates=(f:Selection):State[]=>Array.isArray(f.state)?f.state:f.state?[f.state]:[];
const states:State[]=['valid','expiring','expired','missing','uncertain'];
type Selection={date?:string;scope?:string;department?:string;q?:string;state?:State|''|State[];course?:string};
function expectedIds(f:Selection){
 const date=f.date??reference,obligations=overview(data,date);
 return data.employees.filter(e=>
  (!f.department||e.department===f.department)&&
  (!f.q||`${e.name} ${e.id}`.toLocaleLowerCase('cs').includes(f.q.toLocaleLowerCase('cs')))&&
  ((f.scope??'active')==='all'||eligibility(e,date)===(f.scope??'active'))&&
  (!f.course||obligations.some(o=>o.employee.id===e.id&&o.course.code===f.course&&o.required!==false))&&
  (!selectedStates(f).length||obligations.some(o=>o.employee.id===e.id&&o.required!==false&&(!f.course||o.course.code===f.course)&&selectedStates(f).includes(o.state)))
 ).map(e=>e.id);
}
async function submit(page:Page,f:Selection){
 const form=page.getByRole('form',{name:'Filtry zaměstnanců'});
 if(!await form.locator('details').evaluate(el=>(el as HTMLDetailsElement).open))await form.locator('summary').click();
 await form.getByLabel('Zaměstnanec',{exact:true}).fill(f.q??'');
 await form.getByRole('combobox',{name:'Útvar',exact:true}).selectOption(f.department??'');
 await form.getByRole('combobox',{name:'Školení',exact:true}).selectOption(f.course??'');
 await form.getByLabel('Referenční datum',{exact:true}).fill(f.date??reference);
 await form.getByRole('combobox',{name:'Způsobilost',exact:true}).selectOption(f.scope??'active');
 for(const state of states)await form.getByRole('group',{name:'Stav povinnosti',exact:true}).getByRole('checkbox',{name:stateLabels[state],exact:true}).setChecked(selectedStates(f).includes(state));
 await form.getByRole('button',{name:'Filtrovat',exact:true}).click();
}
async function assertEmployees(page:Page,ids:string[],offset=0){
 const rows=page.locator('.employees-table tbody tr');
 expect(await rows.locator('th small').allTextContents()).toEqual(ids.slice(offset,offset+20));
 await expect(page.locator('#employees')).toContainText(`Zaměstnanci ${ids.length}`);
 if(!ids.length)await expect(page.getByText('Žádný zaměstnanec neodpovídá filtrům.',{exact:true})).toBeVisible();
}

test('every department and eligibility option submits the exact expected employees',async({page})=>{
 await page.goto('/');
 for(const department of [...new Set(data.employees.map(e=>e.department))].filter(Boolean)){
  const f={department,scope:'all'};await submit(page,f);await assertEmployees(page,expectedIds(f));
  await expect(page.getByRole('combobox',{name:'Útvar',exact:true})).toHaveValue(department);
 }
 for(const scope of ['active','all','parental','future','ended','uncertain']){
  const f={scope};await submit(page,f);await assertEmployees(page,expectedIds(f));
  if(scope==='active'){await expect(page.getByRole('combobox',{name:'Způsobilost',exact:true})).toBeHidden();await page.getByText('Další filtry',{exact:true}).click();}
  await expect(page.getByRole('combobox',{name:'Způsobilost',exact:true})).toHaveValue(scope);
 }
});

test('all obligation states filter people and do not change the selected population graph',async({page})=>{
 await page.goto('/');
 const progress=page.getByRole('progressbar');const value=await progress.getAttribute('value'),max=await progress.getAttribute('max');
 for(const state of states){
  const f={state};await submit(page,f);await assertEmployees(page,expectedIds(f));
  await expect(page.getByRole('group',{name:'Stav povinnosti',exact:true}).getByRole('checkbox',{name:stateLabels[state],exact:true})).toBeChecked();
  await expect(progress).toHaveAttribute('value',value!);await expect(progress).toHaveAttribute('max',max!);
 }
});

test('name/ID search is case insensitive, combines with other filters and treats special characters literally',async({page})=>{
 await page.goto('/');
 for(const f of [
  {q:'e0020',scope:'all'},
  {q:'LUCIE',scope:'all'},
  {q:'OVÁ',department:'Laboratoře',scope:'active',state:'missing' as const},
  {q:'E0001',department:'Laboratoře',scope:'all'},
  {q:'<script>alert(1)</script>',scope:'all'},
  {q:"%' OR 1=1 --",scope:'all'}
 ]){
  await submit(page,f);await assertEmployees(page,expectedIds(f));
  await expect(page.getByLabel('Zaměstnanec',{exact:true})).toHaveValue(f.q);
  expect(new URL(page.url()).searchParams.get('q')).toBe(f.q);
 }
});

test('combined filters and reference date persist through paging, detail/back and reset',async({page})=>{
 const f={q:'E0',scope:'all',state:'valid' as const,date:'2026-09-01'};
 const ids=expectedIds(f);expect(ids.length).toBeGreaterThan(20);
 await page.goto('/');await submit(page,f);await assertEmployees(page,ids);
 await page.getByRole('link',{name:'Další →',exact:true}).click();await assertEmployees(page,ids,20);
 for(const [key,value] of Object.entries(f))expect(new URL(page.url()).searchParams.get(key)).toBe(value);
 await page.locator('.employees-table tbody th a').first().click();
 expect(new URL(page.url()).searchParams.get('date')).toBe(f.date);
 await page.goBack();await assertEmployees(page,ids,20);
 // Submitting a changed filter must start from page 1, not keep the old offset.
 await submit(page,{...f,q:'e0020',state:''});await assertEmployees(page,expectedIds({...f,q:'e0020',state:''}));
 expect(new URL(page.url()).searchParams.has('page')).toBe(false);
 await page.getByRole('link',{name:'Zrušit filtry',exact:true}).click();
 await assertEmployees(page,expectedIds({date:f.date}));
 await expect(page.getByLabel('Zaměstnanec',{exact:true})).toHaveValue('');
 await expect(page.getByRole('combobox',{name:'Útvar',exact:true})).toHaveValue('');
 await expect(page.getByRole('combobox',{name:'Způsobilost',exact:true})).toHaveValue('active');
 await expect(page.getByRole('group',{name:'Stav povinnosti',exact:true}).locator('input:checked')).toHaveCount(0);
 await expect(page.getByLabel('Referenční datum',{exact:true})).toHaveValue(f.date);
});

test('overview pages have no omissions/duplicates, preserve filters and clamp a stale page',async({page})=>{
 const f={scope:'all',q:'e0',date:reference},ids=expectedIds(f),seen:string[]=[];
 await page.goto('/?'+new URLSearchParams(f));
 for(let offset=0;offset<ids.length;offset+=20){
  await assertEmployees(page,ids,offset);seen.push(...await page.locator('.employees-table tbody th small').allTextContents());
  if(offset+20<ids.length)await page.getByRole('link',{name:'Další →',exact:true}).click();
 }
 expect(seen).toEqual(ids);expect(new Set(seen).size).toBe(ids.length);
 await expect(page.getByRole('link',{name:'Další →',exact:true})).toHaveCount(0);
 await page.goto('/?'+new URLSearchParams({...f,page:'9999'}));
 await assertEmployees(page,ids,Math.floor((ids.length-1)/20)*20);
 await page.getByRole('link',{name:'← Předchozí',exact:true}).click();
 for(const [key,value] of Object.entries(f))expect(new URL(page.url()).searchParams.get(key)).toBe(value);
});

test('audit combines every event type with literal case insensitive ID search and resets pagination',async({page})=>{
 await page.goto('/quality?page=2&date=2026-09-01');
 for(const level of ['','repair','warning','reject']){
  const q='e00',matches=data.audit.filter(a=>a.id.toLowerCase().includes(q)&&(!level||a.level===level));
  await page.getByLabel('Zdrojové ID',{exact:true}).fill(q);
  await page.getByRole('combobox',{name:'Typ události',exact:true}).selectOption(level);
  await page.getByRole('button',{name:'Filtrovat audit'}).click();
  await expect(page.getByText(`Nalezeno ${matches.length} událostí.`,{exact:true})).toBeVisible();
  expect(new URL(page.url()).searchParams.has('page')).toBe(false);
  expect(new URL(page.url()).searchParams.get('date')).toBe('2026-09-01');
  const rows=page.locator('tbody tr');
  expect(await rows.locator('th').allTextContents()).toEqual(matches.slice(0,30).map(a=>a.id||'Bez ID'));
  expect(await rows.locator('td:nth-child(3)').allTextContents()).toEqual(matches.slice(0,30).map(a=>({repair:'Oprava',warning:'Upozornění',reject:'Odmítnutí'})[a.level]));
  if(matches.length>30){
   await page.getByRole('link',{name:'Další →',exact:true}).click();
   expect(await rows.locator('th').allTextContents()).toEqual(matches.slice(30,60).map(a=>a.id||'Bez ID'));
   await expect(page.getByLabel('Zdrojové ID',{exact:true})).toHaveValue(q);
   await expect(page.getByRole('combobox',{name:'Typ události',exact:true})).toHaveValue(level);
  }
 }
});

test('invalid filter URLs are rejected instead of silently showing unrelated results',async({page})=>{
 for(const path of ['/?course=invalid','/?scope=invalid','/?state=invalid','/?department=neexistuje','/?page=0','/?page=-1','/?page=1.5','/?date=2026-02-30','/?date=1949-12-31','/?q='+('x'.repeat(101)),'/quality?level=invalid','/quality?page=0']){
  const response=await page.goto(path);expect(response?.status(),path).toBe(400);
  await expect(page.locator('.employees-table')).toHaveCount(0);
 }
});


test('mobile filters submit with Enter and preserve a combined selection after reload',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const f={department:'Laboratoře',scope:'all',state:'expired' as const,course:'BOZP-Z'};
 await submit(page,f);await assertEmployees(page,expectedIds(f));
 const q='E0';await page.getByLabel('Zaměstnanec',{exact:true}).fill(q);
 await page.getByLabel('Zaměstnanec',{exact:true}).press('Enter');
 await expect(page).toHaveURL(/q=E0/);await assertEmployees(page,expectedIds({...f,q}));
 await page.reload();await assertEmployees(page,expectedIds({...f,q}));
 await expect(page.getByRole('combobox',{name:'Útvar',exact:true})).toHaveValue(f.department);
 await expect(page.getByRole('combobox',{name:'Způsobilost',exact:true})).toHaveValue(f.scope);
 await expect(page.getByRole('group',{name:'Stav povinnosti',exact:true}).getByRole('checkbox',{name:stateLabels[f.state],exact:true})).toBeChecked();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


test('every course limits the graph, counts and rows to applicable selected training',async({page})=>{
 await page.goto('/');
 const obligations=overview(data,reference);
 for(const course of data.courses){
  const f={course:course.code};await submit(page,f);
  const ids=expectedIds(f),items=obligations.filter(o=>ids.includes(o.employee.id)&&o.course.code===course.code);
  await assertEmployees(page,ids);
  await expect(page.getByRole('combobox',{name:'Školení',exact:true})).toHaveValue(course.code);
  await expect(page.locator('#completion-heading')).toHaveText(`${course.name} (${course.code})`);
  if(ids.length){
   const fulfilled=items.filter(o=>o.required===true&&['valid','expiring'].includes(o.state)).length;
   await expect(page.getByRole('progressbar')).toHaveAttribute('value',String(fulfilled));
   await expect(page.getByRole('progressbar')).toHaveAttribute('max',String(ids.length));
   const rowBadges=await page.locator('.employees-table tbody .training-trigger > strong').allTextContents();
   expect(rowBadges).toEqual(ids.slice(0,20).map(()=>'1'));
  }else{
   await expect(page.getByRole('progressbar')).toHaveCount(0);
   await expect(page.getByText(/pro \d+ osob není povinné/)).toBeVisible();
  }
 }
});

test('selected BOZP persists through task links, paging and reset; states belong to that course',async({page})=>{
 await page.goto('/');const f={course:'BOZP-Z',scope:'all',q:'E0',date:reference};
 await submit(page,f);await assertEmployees(page,expectedIds(f));
 await page.getByRole('link',{name:'Další →',exact:true}).click();await assertEmployees(page,expectedIds(f),20);
 expect(new URL(page.url()).searchParams.get('course')).toBe('BOZP-Z');
 const task=page.getByRole('article').filter({has:page.getByRole('heading',{name:'Obnovit prošlá školení',exact:true})});
 await task.getByRole('link',{name:'Zobrazit osoby'}).click();
 await assertEmployees(page,expectedIds({...f,state:'expired'}));
 for(const [key,value] of Object.entries(f))expect(new URL(page.url()).searchParams.get(key)).toBe(value);
 await expect(page.getByRole('combobox',{name:'Školení',exact:true})).toHaveValue('BOZP-Z');
 for(const state of states){await submit(page,{...f,department:'Laboratoře',state});await assertEmployees(page,expectedIds({...f,department:'Laboratoře',state}));}
 await page.getByRole('link',{name:'Zrušit filtry',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'Školení',exact:true})).toHaveValue('');
 await assertEmployees(page,expectedIds({date:reference}));
});


test('multiple obligation states use OR within the selected course and survive paging, reload and reset',async({page})=>{
 const f={course:'BOZP-Z',state:['expired','missing'] as State[],scope:'all',q:'E0',date:'2026-09-01'};
 await page.goto('/');await submit(page,f);await assertEmployees(page,expectedIds(f));
 expect(new URL(page.url()).searchParams.getAll('state')).toEqual(f.state);
 await page.reload();await assertEmployees(page,expectedIds(f));
 for(const state of f.state)await expect(page.getByRole('group',{name:'Stav povinnosti'}).getByRole('checkbox',{name:stateLabels[state],exact:true})).toBeChecked();
 // A larger OR selection exercises repeated query parameters on all pages.
 const many={...f,state:['valid','expired'] as State[]};await submit(page,many);const ids=expectedIds(many);expect(ids.length).toBeGreaterThan(20);
 await page.getByRole('link',{name:'Další →',exact:true}).click();await assertEmployees(page,ids,20);
 expect(new URL(page.url()).searchParams.getAll('state')).toEqual(many.state);
 expect(new URL(page.url()).searchParams.get('course')).toBe(f.course);
 await page.getByRole('link',{name:'Zrušit filtry',exact:true}).click();await assertEmployees(page,expectedIds({date:f.date}));
 await expect(page.getByRole('group',{name:'Stav povinnosti'}).locator('input:checked')).toHaveCount(0);
});

test('all except Valid shortcut preserves BOZP and department, and all states clears only the state selection',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const f={course:'BOZP-Z',department:'Laboratoře',scope:'all',date:reference,q:'E0'};
 await page.goto('/');await submit(page,f);
 // Scope all keeps advanced filters open after submission.
 await page.getByRole('link',{name:'Vše kromě Platné',exact:true}).click();
 const selected=states.filter(s=>s!=='valid');await assertEmployees(page,expectedIds({...f,state:selected}));
 expect(new URL(page.url()).searchParams.getAll('state')).toEqual(selected);
 for(const [key,value] of Object.entries(f))expect(new URL(page.url()).searchParams.get(key)).toBe(value);
 await expect(page.getByRole('checkbox',{name:'Platné',exact:true})).not.toBeChecked();
 await page.getByRole('link',{name:'Všechny stavy',exact:true}).click();await assertEmployees(page,expectedIds(f));
 expect(new URL(page.url()).searchParams.getAll('state')).toEqual([]);
 expect(new URL(page.url()).searchParams.get('course')).toBe(f.course);
});

test('legacy single-state URLs work; duplicates are deduplicated and any invalid repeated value is rejected',async({page})=>{
 await page.goto('/?course=BOZP-Z&state=expired');await assertEmployees(page,expectedIds({course:'BOZP-Z',state:'expired'}));
 await page.goto('/?course=BOZP-Z&state=expired&state=expired&state=missing');
 await assertEmployees(page,expectedIds({course:'BOZP-Z',state:['expired','missing']}));
 await expect(page.getByRole('group',{name:'Stav povinnosti'}).locator('input:checked')).toHaveCount(2);
 const response=await page.goto('/?state=expired&state=invalid');expect(response?.status()).toBe(400);
});
