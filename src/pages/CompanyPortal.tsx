import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Building2, CalendarDays, ClipboardList, Factory, FilePlus2, FileText, Info, Layers, MapPin, Package, Search, Truck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useStore } from '../lib/store';
import { normalize } from '../lib/format';

type Line = [string,string|undefined];
function InfoCard({icon,title,rows,children}:{icon:ReactNode,title:string,rows?:Line[],children?:ReactNode}){
 return <section className="portal-card">
  <div className="portal-card-heading"><span className="portal-card-icon">{icon}</span><h3>{title}</h3></div>
  {rows&&<dl className="portal-details">
   {rows.map(([key,value])=><div key={key}><dt>{key}</dt><dd dir="auto">{value?.trim()||'غير متوفر'}</dd></div>)}
  </dl>}
  {children}
 </section>;
}
export default function CompanyPortal(){
 const {number}=useParams();
 const {db}=useStore();
 const navigate=useNavigate();
 const [quantity,setQuantity]=useState('');
 const [query,setQuery]=useState('');
 const selectedNumber=number||'';
 const company=db.companies.find(c=>String(c.Number)===selectedNumber);
 const records=useMemo(()=>db.documents.filter(d=>company&&(
  (d.company_number && String(d.company_number)===String(company.Number)) ||
  normalize(d.company_name_project)===normalize(company.CompanyNameProject)
 )).slice(0,7),[db.documents,company]);

 if(!company)return <div className="portal-not-found">
  <Building2 size={42}/><h1>الشركة غير موجودة في الدليل</h1>
  <p>قد تكون قاعدة الشركات تغيرت، أو لم يتم استيراد بياناتها على هذا الجهاز.</p>
  <Link className="action-button primary" to="/companies"><ArrowRight size={18}/> العودة لدليل الشركات</Link>
 </div>;

 const itemName=company.CargoDetails?.trim()||company.TypeIndustryProduction?.trim()||'غير متوفر';
 const openEditor=()=>navigate('/documents/new',{state:{
  company,quantity:quantity.trim()
 }});
 return <div className="company-portal">
  <div className="portal-breadcrumb"><Link to="/companies"><ArrowRight size={16}/> دليل الشركات</Link>
   <span>/</span><span>ملف الشركة</span></div>
  <div className="portal-topbar">
   <div className="portal-heading-main">
    <span className="portal-emblem"><Building2 size={27}/></span>
    <div><span className="portal-overline">COMPANY PROFILE · بوابة تفاصيل الشركة</span>
     <h1>{company.CompanyNameProject}</h1>
     <p>بيانات مرجعية محفوظة في دليل الشركات داخل هذا التطبيق، وليست تحققاً مباشراً من جهة حكومية.</p>
    </div>
   </div>
   <div className="portal-header-actions">
    <button type="button" className="action-button primary" onClick={openEditor}><FilePlus2 size={18}/> إعداد مستند للشركة</button>
    <Link to="/documents" className="action-button outline"><FileText size={18}/> أرشيف المستندات</Link>
   </div>
  </div>
  <div className="portal-overview" aria-label="ملخص ملف الشركة">
   <div><span>رقم الشركة في الدليل</span><strong dir="auto">{company.Number||'—'}</strong></div>
   <div><span>رقم الإجازة</span><strong dir="auto">{company.LicenseApprovalNumber||'—'}</strong></div>
   <div><span>المحافظة</span><strong>{company.GovernorateName||'—'}</strong></div>
   <div><span>مستندات محفوظة</span><strong>{records.length}</strong></div>
  </div>
  <div className="portal-grid">
   <InfoCard icon={<Building2 size={20}/>} title="معلومات الشركة" rows={[
    ['اسم الشركة / المشروع',company.CompanyNameProject],['العلامة التجارية',company.Brand],
    ['رقم الشركة',company.Number]
   ]}/>
   <InfoCard icon={<MapPin size={20}/>} title="معلومات التواصل والموقع" rows={[
    ['المحافظة',company.GovernorateName],['رقم الهاتف',''],['عنوان الموقع التفصيلي','']
   ]}>
    <p className="portal-context"><Info size={15}/> لم تُدرج بيانات الهاتف أو عنوان الموقع التفصيلي في دليل الشركات المستورد.</p>
   </InfoCard>
   <InfoCard icon={<CalendarDays size={20}/>} title="معلومات الإجازة" rows={[
    ['رقم الإجازة / الموافقة',company.LicenseApprovalNumber],
    ['تاريخ منح الإجازة',company.LicenseApprovalDate]
   ]}/>
   <InfoCard icon={<ClipboardList size={20}/>} title="جهة منح الإجازة" rows={[
    ['الجهة المانحة',company.GrantingLicenseApproval],
    ['منطوق الإجازة / الاختصاص',company.LicenseTextSpecialization]
   ]}/>
   <InfoCard icon={<Factory size={20}/>} title="نوع الصناعة" rows={[
    ['نوع الصناعة / الإنتاج',company.TypeIndustryProduction],
    ['تفاصيل المواد',company.CargoDetails]
   ]}/>
   <InfoCard icon={<FileText size={20}/>} title="الوثائق الداخلية السابقة">
    {records.length?<div className="portal-document-list">{records.map(d=><Link key={d.id} to={'/documents/'+d.id}>
     <FileText size={17}/><span><strong>مستند رقم {d.doc_id}</strong><small>{d.date_str} · {d.driver_name||'بدون سائق'}</small></span>
     <ArrowRight size={16}/>
    </Link>)}</div>:<div className="portal-empty-records">لا توجد مستندات محفوظة مرتبطة بهذه الشركة حتى الآن.</div>}
   </InfoCard>
  </div>
  <section className="portal-products">
   <div className="portal-products-header">
    <div><span className="portal-overline">PRODUCTS & CAPACITY</span>
     <h2><Layers size={23}/> عناصر الشركة</h2>
     <p>المعلومات أدناه من دليل الشركات. الكمية التي تُدخلها هنا لا تُرسل إلى أي جهة خارجية.</p>
    </div>
    <button type="button" className="action-button primary" onClick={openEditor}><Truck size={18}/> إعداد طلب شحن</button>
   </div>
   <div className="portal-product-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)}
    placeholder="البحث ضمن عناصر الشركة" aria-label="البحث في عناصر الشركة"/></div>
   <div className="portal-table-wrap"><table className="portal-table">
    <thead><tr><th>#</th><th>المنتج</th><th>خط الإنتاج</th><th>الوحدة</th><th>الطاقة الإنتاجية</th><th>الكمية المطلوبة</th><th>المصدر</th></tr></thead>
    <tbody>{normalize(itemName+' '+(company.TypeIndustryProduction||'')).includes(normalize(query))?
     <tr><td>1</td><td className="portal-product-name">{itemName}</td><td>{company.TypeIndustryProduction||'—'}</td>
      <td>{company.Unit||'—'}</td><td>{company.ProductionCapacity||'غير مدونة كحقل مستقل'}</td>
      <td><input type="text" inputMode="decimal" value={quantity} placeholder="أدخل الكمية" aria-label="الكمية المطلوبة"
       onChange={e=>setQuantity(e.target.value.replace(/[^0-9٠-٩۰-۹.,\s]/g,''))}/></td>
      <td><span className="portal-source">بيانات مرجعية</span></td></tr>:
      <tr><td colSpan={7} className="portal-table-empty">لم يُعثر على عنصر يطابق البحث.</td></tr>}
    </tbody>
   </table></div>
   <div className="portal-products-foot"><Package size={17}/><span>هذه واجهة محلية للعرض وإعداد المستندات. لا تُرسل طلبات الشحن إلى منظومة حكومية.</span>
    <button type="button" className="action-button primary" onClick={openEditor}><FilePlus2 size={17}/> متابعة إعداد المستند</button>
   </div>
  </section>
 </div>;
}
