import { ArrowRight, Download, FileText, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { money } from '../lib/format';

export default function DocumentView(){
 const {id}=useParams();
 const {db}=useStore();
 const d=db.documents.find(d=>d.id===id);
 if(!d)return <div className="not-found"><FileText size={48}/><h1>لم يُعثر على المستند</h1><Link className="action-button outline" to="/documents">العودة إلى المستندات</Link></div>;
 const fields:[string,string][]=[
  ['اسم سيطرة الدخول',d.checkpoint_name_control],['اسم السائق',d.driver_name],
  ['رقم العجلة',d.vehicle_number],['محافظة تسجيل العجلة',d.registration_governorate],
  ['تفاصيل الحمولة',d.cargo_typedetails],['الوزن / الكمية',d.weight_quantity],
  ['الوجهة النهائية',d.destination_governorate],['اسم المحافظة',d.governorate_name],
  ['اسم الشركة / المشروع',d.company_name_project],['الجهة المانحة للإجازة',d.granting_license_approval],
  ['رقم الإجازة / الموافقة',d.license_approval_number],['تاريخ الإجازة / الموافقة',d.license_approval_date],
  ['منطوق الإجازة / الاختصاص',d.license_text_specialization],['العلامة التجارية',d.brand],
  ['المواد / المنتجات',d.item_name],['الطاقة / الكمية',d.production_capacity],['الوحدة',d.unit],
 ];
 return <div className="document-view">
  <div className="document-toolbar">
   <Link className="subtle-button" to="/documents"><ArrowRight size={17}/> عودة للأرشيف</Link>
   <span>معاينة مستند داخلي #{d.doc_id}</span>
   <button onClick={()=>window.print()} className="action-button primary"><Printer size={18}/> طباعة / حفظ PDF <Download size={16}/></button>
  </div>
  <article className="print-sheet" dir="rtl">
   <div className="sheet-top"><div><h2>سجل معلومات الحمولة</h2><p>نموذج إداري داخلي لإدارة عمليات النقل والشحن</p></div>
    <div className="sheet-identity">CS <small>STUDIO</small></div>
    <div className="sheet-meta"><div><span>رقم المستند</span><strong dir="ltr">{d.doc_id}</strong></div>
     <div><span>التاريخ</span><strong dir="ltr">{d.date_str}</strong></div>
     <div><span>التوقيت</span><strong dir="ltr">{d.time_str}</strong></div></div></div>
   <div className="sheet-title">بيانات مستند حمولة</div>
   <div className="sheet-subject"><strong>الموضوع:</strong> {d.subject}</div>
   <table className="sheet-table"><tbody>{fields.map(([label,value])=><tr key={label}><th>{label}</th><td>{value||'—'}</td></tr>)}</tbody></table>
   <div className="sheet-finance"><div><span>حساب التاجر</span><strong>{d.trader_name}</strong></div>
    <div><span>قيمة المستند</span><strong dir="ltr">{money(d.document_value_usd)}</strong></div></div>
   {d.qr_image_data&&<div className="sheet-qr"><img src={d.qr_image_data} alt="صورة QR مرفقة من المستخدم"/>
    <span>رمز QR مرفق — غير متحقق من صحته</span></div>}
   {d.qr_code&&<div className="sheet-reference">الرابط المرجعي: <span dir="ltr">{d.qr_code}</span></div>}
   <div className="sheet-foot">سجل داخلي غير رسمي — غير صادر عن الهيئة العامة للكمارك أو أي جهة حكومية.
    <span>Customs Studio · Internal Use</span></div>
   <div className="sheet-watermark" aria-hidden="true">نسخة داخلية</div>
  </article>
  <p className="print-tip">على iPhone وiPad اضغط «طباعة / حفظ PDF»، ثم استخدم خيار مشاركة المعاينة لحفظ نسخة PDF في تطبيق الملفات.</p>
 </div>;
}
