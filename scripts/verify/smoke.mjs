import {writeFileSync,readFileSync} from 'node:fs';
const base=process.argv[2]??'http://localhost:8787';
const manifest=JSON.parse(readFileSync(new URL('../../data/manifest.json',import.meta.url),'utf8'));
const expected=process.env.EXPECTED_DATASET??manifest.id;
// Publication and edge propagation are separate; readiness is bounded, failures after readiness are not retried.
const deadline=Date.now()+45000;
let state,lastError;
while(Date.now()<deadline){
 try{const health=await fetch(base+'/health',{signal:AbortSignal.timeout(5000),cache:'no-store'});state=await health.json();
  if(health.status===200&&state.dataset===expected&&state.employees===manifest.employees&&state.completions===manifest.completions&&state.courses===manifest.courses&&(!process.env.EXPECTED_REVISION||state.revision===process.env.EXPECTED_REVISION)){lastError=null;break;}
  lastError=new Error('Health obsah neodpovídá očekávanému datasetu/revizi: '+JSON.stringify(state));
 }catch(error){lastError=error;}
 await new Promise(resolve=>setTimeout(resolve,1000));
}
if(lastError||!state)throw lastError??new Error('Deployment not ready');
// Audit comes first after the count-only health probe; training snapshot is not preloaded.
const routes=[['/quality','Kvalita dat'],['/quality?level=warning','Kvalita dat'],['/','Přehled školení'],['/?department=Laborato%C5%99e','Přehled školení'],['/employees/E0001','Požadavky a platnost'],['/planning','Návrh není rezervace.']];
const results=[];
for(const [path,marker] of routes){const samples=[];let bytes=0;for(let i=0;i<12;i++){const start=performance.now();const response=await fetch(base+path,{signal:AbortSignal.timeout(10000)});const body=await response.text();const elapsed=performance.now()-start;if(!response.ok||!body.includes(marker)||!body.includes(expected))throw Error('Smoke selhal: '+path+' '+response.status);if(response.headers.get('cache-control')!=='no-store')throw Error('Chybí no-store: '+path);bytes=Buffer.byteLength(body);samples.push({elapsedMs:Math.round(elapsed*10)/10,serverTiming:response.headers.get('server-timing')});}const sorted=samples.slice(1).map(s=>s.elapsedMs).sort((a,b)=>a-b);results.push({path,firstMs:samples[0].elapsedMs,medianMs:sorted[Math.floor(sorted.length/2)],p95Ms:sorted[Math.ceil(sorted.length*.95)-1],bytes,samples});}
const invalid=await fetch(base+'/?date=2026-02-30');if(invalid.status!==400)throw Error('Nevalidní vstup není odmítnut.');
const output={timestamp:new Date().toISOString(),base,dataset:expected,version:state.version,revision:state.revision,conditions:'12 sequential requests per route, audit first after count-only health, Node fetch full body; first reported separately (not guaranteed isolate cold start); warm sample 11 is not production p95',results};
if(process.argv[3])writeFileSync(process.argv[3],JSON.stringify(output,null,2));console.log(JSON.stringify({...output,results:results.map(({samples,...r})=>r)},null,2));
