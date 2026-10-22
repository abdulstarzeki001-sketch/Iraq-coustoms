import { useMemo, useState } from 'react';
import { Download, FileText, Search, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { downloadText, money, normalize, toCsv } from '../lib/format';
import { ActionLink, Empty, PageTitle, Panel } from '../components/UI';

export default function Documents(){
 const {db}=useStore();
 const [q,setQ]=useState('');
 const filtered=useMemo(()=>db.documents.filter(d=>[d.doc_id,d.company_name_project,d.driver_name,d.vehicle_number,d.trader_name]
  .some(x=>normalize(x).includes(normalize(q)))),[db.documents,q]);
 const exportCsv=()=>downloadText('shipment-documents.csv',toCsv([
  ['التاريخ','رقم المستند','الشركة','السائق','السيارة','الوجهة','التاجر','القيمة بالدولار'],
  ...filtered.map(d=>[d.date_str,d.doc_id,d.company_name_project,d.driver_name,d.vehicle_number,d.destination_governorate,d.trader_name,d.document_value_usd])
 ]),'text/csv;charset=utf-8');
 return <>
  <PageTitle eyebrow="DOCUMENT ARCHIVE / المستندات" title="سجل المستندات"
   description="أرشيف محلي لمستندات الحمولة، قابل للبحث والتصدير والطباعة."
   action={<ActionLink to="/documents/new">مستند جديد</ActionLink>}/>
  <div className="documents-quick"><div><FileText size={22}/><span>المحفوظة</span><strong>{db.documents.length}</strong></div>
   <div><CalendarDays size={22}/><span>آخر تحديث</span><strong>{db.documents[0]?.date_str||'—'}</strong></div></div>
  <Panel className="table-panel">
   <div className="table-head"><div className="search-box compact"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)}
    aria-label="البحث عن مستند" placeholder="رقم مستند، سائق، تاجر، شركة..."/></div>
    <button className="inline-button" onClick={exportCsv} disabled={!filtered.length}><Download size={16}/> تصدير CSV</button>
   </div>
   {filtered.length?<div className="data-table-wrap"><table className="data-table">
    <thead><tr><th>رقم المستند</th><th>تاريخ الإنشاء</th><th>الشركة</th><th>السائق / السيارة</th><th>التاجر</th><th>القيمة</th><th>معاينة PDF</th></tr></thead>
    <tbody>{filtered.map(d=><tr key={d.id}>
     <td><span className="id-pill">{d.doc_id}</span></td><td dir="ltr">{d.date_str}</td><td>{d.company_name_project}</td>
     <td>{d.driver_name}<small className="table-secondary">{d.vehicle_number}</small></td>
     <td>{d.trader_name}</td><td dir="ltr">{money(d.document_value_usd)}</td>
     <td><Link aria-label={'عرض المستند '+d.doc_id} className="table-action" to={'/documents/'+d.id}><FileText size={17}/><span className="table-view-word">عرض</span></Link></td>
    </tr>)}</tbody></table></div>:
    <Empty title={q?'لا توجد نتائج':'الأرشيف فارغ'} description={q?'جرّب مصطلح بحث مختلفاً.':'ابدأ بإنشاء مستند شحن لتظهر بياناته هنا.'}
     action={!q?<ActionLink to="/documents/new">إنشاء مستند</ActionLink>:undefined}/>}
  </Panel>
 </>;
}
