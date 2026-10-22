import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Building2, Search, ArrowUpLeft, Upload, Layers, FilePlus2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { companyFrom, findCompanies } from '../lib/format';
import type { Company } from '../lib/types';
import { ActionLink, Empty, PageTitle, Panel } from '../components/UI';

export default function Companies(){
 const {db,importCompanies}=useStore();
 const [query,setQuery]=useState('');
 const [selected,setSelected]=useState<Company|null>(null);
 const [error,setError]=useState('');
 const input=useRef<HTMLInputElement>(null);
 const navigate=useNavigate();
 const results=query?findCompanies(db.companies,query,100):db.companies.slice(0,36);
 async function loadFile(e:ChangeEvent<HTMLInputElement>){
  const f=e.target.files?.[0]; if(!f)return;
  try {
   const parsed=JSON.parse(await f.text());
   const rows=Array.isArray(parsed)?parsed:Array.isArray(parsed?.companies)?parsed.companies:null;
   if(!rows)throw new Error('اختر JSON يحتوي على قائمة الشركات');
   const imported=rows.map((x:Record<string,unknown>)=>companyFrom(x)).filter((c:Company)=>c.CompanyNameProject);
   if(!imported.length)throw new Error('لم يُعثر على أسماء شركات صالحة');
   importCompanies(imported);setSelected(null);setError('');
  } catch(err){setError(err instanceof Error?err.message:'ملف غير صالح');}
  e.target.value='';
 }
 return <>
  <PageTitle eyebrow="COMPANY INTELLIGENCE / الشركات" title="دليل الشركات"
   description="ابحث برقم الشركة أو اسمها أو العلامة التجارية أو رقم الإجازة."
   action={<ActionLink to="/documents/new">إضافة مستند</ActionLink>}/>
  <Panel className="search-panel">
   <div className="search-box"><Search size={21}/><input aria-label="البحث في الشركات" value={query} onChange={e=>setQuery(e.target.value)}
    placeholder="بحث عن شركة، رقم، إجازة، أو علامة تجارية..."/></div>
   <div className="search-toolbar"><span><Layers size={16}/> {db.companies.length.toLocaleString('en-US')} شركة في الدليل</span>
    <button className="inline-button" onClick={()=>input.current?.click()}><Upload size={16}/> استيراد شركات JSON</button>
    <input ref={input} hidden type="file" accept=".json,application/json" onChange={loadFile}/></div>
   {error&&<p className="form-error" role="alert">{error}</p>}
  </Panel>
  {!db.companies.length?<Empty title="دليل الشركات فارغ" description="لم تُرفق قاعدة بيانات الشركات الأصلية. ارفع ملف companies.json ليظهر الدليل ويمكن البحث فيه." action={<button onClick={()=>input.current?.click()} className="action-button primary">استيراد قاعدة الشركات <Upload size={17}/></button>}/>:
  <div className="companies-layout">
   <Panel className="company-list">
    <div className="panel-heading"><h3><Building2 size={18}/> الشركات {query&&'· نتائج البحث'}</h3><span className="muted">{results.length} نتيجة</span></div>
    {results.length?results.map((c,i)=><button key={c.Number+'-'+i} className={'company-row'+(selected===c?' selected':'')} onClick={()=>setSelected(c)}>
     <div className="company-avatar"><Building2 size={21}/></div><div><strong>{c.CompanyNameProject}</strong>
     <small>{c.Number&&'رقم '+c.Number} {c.Brand&&'· '+c.Brand}</small></div><ArrowUpLeft size={18}/></button>):
     <p className="panel-empty">لا توجد شركات مطابقة.</p>}
   </Panel>
   <Panel className="company-detail">
    {selected?<><div className="panel-heading"><h3>تفاصيل الشركة</h3></div>
      <div className="detail-icon"><Building2 size={28}/></div>
      <h2>{selected.CompanyNameProject}</h2>
      <div className="detail-lines">
       {([['رقم الشركة',selected.Number],['العلامة التجارية',selected.Brand],['رقم الإجازة',selected.LicenseApprovalNumber],
        ['المحافظة',selected.GovernorateName],['الجهة المانحة',selected.GrantingLicenseApproval],
        ['تاريخ الإجازة',selected.LicenseApprovalDate],['الاختصاص',selected.LicenseTextSpecialization],
        ['الإنتاج',selected.TypeIndustryProduction]] as [string,string|undefined][]).map(([k,v])=><div key={k}><span>{k}</span><strong>{v||'—'}</strong></div>)}
      </div><button className="action-button outline full" style={{marginBottom:10}} onClick={()=>navigate('/companies/'+encodeURIComponent(selected.Number||selected.CompanyNameProject))}>
       فتح بوابة تفاصيل الشركة <Building2 size={18}/></button>
      <button className="action-button primary full" onClick={()=>navigate('/documents/new',{state:{company:selected}})}>
       إنشاء مستند لهذه الشركة <FilePlus2 size={18}/></button>
     </>:<Empty title="اختر شركة" description="اضغط على أي شركة من القائمة لعرض تفاصيلها وإنشاء مستند لها."/>}
   </Panel>
  </div>}
 </>;
}
