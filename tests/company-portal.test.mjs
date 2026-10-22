import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=(path)=>readFileSync(path,'utf8');

test('company profile retains navigation and routes through the local React app',()=>{
 const app=read('src/App.tsx');
 const directory=read('src/pages/Companies.tsx');
 const portal=read('src/pages/CompanyPortal.tsx');
 assert.match(app,/path="\/companies\/:number"/);
 assert.match(directory,/فتح بوابة تفاصيل الشركة/);
 assert.match(portal,/navigate\('\/documents\/new'/);
});
test('company portal uses source-aligned sections without masquerading as the original government portal',()=>{
 const portal=read('src/pages/CompanyPortal.tsx');
 for(const heading of ['معلومات الشركة','معلومات التواصل والموقع','معلومات الإجازة','جهة منح الإجازة','نوع الصناعة','عناصر الشركة','الكمية المطلوبة']){
  assert.ok(portal.includes(heading),heading);
 }
 assert.match(portal,/لا تُرسل طلبات الشحن إلى منظومة حكومية/);
 assert.doesNotMatch(portal,/Hash Code|75764f1ead79fecd|evolaerbil@/i);
 assert.doesNotMatch(portal,/https?:\/\/.*ur\.gov\.iq/);
});
test('request quantity flows to a user-reviewed local document draft',()=>{
 const portal=read('src/pages/CompanyPortal.tsx');
 const editor=read('src/pages/Editor.tsx');
 assert.match(portal,/company,quantity:quantity\.trim\(\)/);
 assert.match(editor,/if\(state\.quantity\)update\('weight_quantity',state\.quantity\)/);
 assert.match(editor,/addDocument\(record\)/);
});
test('company portal remains readable on small screens and does not interfere with printed PDF',()=>{
 const style=read('src/company-portal.css');
 assert.match(style,/@media\(max-width:740px\)/);
 assert.match(style,/overflow-x:auto/);
 assert.match(style,/@media print\{\.company-portal\{display:none/);
});
