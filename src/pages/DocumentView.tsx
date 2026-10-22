import { ArrowRight, Download, FileText, Printer, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { money } from '../lib/format';

type DetailRow=[string,string];
function Details({title,rows}:{title:string;rows:DetailRow[]}){
 return <section className="sheet-section">
  <h3 className="sheet-section-title">{title}</h3>
  <table className="sheet-table"><tbody>
   {rows.map(([label,value])=><tr key={label}><th scope="row">{label}</th><td>{value||'—'}</td></tr>)}
  </tbody></table>
 </section>;
}

export default function DocumentView(){
 const {id}=useParams();
 const {db}=useStore();
 const d=db.documents.find(record=>record.id===id);
 if(!d)return <div className="not-found"><FileText size={48}/><h1>لم يُعثر على المستند</h1>
  <Link className="action-button outline" to="/documents">العودة إلى المستندات</Link></div>;

 const transport:DetailRow[]=[
  ['اسم سيطرة الدخول',d.checkpoint_name_control],
  ['اسم السائق',d.driver_name],
  ['رقم العجلة',d.vehicle_number],
  ['محافظة تسجيل العجلة',d.registration_governorate],
  ['نوع / تفاصيل الحمولة',d.cargo_typedetails],
  ['الوزن / الكمية',d.weight_quantity],
  ['الوجهة النهائية / المحافظة',d.destination_governorate]
 ];
 const company:DetailRow[]=[
  ['اسم الشركة / المشروع',d.company_name_project],
  ['رقم الشركة',d.company_number],
  ['المحافظة',d.governorate_name],
  ['الجهة المانحة للإجازة / الموافقة',d.granting_license_approval],
  ['رقم الإجازة / الموافقة',d.license_approval_number],
  ['تاريخ الإجازة / الموافقة',d.license_approval_date],
  ['منطوق الإجازة / الاختصاص',d.license_text_specialization],
  ['العلامة التجارية',d.brand]
 ];
 // Source-compatible robot?url wrapper: encode its referenced target, not the wrapper itself.
 const rawQr=(d.qr_code||'').trim();
 let qrText=rawQr;
 try{
  const link=new URL(rawQr);
  if(link.hostname==='customs-uboor.ur.gov.iq' && link.pathname==='/robot')
   qrText=link.searchParams.get('url') || rawQr;
 }catch{/* Non-URL references are kept as entered. */}
 const displayQr=qrText.length>0 && qrText.length<=1800;
 async function printPdf(){
  try{
   if(document.fonts?.ready) await document.fonts.ready;
   await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>('.print-sheet img'))
     .map(img=>img.decode?.().catch(()=>undefined) || Promise.resolve()));
  }catch{ /* Continue with device fonts if external fonts are unavailable. */ }
  window.print();
 }
 return <div className="document-view">
  <div className="document-toolbar">
   <Link className="subtle-button" to="/documents"><ArrowRight size={17}/> العودة إلى الأرشيف</Link>
   <span>معاينة وثيقة رقم <b dir="ltr">{d.doc_id}</b></span>
   <button type="button" onClick={()=>void printPdf()} className="action-button primary">
    <Printer size={18}/> طباعة / حفظ PDF واضح <Download size={16}/>
   </button>
  </div>
  <div className="document-preview">
   <article className="print-sheet" dir="rtl" aria-label="معاينة مستند A4">
    <header className="sheet-top">
     <div className="sheet-office">
      <p className="sheet-small-heading">سجل معلومات الحمولة</p>
      <h2>منصة إدارة الشركات والنقل</h2>
      <p>نسخة إدارية غير حكومية ولا تمثل إصداراً رسمياً</p>
     </div>
     <div className="sheet-identity" aria-label="Customs Studio">
      <ShieldCheck size={36} strokeWidth={1.45}/><small>CS · STUDIO</small>
     </div>
     <div className="sheet-meta">
      <div><span>رقم الوثيقة</span><strong dir="ltr">{d.doc_id}</strong></div>
      <div><span>تاريخ الإنشاء</span><strong dir="ltr">{d.date_str}</strong></div>
      <div><span>التوقيت</span><strong dir="ltr">{d.time_str}</strong></div>
     </div>
    </header>
    <div className="sheet-divider"/>
    <h1 className="sheet-title">مستند بيانات الحمولة – نسخة داخلية</h1>
    <div className="sheet-subject"><strong>الموضوع /</strong><span>{d.subject||'بيانات الحمولة'}</span></div>
    <Details title="المعلومات الشخصية وبيانات الحمولة" rows={transport}/>
    <Details title="بيانات الشركة والإجازة" rows={company}/>
    <section className="sheet-section">
     <h3 className="sheet-section-title">المواد / المنتجات</h3>
     <table className="sheet-table sheet-products">
      <thead><tr><th scope="col">اسم المادة / المنتج</th><th scope="col">الطاقة الإنتاجية / الكمية</th><th scope="col">الوحدة</th></tr></thead>
      <tbody><tr><td>{d.item_name||'—'}</td><td>{d.production_capacity||'—'}</td><td>{d.unit||'—'}</td></tr></tbody>
     </table>
    </section>
    <div className="sheet-finance">
     <div><span>حساب التاجر</span><strong>{d.trader_name||'—'}</strong></div>
     <div><span>القيمة المسجلة بالدولار</span><strong dir="ltr">{money(d.document_value_usd)}</strong></div>
    </div>
    {(displayQr||d.qr_image_data)&&<div className="sheet-qr">
      {displayQr?<QRCodeSVG value={qrText} size={224} level="M" marginSize={2} title="رمز QR مرجعي غير معتمد"/>:
       <img src={d.qr_image_data} alt="صورة QR أضافها المستخدم ولم يتم التحقق منها"/>}
      <span>QR مرجعي أدخله المستخدم · غير مرتبط بخدمة تحقق حكومية</span>
     </div>}
    {qrText&&<p className="sheet-reference"><strong>المرجع المدخل:</strong> <span dir="auto">{qrText}</span></p>}
    <div className="sheet-note">
     حُفظت هذه البيانات لأغراض تنظيم سجلات الشركة والحمولة. للاعتماد الرسمي يرجى الرجوع إلى الجهة المختصة.
    </div>
    <footer className="sheet-foot">
     <div><strong>مستند إداري مستقل وغير حكومي</strong><span>لا يُعد تصريح عبور أو تخليص كمركي أو إثبات موافقة رسمية.</span></div>
     <span dir="ltr">CUSTOMS STUDIO · INTERNAL RECORD</span>
    </footer>
   </article>
  </div>
  <p className="print-tip">جودة النصوص والجداول في PDF متجهية وقابلة للتكبير. على iPhone افتح «طباعة / حفظ PDF» ثم وسّع معاينة الطباعة بإصبعين واحفظها في «الملفات». الصورة المرفقة وحدها تعتمد جودتها على دقتها الأصلية.</p>
 </div>;
}
