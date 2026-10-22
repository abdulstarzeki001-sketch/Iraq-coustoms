import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const read = path => readFileSync(path, 'utf8');
test('Safari A4 print uses vector page DOM with no screenshot rasterization', () => {
 const css=read('src/styles.css');
 const view=read('src/pages/DocumentView.tsx');
 assert.match(css, /@page\s*\{\s*size:\s*A4 portrait/);
 assert.match(css, /break-after:\s*auto\s*!important/);
 assert.match(css, /page-break-inside:\s*avoid/);
 assert.match(view, /window\.print\(\)/);
 assert.doesNotMatch(view, /html2canvas|toDataURL|canvas\.toBlob/);
});
test('Cloudflare deployment builds React/Vite dist, not the old static site', () => {
 const yaml=read('.github/workflows/cloudflare-pages.yml');
 assert.match(yaml, /npm run typecheck/);
 assert.match(yaml, /npm run build/);
 assert.match(yaml, /pages deploy dist/);
 assert.match(yaml, /node scripts\/check-cloudflare-pages\.mjs/);
 assert.match(yaml, /CLOUDFLARE_PAGES_TOKEN/);
 assert.doesNotMatch(yaml, /cp index\.html form\.html/);
});
test('Cloudflare preflight fails safely if API token is missing', () => {
 const check=spawnSync(process.execPath,['scripts/check-cloudflare-pages.mjs'],{
   encoding:'utf8',timeout:8000,
   env:{...process.env,CLOUDFLARE_API_TOKEN:'',CLOUDFLARE_ACCOUNT_ID:'d45cb55f3d7654fc0eee90ca0e844378',CLOUDFLARE_PAGES_PROJECT:'iraq-coustoms'},
 });
 assert.equal(check.status,1);
 assert.match(check.stderr,/Missing CLOUDFLARE_PAGES_TOKEN/);
});
test('Cloudflare preflight refuses malformed account and does not print token', () => {
 const secret='SHOULD_NEVER_APPEAR_IN_LOGS';
 const check=spawnSync(process.execPath,['scripts/check-cloudflare-pages.mjs'],{
  encoding:'utf8',timeout:8000,
  env:{...process.env,CLOUDFLARE_API_TOKEN:secret,CLOUDFLARE_ACCOUNT_ID:'wrong-id',CLOUDFLARE_PAGES_PROJECT:'iraq-coustoms'},
 });
 assert.equal(check.status,1);
 assert.match(check.stderr,/Invalid CLOUDFLARE_ACCOUNT_ID/);
 assert.ok(!check.stderr.includes(secret));
 assert.ok(!check.stdout.includes(secret));
});
