import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AlertTriangle, Database, Download, HardDriveDownload, RotateCcw, ShieldAlert, Upload } from 'lucide-react';
import { useStore, validDatabase } from '../lib/store';
import { companyFrom, dateNow, downloadText } from '../lib/format';
import type { Company } from '../lib/types';
import { ActionButton, PageTitle, Panel } from '../components/UI';

export default function Settings(){
 const {db,replaceDatabase,importCompanies,reset}=useStore();
 const upload=useRef<HTMLInputElement>(null);
 const [error,setError]=useState('');
 const [ok,setOk]=useState('');
 const backup=()=>downloadText('customs-studio-backup-'+dateNow()+'.json',JSON.stringify(db,null,2),'application/json');
 async function onImport(e:ChangeEvent<HTMLInputElement>){
  const f=e.target.files?.[0];if(!f)return;
  setError('');setOk('');
  try {
   if(f.size>15_000_000)throw new Error('الملف كبير جداً؛ الحد الحالي 15 MB.');
   const data=JSON.parse(await f.text());
   if(validDatabase(data)) {
    if(!window.confirm('سيتم استبدال البيانات الحالية بالكامل بمحتويات النسخة الاحتياطية. هل تريد المتابعة؟'))return;
    replaceDatabase(data);setOk('تمت استعادة نسخة قاعدة البيانات.');
   } else {
    const rows=Array.isArray(data)?data:Array.isArray(data?.companies)?data.companies:null;
    if(!rows)throw new Error('الملف لا يحتوي على نسخة بيانات صالحة أو قائمة شركات.');
    const companies=rows.map((x:Record<string,unknown>)=>companyFrom(x)).filter((c:Company)=>c.CompanyNameProject);
    if(!companies.length)throw new Error('لم يُعثر على شركات صالحة.');
    importCompanies(companies);setOk('تم استيراد '+companies.length+' شركة.');
   }
  } catch(err){setError(err instanceof Error?err.message:'فشل الاستيراد');}
  finally{e.target.value='';}
 }
 function deleteEverything(){
  if(window.confirm('تحذير: سيتم حذف جميع الشركات والمستندات والتجار والقبوضات المحفوظة في هذا المتصفح. هل تريد المتابعة؟')){
   if(window.confirm('تأكيد نهائي: هل حمّلت نسخة احتياطية؟ لا يمكن التراجع عن الحذف.')){
    reset();setOk('تم مسح بيانات هذا الجهاز.');
   }
  }
 }
 return <>
  <PageTitle eyebrow="SYSTEM PREFERENCES / الإعدادات" title="الإعدادات والبيانات"
   description="تحكّم ببياناتك المحلية، النسخ الاحتياطي والاستيراد الآمن."/>
  <div className="settings-grid">
   <Panel className="settings-card"><div className="settings-icon"><Database size={24}/></div>
    <h2>قاعدة البيانات المحلية</h2><p>المحتوى محفوظ داخل المتصفح على هذا الجهاز فقط؛ لا توجد مزامنة سحابية مفعّلة.</p>
    <div className="settings-numbers">
     <span>الشركات <strong>{db.companies.length}</strong></span>
     <span>المستندات <strong>{db.documents.length}</strong></span>
     <span>التجار <strong>{db.traders.length}</strong></span>
     <span>القبوضات <strong>{db.payments.length}</strong></span>
    </div>
   </Panel>
   <Panel className="settings-card"><div className="settings-icon"><HardDriveDownload size={24}/></div>
    <h2>تصدير نسخة احتياطية</h2><p>احفظ قاعدة البيانات كاملة بصيغة JSON؛ تتضمن المستندات والتجار والقبوضات والشركات.</p>
    <ActionButton type="button" onClick={backup}><Download size={18}/> تنزيل نسخة JSON</ActionButton>
   </Panel>
   <Panel className="settings-card"><div className="settings-icon"><Upload size={24}/></div>
    <h2>استيراد واستعادة</h2><p>استورد ملف الشركات الأصلي (companies.json) أو نسخة احتياطية مصدرة من التطبيق.</p>
    <button className="action-button outline" onClick={()=>upload.current?.click()}><Upload size={17}/> اختيار ملف JSON</button>
    <input ref={upload} type="file" accept=".json,application/json" hidden onChange={onImport}/>
   </Panel>
   <Panel className="settings-card danger-zone"><div className="settings-icon danger"><ShieldAlert size={24}/></div>
    <h2>إعادة ضبط النظام</h2><p>يحذف كل البيانات المحلية بعد تأكيدين. صدّر نسخة احتياطية قبل استخدام هذه العملية.</p>
    <button onClick={deleteEverything} className="danger-button"><RotateCcw size={17}/> حذف جميع البيانات</button>
   </Panel>
  </div>
  {error&&<p role="alert" className="form-error">{error}</p>}
  {ok&&<p role="status" className="small-success">{ok}</p>}
  <Panel className="privacy-note"><AlertTriangle size={21}/><p><strong>ملاحظة تشغيل:</strong> الموقع واجهة مستقلة لا تتصل بأنظمة الجمارك الحكومية. التخزين المحلي مناسب للاستخدام الفردي والتجربة؛ العمل الجماعي أو المزامنة عبر الأجهزة يحتاج إلى خلفية بيانات مصرح بها مع تسجيل دخول وصلاحيات ونسخ احتياطية.</p></Panel>
 </>;
}
