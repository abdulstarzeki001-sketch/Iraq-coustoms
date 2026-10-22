#!/usr/bin/env node
// Cloudflare Pages deployment gate. Never log the token or include it in error messages.
import { appendFile } from 'node:fs/promises';

const token=(process.env.CLOUDFLARE_API_TOKEN||'').trim();
const account=(process.env.CLOUDFLARE_ACCOUNT_ID||'').trim();
const project=(process.env.CLOUDFLARE_PAGES_PROJECT||'').trim();

async function fail(message){
 console.error('::error title=Cloudflare Pages::'+message);
 if(process.env.GITHUB_STEP_SUMMARY){
  await appendFile(process.env.GITHUB_STEP_SUMMARY,'## Deployment blocked\n\n'+message+'\n');
 }
 process.exitCode=1;
}

if(!token)await fail('Add CLOUDFLARE_PAGES_TOKEN (or CLOUDFLARE_API_TOKEN) as a GitHub Actions repository secret.');
else if(!/^[a-f0-9]{32}$/i.test(account))await fail('Invalid CLOUDFLARE_ACCOUNT_ID; use the Account ID containing the Pages project.');
else if(!/^[a-z0-9][a-z0-9-]{0,57}[a-z0-9]$/.test(project))await fail('Invalid Pages project name; supply the exact existing Cloudflare Pages project name.');
else {
 try{
  const res=await fetch('https://api.cloudflare.com/client/v4/accounts/'+account+'/pages/projects/'+project,{
   headers:{Authorization:'Bearer '+token,Accept:'application/json'},
   signal:AbortSignal.timeout(20000)
  });
  const json=await res.json().catch(()=>({}));
  if(res.status===401||res.status===403)await fail('Cloudflare HTTP '+res.status+': token rejected for this account/project. Use Account > Cloudflare Pages > Edit scoped to the correct account; R2 Access Keys cannot deploy Pages.');
  else if(res.status===404)await fail('Cloudflare HTTP 404: Pages project '+project+' does not exist in account '+account+'. Create/connect the project in Workers & Pages or choose the correct project name.');
  else if(!res.ok||json.success!==true)await fail('Cloudflare Pages project check failed (HTTP '+res.status+'). Review account, token and project configuration.');
  else console.log('Cloudflare Pages target verified: '+project+' in account '+account);
 }catch(error){
  await fail('Could not check Cloudflare Pages API ('+(error instanceof Error?error.name:'network error')+').');
 }
}
