import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, ClipboardList, FileCheck2, Package, QrCode, Truck, Wallet } from 'lucide-react';
import { useStore } from '../lib/store';
import type { Company, DocumentRecord } from '../lib/types';
import { dateNow, findCompanies, timeNow, uid } from '../lib/format';
import { ActionButton, Field, PageTitle, Panel } from '../components/UI';
import { saveDriver, searchDrivers } from '../lib/driverDirectory';

const provinces=['بغداد','البصرة','نينوى','أربيل','النجف','كربلاء','بابل','الأنبار','ذي قار',
 'ديالى','كركوك','واسط','ميسان','المثنى','صلاح الدين','دهوك','السليمانية','القادسية'];
const initial=():DocumentRecord=>({
 id:'',createdAt:'',doc_id:'',date_str:dateNow(),time_str:timeNow(),
 subject:'الوثيقة المؤقتة لبيانات الحمولة من قبل الشركة',company_number:'',
 company_name_project:'',governorate_name:'',granting_license_approval:'',
 license_approval_number:'',license_approval_date:'',license_text_specialization:'',
 brand:'',item_name:'',production_capacity:'',unit:'',cargo_typedetails:'',
 checkpoint_name_control:'',driver_name:'',vehicle_number:'',registration_governorate:'',
 weight_quantity:'',destination_governorate:'',trader_name:'',document_value_usd:0,qr_image_data:'',qr_code:''
});
export default function Editor(){
 const {db,addDocument}=useStore();
 const navigate=useNavigate();
 const location=useLocation();
 const draftKey='customs_studio_editor_draft_v1';
 const [doc,setDoc]=useState<DocumentRecord>(()=>{
  const fresh=initial();
  try{
   const saved=JSON.parse(localStorage.getItem(draftKey)||'{}');
   if(saved && typeof saved==='object' && !Array.isArray(saved))
    return {...fresh,...saved,id:'',createdAt:'',qr_image_data:''};
  }catch{}
  return fresh;
 });
 const [driverSuggestionsOpen,setDriverSuggestionsOpen]=useState(false);
 useEffect(()=>{
  const timer=window.setTimeout(()=>{
   try{localStorage.setItem(draftKey,JSON.stringify({...doc,qr_image_data:''}));}catch{}
  },500);
  return ()=>window.clearTimeout(timer);
 },[doc]);
 const [companyQuery,setCompanyQuery]=useState('');
 const [error,setError]=useState('');
 const [qrName,setQrName]=useState('');
 const [showResults,setShowResults]=useState(false);
 function update<K extends keyof DocumentRecord>(key:K,val:DocumentRecord[K]){
  setDoc(prev=>({...prev,[key]:val}));
 }
 function fill(c:Company){
  setDoc(prev=>({...prev,company_number:c.Number,company_name_project:c.CompanyNameProject,
   governorate_name:c.GovernorateName||'',granting_license_approval:c.GrantingLicenseApproval||'',
   license_approval_number:c.LicenseApprovalNumber||'',license_approval_date:c.LicenseApprovalDate||'',
   license_text_specialization:c.LicenseTextSpecialization||'',brand:c.Brand||'',
   cargo_typedetails:c.CargoDetails||c.TypeIndustryProduction||'',item_name:c.TypeIndustryProduction||c.CargoDetails||'',
   unit:c.Unit||''}));
  setCompanyQuery(c.CompanyNameProject);setShowResults(false);
 }
 useEffect(()=>{
  const state=location.state as {company?:Company;quantity?:string}|null;
  if(state?.company){
   fill(state.company);
   if(state.quantity)update('weight_quantity',state.quantity);
  }
 },[location.key]);
 function t(name:keyof DocumentRecord,label:string,placeholder='',required=false){
  return <Field label={label}><input required={required} name={String(name)} value={String(doc[name]??'')}
   placeholder={placeholder} onChange={e=>update(name,e.target.value as never)} /></Field>;
 }
 async function onQr(e:ChangeEvent<HTMLInputElement>){
  const f=e.target.files?.[0];if(!f)return;
  if(!['image/png','image/jpeg','image/webp'].includes(f.type)){setError('ملف QR يجب أن يكون PNG أو JPEG أو WebP.');return;}
  if(f.size>1_500_000){setError('صورة QR كبيرة جداً. الحد 1.5 ميغابايت للحفاظ على مساحة التخزين المحلية.');return;}
  const reader=new FileReader();
  reader.onload=()=>{update('qr_image_data',String(reader.result));setQrName(f.name);setError('');};
  reader.onerror=()=>setError('فشل قراءة صورة QR');
  reader.readAsDataURL(f);
 }
 function save(e:FormEvent){
  e.preventDefault();setError('');
  if(!doc.doc_id.trim()||!doc.company_name_project.trim()||!doc.driver_name.trim()||!doc.vehicle_number.trim()||!doc.trader_name.trim()){
   setError('أكمل رقم المستند والشركة والسائق ورقم السيارة والتاجر.');return;
  }
  if(db.documents.some(x=>x.doc_id.trim()===doc.doc_id.trim())){
   setError('رقم المستند موجود مسبقاً. اختر رقماً مختلفاً.');return;
  }
  if(!/^[0-9٠-٩]+$/.test(doc.doc_id.trim())){
   setError('رقم المستند يجب أن يحتوي على أرقام فقط.');return;
  }
  if(!doc.license_approval_number.trim()||!doc.destination_governorate.trim()){
   setError('رقم الإجازة والوجهة النهائية حقلان مطلوبان.');return;
  }
   if(!/^[0-9٠-٩\\s/-]+$/.test(doc.vehicle_number.trim())){
   setError('رقم العجلة يجب أن يتكوّن من أرقام مع السماح بالشرطات.');return;
  }
  if(!Number.isFinite(Number(doc.document_value_usd))||Number(doc.document_value_usd)<0){
   setError('قيمة المستند يجب أن تكون رقماً غير سالب.');return;
  }
  const record={...doc,id:uid(),createdAt:new Date().toISOString(),document_value_usd:Number(doc.document_value_usd)};
  addDocument(record);
  saveDriver({driver_name:record.driver_name,vehicle_number:record.vehicle_number,
   registration_governorate:record.registration_governorate});
  try{localStorage.removeItem(draftKey);}catch{}
  navigate('/documents/'+record.id);
 }
 return <>
  <PageTitle eyebrow="NEW SHIPMENT / إنشاء" title="إدخال مستند شحن"
   description="استمارة بيانات داخلية منظمة، وليست وثيقة حكومية أو تصريح عبور رسمي."/>
  <form onSubmit={save} className="editor-layout">
   <div className="editor-main">
    <Panel className="editor-panel"><h2 className="form-section-heading"><Building2 size={20}/> الشركة والإجازة <span>01</span></h2>
     <Field label="البحث والتعبئة التلقائية">
      <div className="suggestion-wrap">
       <input value={companyQuery} onChange={e=>{setCompanyQuery(e.target.value);setShowResults(true);}}
        onFocus={()=>setShowResults(true)} placeholder="اسم الشركة أو رقمها أو رقم الإجازة" autoComplete="off"/>
       {showResults&&companyQuery.trim()&&<div className="suggestions">
        {findCompanies(db.companies,companyQuery,8).map(c=><button type="button" key={c.Number+c.CompanyNameProject} onClick={()=>fill(c)}>
         <strong>{c.CompanyNameProject}</strong><small>{c.Number} · {c.LicenseApprovalNumber||'لا يوجد رقم إجازة'}</small></button>)}
        {!findCompanies(db.companies,companyQuery,8).length&&<span className="suggestion-empty">لا توجد نتيجة؛ يمكنك إدخال اسم الشركة يدوياً.</span>}
       </div>}
      </div>
     </Field>
     <div className="form-grid">
      {t('company_name_project','اسم الشركة / المشروع','اسم الشركة',true)}
      {t('company_number','رقم الشركة')}
      {t('governorate_name','محافظة الشركة')}
      {t('brand','العلامة التجارية')}
      {t('granting_license_approval','الجهة المانحة للإجازة')}
      {t('license_approval_number','رقم الإجازة / الموافقة')}
      {t('license_approval_date','تاريخ الإجازة','YYYY-MM-DD')}
     </div>
     <Field label="منطوق الإجازة / الاختصاص"><textarea rows={2} value={doc.license_text_specialization} onChange={e=>update('license_text_specialization',e.target.value)}/></Field>
    </Panel>
    <Panel className="editor-panel"><h2 className="form-section-heading"><ClipboardList size={20}/> معلومات المستند <span>02</span></h2>
     <div className="form-grid">
      {t('doc_id','رقم المستند','رقم فريد',true)}
      <Field label="تاريخ الإنشاء"><input type="date" required value={doc.date_str} onChange={e=>update('date_str',e.target.value)}/></Field>
      <Field label="الوقت"><input type="time" value={doc.time_str} onChange={e=>update('time_str',e.target.value)}/></Field>
      {t('subject','الموضوع','موضوع المستند',true)}
     </div>
    </Panel>
    <Panel className="editor-panel"><h2 className="form-section-heading"><Truck size={20}/> السائق والحمولة <span>03</span></h2>
     <div className="form-grid">
      <Field label="سيطرة الدخول"><select value={doc.checkpoint_name_control} onChange={e=>update('checkpoint_name_control',e.target.value)}>
       <option value="">اختر السيطرة</option>{['سيطرة دارمان','سيطرة السد','سيطرة جيمن','سيطرة باوه محمود'].map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field label="اسم السائق">
       <div className="suggestion-wrap">
        <input required value={doc.driver_name} placeholder="اسم السائق أو رقم السيارة"
         onChange={e=>{update('driver_name',e.target.value);setDriverSuggestionsOpen(true);}}
         onFocus={()=>setDriverSuggestionsOpen(true)}
         onBlur={()=>window.setTimeout(()=>setDriverSuggestionsOpen(false),160)}/>
        {driverSuggestionsOpen&&<div className="suggestions" role="listbox" aria-label="السائقون المحفوظون">
         {searchDrivers(doc.driver_name,10).map((driver,i)=><button type="button" key={driver.driver_name+'-'+driver.vehicle_number+'-'+i}
           onMouseDown={e=>e.preventDefault()} onClick={()=>{
             setDoc(prev=>({...prev,driver_name:driver.driver_name,vehicle_number:driver.vehicle_number,
                registration_governorate:driver.registration_governorate}));
             setDriverSuggestionsOpen(false);
           }}>
           <strong>{driver.driver_name}</strong>
           <small>{driver.vehicle_number} · {driver.registration_governorate||'محافظة غير محددة'}</small>
         </button>)}
        </div>}
       </div>
      </Field>
      {t('vehicle_number','رقم السيارة','رقم السيارة',true)}
      {t('registration_governorate','محافظة تسجيل العجلة')}
      <Field label="الوجهة النهائية"><select value={doc.destination_governorate} onChange={e=>update('destination_governorate',e.target.value)}>
       <option value="">اختر الوجهة</option>{provinces.map(x=><option key={x}>{x}</option>)}</select></Field>
      {t('weight_quantity','الوزن / الكمية')}
     </div>
     <Field label="تفاصيل الحمولة"><textarea rows={3} value={doc.cargo_typedetails} onChange={e=>update('cargo_typedetails',e.target.value)}/></Field>
     <div className="form-grid">{t('item_name','المادة / المنتج')}{t('production_capacity','الطاقة الإنتاجية')}{t('unit','الوحدة')}</div>
    </Panel>
    <Panel className="editor-panel"><h2 className="form-section-heading"><QrCode size={20}/> رمز QR المرفق <span>04</span></h2>
     <Field label="رفع صورة QR (اختياري)" hint="يُعرض كصورة مرفقة فقط؛ لا تُعد دليلاً على صحة المستند.">
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onQr}/>
     </Field>
     {qrName&&<p className="small-success">تم إرفاق: {qrName}</p>}
     {t('qr_code','رابط مرجعي اختياري','https://...')}
    </Panel>
   </div>
   <aside className="editor-aside">
    <Panel className="editor-panel sticky-summary"><h2 className="form-section-heading"><Wallet size={20}/> ربط حساب التاجر <span>05</span></h2>
     {t('trader_name','اسم التاجر','اسم حساب التاجر',true)}
     <Field label="قيمة المستند بالدولار"><input type="number" min="0" step=".01" dir="ltr" value={doc.document_value_usd}
      onChange={e=>update('document_value_usd',Number(e.target.value))} required/></Field>
     <p className="summary-note">عند الحفظ ستُسجّل القيمة ضمن المستحقات على التاجر، وتظهر في كشف حسابه تلقائياً.</p>
     {error&&<div role="alert" className="form-error">{error}</div>}
     <ActionButton type="submit" className="full"><FileCheck2 size={18}/> حفظ وعرض المستند</ActionButton>
     <button type="button" className="subtle-button full" onClick={()=>{try{localStorage.removeItem(draftKey);}catch{}setDoc(initial());setCompanyQuery('');setQrName('');setError('');}}>
      <ArrowRight size={16}/> مسح الاستمارة</button>
     <small className="as-is-warning">هذه استمارة إدارية داخلية غير معتمدة من جهة حكومية.</small>
    </Panel>
   </aside>
  </form>
 </>;
}
