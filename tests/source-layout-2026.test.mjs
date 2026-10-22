import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=(path)=>readFileSync(path,'utf8');

test('PDF maps source data fields in their exact source order',()=>{
 const view=read('src/pages/DocumentView.tsx');
 const labels=['اسم سيطرة الدخول','اسم السائق','رقم العجلة','محافظة تسجيل العجلة',
 'نوع / تفاصيل الحمولة','الوزن / الكمية','الوجهة النهائية / المحافظة','اسم المحافظة',
 'اسم الشركة / المشروع','الجهة المانحة للإجازة / الموافقة','رقم الإجازة / الموافقة',
 'تاريخ الإجازة / الموافقة','منطوق الإجازة / الاختصاص','العلامة التجارية'];
 const a=view.slice(view.indexOf('const sourceRows:'),view.indexOf('const rawQr'));
 let last=-1;
 for(const field of labels){const index=a.indexOf(field);assert.ok(index>last,field+' must follow prior field');last=index}
 assert.match(view,/colSpan=\{2\}/);
 assert.match(view,/width:'35%'/);
 assert.match(view,/width:'65%'/);
 assert.match(view,/المواد \/ المنتجات المرخَّصة/);
});

test('Print is full size A4 vector and never crops fixed height',()=>{
 const sheet=read('src/print-document.css'),view=read('src/pages/DocumentView.tsx');
 assert.match(sheet,/@page\{size:A4;margin:9mm\}/);
 assert.match(sheet,/@page :first\{margin:9mm\}/);
 assert.match(sheet,/zoom:1!important/);
 assert.match(sheet,/\.print-sheet\{position:static!important/);
 assert.match(sheet,/height:auto!important/);
 assert.doesNotMatch(sheet,/overflow:hidden/);
 assert.match(view,/<QRCodeSVG/);
 assert.match(view,/window\.print\(\)/);
 assert.doesNotMatch(view,/html2canvas|domtoimage|toDataURL/);
});

test('The same visual system is applied across all project pages',()=>{
 const imports=read('src/main.tsx'),global=read('src/unified-source-theme.css');
 const routes=read('src/App.tsx');
 assert.match(imports,/unified-source-theme\.css/);
 assert.match(imports,/print-document\.css/);
 for(const key of ['.sidebar-nav','.glass-panel','.data-table','.field input','.settings-card','.hero','.portal-table','.mobile-bottom-nav'])assert.ok(global.includes(key),key);
 for(const route of ['/companies','/documents','/traders','/settings','/documents/new'])assert.ok(routes.includes(route),route);
});

test('Additional products are persisted in user records and printed as rows',()=>{
 const edit=read('src/pages/Editor.tsx'),types=read('src/lib/types.ts'),view=read('src/pages/DocumentView.tsx');
 assert.match(types,/items\?: ProductItem\[\]/);
 assert.match(edit,/addProductItem/);
 assert.match(edit,/editProductItem/);
 assert.match(edit,/removeProductItem/);
 assert.match(view,/\.\.\.\(d\.items\|\|\[\]\)/);
 assert.match(view,/products\.map/);
});

test('All official-looking elements are non-government rather than copied credentials',()=>{
 const view=read('src/pages/DocumentView.tsx');
 const app=read('src/components/Navigation.tsx');
 assert.match(view,/غير حكومية/);
 assert.match(view,/موافقة رسمية/);
 assert.doesNotMatch(view,/وزارة المالية|الهيئــة العامــة للكمـــارك|Prime Minister/);
 assert.doesNotMatch(app,/وزارة المالية|Prime Minister/);
});
