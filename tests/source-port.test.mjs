import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const read=(name)=>readFileSync(name,'utf8');

test('Restored company directory contains exactly the 839 published legacy records',()=>{
 const rows=JSON.parse(read('public/data/companies.json'));
 assert.equal(rows.length,839);
 assert.ok(rows.every(x=>x.CompanyNameProject && x.Number!==undefined));
 assert.ok(rows.every(x=>x.LicenseApprovalNumber!==undefined));
});
test('Company catalog is loaded only when there is no user imported catalog',()=>{
 const src=read('src/lib/store.tsx');
 assert.match(src,/data\/companies\.json/);
 assert.match(src,/prev\.companies\.length\?prev/);
});
test('Internal document is a native print layout with no canvas screenshot or fake authority verification',()=>{
 const src=read('src/pages/DocumentView.tsx');
 const css=read('src/print-document.css');
 assert.match(src,/window\.print\(\)/);
 assert.match(src,/المواد والمنتجات/);
 assert.match(src,/غير حكومية/);
 assert.doesNotMatch(src,/html2canvas|toDataURL/);
 assert.match(css,/@page\s*\{\s*size:A4/);
 assert.match(css,/overflow:visible!important/);
});
test('Driver suggestions never prefill names of real persons from a hardcoded roster',()=>{
 const src=read('src/lib/driverDirectory.ts');
 assert.doesNotMatch(src,/const defaults:DriverEntry/);
 assert.match(src,/saved_drivers_v1/);
});
test('Zero value documents and three safe QR MIME types remain supported',()=>{
 const src=read('src/pages/Editor.tsx');
 assert.match(src,/Number\(doc\.document_value_usd\)<0/);
 assert.match(src,/image\/png/);
 assert.match(src,/image\/jpeg/);
 assert.match(src,/image\/webp/);
});
test('New Cloudflare pipeline deploys dist, not legacy static pages',()=>{
 const flow=read('.github/workflows/deploy-pages.yml');
 assert.match(flow,/pages deploy dist/);
 assert.match(flow,/node scripts\/check-pages-target\.mjs/);
 assert.match(flow,/d45cb55f3d7654fc0eee90ca0e844378/);
 assert.ok(existsSync('public/_redirects'));
});
test('Cloudflare preflight refuses missing token without issuing an API request',()=>{
 const run=spawnSync(process.execPath,['scripts/check-pages-target.mjs'],{
  encoding:'utf8',
  env:{...process.env,CLOUDFLARE_API_TOKEN:'',CLOUDFLARE_ACCOUNT_ID:'d45cb55f3d7654fc0eee90ca0e844378',CLOUDFLARE_PAGES_PROJECT:'iraq-coustoms',GITHUB_STEP_SUMMARY:''}
 });
 assert.equal(run.status,1);
 assert.match(run.stderr,/CLOUDFLARE_PAGES_TOKEN/);
});
