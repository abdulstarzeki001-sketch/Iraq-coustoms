import { useState } from 'react';
import { ArrowRight, Building2, Download, FileText, Printer, ScanLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { money } from '../lib/format';

type DetailRow=[string,string|undefined];
function SourceTable({title,rows}:{title:string;rows:DetailRow[]}){
 return <section className="sheet-section" aria-label={title}>
  <table className="sheet-table sheet-info-table">
   <colgroup><col style={{width:'35%'}}/><col style={{width:'65%'}}/></colgroup>
   <thead><tr><th colSpan={2} className="sheet-section-title">{title}</th></tr></thead>
   <tbody>{rows.map(([label,value])=><tr key={label}><th scope="row">{label}</th><td dir="auto">{String(value??'').trim()||'—'}</td></tr>)}</tbody>
  </table>
 </section>;
}
export default function DocumentView(){
 const {id}=useParams();
 const {db}=useStore();
 const [fitPreview,setFitPreview]=useState(true);
 const d=db.documents.find(record=>record.id===id);
 if(!d)return <div className="not-found"><FileText size={48}/><h1>لم يُعثر على المستند</h1>
  <Link className="action-button outline" to="/documents">العودة إلى المستندات</Link></div>;

 // Preserve the exact field order used by the source's two-column document table.
 const sourceRows:DetailRow[]=[
  ['اسم سيطرة الدخول',d.checkpoint_name_control],
  ['اسم السائق',d.driver_name],
  ['رقم العجلة',d.vehicle_number],
  ['محافظة تسجيل العجلة',d.registration_governorate],
  ['نوع / تفاصيل الحمولة',d.cargo_typedetails],
  ['الوزن / الكمية',d.weight_quantity],
  ['الوجهة النهائية / المحافظة',d.destination_governorate],
  ['اسم المحافظة',d.governorate_name],
  ['اسم الشركة / المشروع',d.company_name_project],
  ['الجهة المانحة للإجازة / الموافقة',d.granting_license_approval],
  ['رقم الإجازة / الموافقة',d.license_approval_number],
  ['تاريخ الإجازة / الموافقة',d.license_approval_date],
  ['منطوق الإجازة / الاختصاص',d.license_text_specialization],
  ['العلامة التجارية',d.brand]
 ];
 const rawQr=String(d.qr_code??'').trim();
 let qrText=rawQr;
 try{
  const link=new URL(rawQr);
  if(link.hostname==='customs-uboor.ur.gov.iq' && link.pathname==='/robot')
   qrText=link.searchParams.get('url') || rawQr;
 }catch{/* Keep text references unchanged, with no external QR service. */}
 const uploadedQr=typeof d.qr_image_data==='string' && /^data:image\/(?:png|jpeg|webp);base64,/i.test(d.qr_image_data)
  ? d.qr_image_data : '';
 const linkQrImage=/^data:image\/(?:png|jpeg|webp);base64,/i.test(qrText)?qrText:'';
 const safeQr=qrText.length>0 && qrText.length<=1800 && !linkQrImage;
 const hasQr=Boolean(safeQr||uploadedQr||linkQrImage);
 const item=String(d.item_name||d.cargo_typedetails||'').trim();
 const itemDetails=[d.production_capacity,d.unit].filter(Boolean).join(' ');
 const products=[...((item||itemDetails)?[{item_name:item||'—',production_capacity:d.production_capacity,unit:d.unit,monthly_yearly:''}]:[]),
  ...(Array.isArray(d.items)?d.items:[]).filter(row=>row && (String(row.item_name??'').trim()||String(row.production_capacity??'').trim()))];
 async function printPdf(){
  try {
   if(document.fonts?.ready)await document.fonts.ready;
   await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>('.print-sheet img'))
    .map(img=>img.decode?.().catch(()=>undefined)||Promise.resolve()));
  }catch{/* Browser fallback fonts and locally uploaded QR images remain printable. */}
  window.print();
 }
 return <div className="document-view">
  <div className="document-toolbar">
   <Link className="subtle-button" to="/documents"><ArrowRight size={17}/> العودة إلى الأرشيف</Link>
   <div className="document-toolbar-info">
    <strong>معاينة الوثيقة <b dir="ltr">#{d.doc_id}</b></strong>
    <span>قالب A4 · طباعة نصوص وجداول متجهية</span>
   </div>
   <button type="button" onClick={()=>setFitPreview(x=>!x)} className="subtle-button document-fit-button"
    aria-pressed={fitPreview}>{fitPreview?'الحجم الحقيقي':'احتواء الصفحة'}</button>
   <button type="button" onClick={()=>void printPdf()} className="action-button primary">
    <Printer size={18}/> طباعة / حفظ PDF واضح <Download size={16}/>
   </button>
  </div>
  <div className={'document-preview'+(fitPreview?' document-preview-fit':'')}>
   <article className="print-sheet" dir="rtl" aria-label="قالب وثيقة بيانات الحمولة بحجم A4">
    <header className="sheet-top">
     <div className="sheet-office">
      <p className="sheet-small-heading">سجل الشركة والمنتج المحلي</p>
      <h2>منصة إدارة الحمولة والمستندات</h2>
      <p>نظام مستقل لأرشفة بيانات الشحن</p>
     </div>
     <div className="sheet-identity">
      <Building2 size={38} strokeWidth={1.4}/>
      <small>CUSTOMS STUDIO</small>
     </div>
     <div className="sheet-meta">
      <div><span>رقم الوثيقة</span><strong dir="ltr">{d.doc_id}</strong></div>
      <div><span>تاريخ إنشاء الوثيقة</span><strong dir="ltr">{d.date_str}</strong></div>
      <div><span>التوقيت</span><strong dir="ltr">{d.time_str}</strong></div>
     </div>
    </header>
    <div className="sheet-divider"/>
    <h1 className="sheet-title">بيانات المنتج المحلي والحمولة</h1>
    <div className="sheet-subject"><strong>الموضوع /</strong><span>{d.subject||'بيانات الحمولة'}</span></div>
    <SourceTable title="المعلومات الشخصية" rows={sourceRows}/>
    {products.length>0&&<section className="sheet-section sheet-products-section">
     <table className="sheet-table sheet-products">
      <thead><tr><th className="sheet-section-title" colSpan={2}>المواد / المنتجات المرخَّصة</th></tr></thead>
      <tbody>{products.map((row,i)=><tr key={i}><th scope="row">{row.item_name||'—'}</th><td dir="auto">{[row.monthly_yearly,row.production_capacity,row.unit].filter(Boolean).join(' · ')||'—'}</td></tr>)}</tbody>
     </table>
    </section>}
    <section className="sheet-account" aria-label="البيانات المحاسبية الداخلية">
     <div className="sheet-account-heading">بيانات الحساب الداخلي · ليست جزءاً من مستند رسمي</div>
     <div className="sheet-finance">
      <div><span>حساب التاجر</span><strong>{d.trader_name||'—'}</strong></div>
      <div><span>القيمة المسجلة بالدولار</span><strong dir="ltr">{money(d.document_value_usd)}</strong></div>
     </div>
    </section>
    {hasQr&&<div className="sheet-qr" aria-label="الرمز المرجعي">
      {safeQr?<QRCodeSVG value={qrText} size={248} level="M" marginSize={2} title="رمز QR مرجعي غير موثق"/>:
       <img src={linkQrImage||uploadedQr} alt="رمز مرجعي مرفق من المستخدم"/>}
      <span>رمز QR مرجعي · لا يمثل تحققاً حكومياً أو موافقة رسمية</span>
     </div>}
    {!hasQr&&<div className="sheet-qr-placeholder"><ScanLine size={14}/> لا يوجد رمز QR مرفق بهذا المستند</div>}
    <div className="sheet-note">
     <p>احتفظ بهذه النسخة لمراجعة بيانات الحمولة والشركة عند الحاجة.</p>
     <p>تُستعمل لأغراض السجلات الداخلية فقط، وليس لتصريح عبور أو تخليص كمركي.</p>
    </div>
    <footer className="sheet-foot">
     <div><strong>منصة إدارة الشركات والنقل</strong><span>وثيقة معلومات إدارية مستقلة وغير حكومية</span></div>
     <div className="sheet-foot-mid"><FileText size={22}/><span>نسخة سجل محلي</span></div>
     <div className="sheet-foot-en" dir="ltr"><strong>CUSTOMS STUDIO</strong><span>PRIVATE ADMINISTRATIVE RECORD</span></div>
    </footer>
   </article>
  </div>
  <p className="print-tip">القالب مطابق لترتيب الحقول والجداول في الملفات المرجعية مع الحفاظ على هوية إدارية مستقلة. عند الحفظ من Safari اختر «طباعة»، كبّر معاينة الطباعة بإصبعين، ثم «مشاركة» ← «حفظ في الملفات». النص والجدول وQR المولَّد من رابط تبقى حادة عند التكبير لأنها متجهية؛ صورة QR المرفوعة تعتمد على دقتها الأصلية.</p>
 </div>;
}
