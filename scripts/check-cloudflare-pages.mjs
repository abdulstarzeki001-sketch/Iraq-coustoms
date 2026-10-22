#!/usr/bin/env node
/**
 * Read-only preflight before publishing static files to Cloudflare Pages.
 * Secrets are never logged or written into the site.
 */
const token=(process.env.CLOUDFLARE_API_TOKEN||'').trim();
const account=(process.env.CLOUDFLARE_ACCOUNT_ID||'').trim();
const project=(process.env.CLOUDFLARE_PAGES_PROJECT||'').trim();

function fail(message){
  console.error('::error title=Cloudflare Pages::'+message.replace(/[\r\n]/g,' '));
  process.exitCode=1;
}
if(!token){
  fail('Missing CLOUDFLARE_PAGES_TOKEN (or CLOUDFLARE_API_TOKEN). Deployment not attempted.');
}else if(!/^[a-f\d]{32}$/i.test(account)){
  fail('Invalid CLOUDFLARE_ACCOUNT_ID. Set the account that owns this Pages project.');
}else if(!/^[a-z0-9][a-z0-9-]{0,57}[a-z0-9]$/.test(project)){
  fail('Invalid CLOUDFLARE_PAGES_PROJECT. Set the exact Pages project slug.');
}else{
  try{
    const endpoint='https://api.cloudflare.com/client/v4/accounts/'+account+'/pages/projects/'+project;
    const response=await fetch(endpoint,{
      headers:{Authorization:'Bearer '+token,Accept:'application/json'},
      signal:AbortSignal.timeout(20000),
    });
    const payload=await response.json().catch(()=>({}));
    if(!response.ok||payload.success!==true){
      const codes=Array.isArray(payload.errors)?payload.errors.map(e=>Number(e.code)).filter(Number.isFinite):[];
      if(response.status===404){
        fail('Pages project "'+project+'" does not exist under Account ID '+account+'. Set CLOUDFLARE_PAGES_PROJECT to the actual Pages project slug. No upload occurred.');
      }else if(response.status===401||response.status===403||codes.includes(10000)){
        fail('Cloudflare denied Pages project access (HTTP '+response.status+', codes '+codes.join(',')+'). Token must grant Account > Cloudflare Pages > Edit to the correct account. Do not use R2 S3 keys.');
      }else{
        fail('Pages lookup failed (HTTP '+response.status+', codes '+codes.join(',')+'). No upload occurred.');
      }
    }else{
      console.log('Cloudflare Pages project access verified for '+project+' in account '+account+'.');
    }
  }catch(e){
    fail('Could not verify Cloudflare Pages access ('+(e instanceof Error?e.name:'network error')+'). No upload occurred.');
  }
}
