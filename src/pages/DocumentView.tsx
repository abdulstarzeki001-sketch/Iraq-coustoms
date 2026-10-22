import { ArrowRight, Download, FileText, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { money } from '../lib/format';

type DetailRow = [string, string];
function Details({title,rows}:{title:string;rows:DetailRow[]}) {
 return <section className="sheet-section">
  <h3 className="sheet-section-title">{title}</h3>
  <table className="sheet-table"><tbody>{rows.map(([label,value])=>
   <tr key={label}><th scope="row">{label}</th><td>{value||'—'}</td></tr>
  )}</tbody></table>
 </section>;
}

export default function DocumentView(){
 const {id}=useParams();
 const {db}=useStore();
 const d=db.documents.find(record=>record.id===id);
 if(!d)return <div className="not-found"><FileText size={48}/><h1>لم يُعثر على المستند</h1><Link className="action-button outline" to="/documents">العودة إلى المستندات</Link></div>;

 const company:DetailRow[]=[
  ['اسم الشركة / المشروع',d.company_name_project],
  ['رقم الشركة',d.company_number],
  ['المحافظة',d.governorate_name],
  ['الجهة المانحة للإجازة',d.granting_license_approval],
  ['رقم الإجازة / الموافقة',d.license_approval_number],
  ['تاريخ الإجازة',d.license_approval_date],
  ['الاختصاص / منطوق الإجازة',d.license_text_specialization],
  ['العلامة التجارية',d.brand],
 ];
 const transport:DetailRow[]=[
  ['سيطرة الدخول',d.checkpoint_name_control],
  ['اسم السائق',d.driver_name],
  ['رقم العجلة',d.vehicle_number],
  ['محافظة تسجيل العجلة',d.registration_governorate],
  ['نوع / تفاصيل الحمولة',d.cargo_typedetails],
  ['الوزن / الكمية',d.weight_quantity],
  ['المحافظة النهائية',d.destination_governorate],
 ];
 return <div className="document-view">
  <div className="document-toolbar">
   <Link className="subtle-button" to="/documents"><ArrowRight size={17}/> عودة للأرشيف</Link>
   <span>معاينة سجل داخلي رقم {d.doc_id}</span>
   <button type="button" onClick={()=>window.print()} className="action-button primary"><Printer size={18}/> طباعة / حفظ PDF <Download size={16}/></button>
  </div>
  <article className="print-sheet" dir="rtl" aria-label="معاينة مستند حمولة قابل للطباعة">
   <header className="sheet-top">
    <div><h2>سجل معلومات الحمولة</h2><p>منصة إدارة الشحن — سجلات الشركات والنقل</p><p>نسخة إدارية مستقلة وغير حكومية</p></div>
    <div className="sheet-identity" aria-label="Customs Studio">CS<small>STUDIO</small></div>
    <div className="sheet-meta">
     <div><span>رقم المستند</span><strong dir="ltr">{d.doc_id}</strong></div>
     <div><span>التاريخ</span><strong dir="ltr">{d.date_str}</strong></div>
     <div><span>التوقيت</span><strong dir="ltr">{d.time_str}</strong></div>
    </div>
   </header>
   <h1 className="sheet-title">وثيقة بيانات الحمولة — نسخة داخلية</h1>
   <div className="sheet-subject"><strong>الموضوع:</strong> {d.subject||'بيانات الحمولة'}</div>
   <Details title="بيانات الشركة والإجازة" rows={company}/>
   <Details title="بيانات السائق والعجلة والحمولة" rows={transport}/>
   <section className="sheet-section">
    <h3 className="sheet-section-title">المواد والمنتجات</h3>
    <table className="sheet-table sheet-products">
     <thead><tr><th scope="col">اسم المادة / المنتج</th><th scope="col">الطاقة / الكمية</th><th scope="col">الوحدة</th></tr></thead>
     <tbody><tr><td>{d.item_name||'—'}</td><td>{d.production_capacity||'—'}</td><td>{d.unit||'—'}</td></tr></tbody>
    </table>
   </section>
   <div className="sheet-finance">
    <div><span>حساب التاجر</span><strong>{d.trader_name||'—'}</strong></div>
    <div><span>القيمة المسجلة</span><strong dir="ltr">{money(d.document_value_usd)}</strong></div>
   </div>
   {d.qr_image_data&&<div className="sheet-qr"><img src={d.qr_image_data} alt="صورة QR مرفقة، لم يتم التحقق من صحتها"/>
    <span>رمز QR مرفق من المستخدم — غير متحقق منه</span></div>}
   {d.qr_code&&<p className="sheet-reference">المرجع المدخل: <span dir="ltr">{d.qr_code}</span></p>}
   <footer className="sheet-foot"><strong>للاستخدام الإداري الداخلي فقط، وليس وثيقة حكومية أو إثبات اعتماد أو تخليص كمركي.</strong>
    <span>Customs Studio · Internal Use</span></footer>
  </article>
  <p className="print-tip">للحصول على ملف واضح بدقة عالية، اختر «طباعة / حفظ PDF» من المتصفح: النصوص والجداول تُطبع كعناصر واضحة وقابلة للتحديد، دون تحويل الصفحة إلى صورة منخفضة الدقة.</p>
 </div>;
}
