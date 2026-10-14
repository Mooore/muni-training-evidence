import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const run=(cmd,args,extra={})=>{const result=spawnSync(cmd,args,{stdio:'inherit',...extra});if(result.status!==0)throw Error(`${cmd} ${args.join(' ')} failed`);};
const revision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
if(!/^[a-f0-9]{40}$/.test(revision))throw Error('Cannot determine revision');
const requireClean=()=>{const status=spawnSync('git',['status','--porcelain'],{encoding:'utf8'});if(status.status!==0||status.stdout.trim())throw Error('Commit all changes before deployment; revision must identify the exact source.');};
requireClean();
run('npm',['run','check']);
requireClean();
run('npx',['wrangler','deploy','--var',`APP_REVISION:${revision}`]);
mkdirSync('.artifacts',{recursive:true});
try{run('node',['scripts/verify/smoke.mjs','https://muni-training-evidence.mirinda-posp.workers.dev','.artifacts/remote-smoke.json'],{env:{...process.env,EXPECTED_REVISION:revision}});}
catch(error){if(process.env.ROLLBACK_VERSION){console.error('Smoke failed; restoring explicitly supplied prior code version. Database pointer is unchanged.');run('npx',['wrangler','rollback',process.env.ROLLBACK_VERSION,'--yes']);run('node',['scripts/verify/smoke.mjs','https://muni-training-evidence.mirinda-posp.workers.dev','.artifacts/rollback-smoke.json']);}throw error;}
