import { lazy, Suspense, useEffect, useState } from 'react';
import { Building2, FilePlus2, FileText, TrendingUp, Users, ArrowLeft, ShieldCheck, ScanLine, Workflow, Wallet, Orbit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, traderTotals } from '../lib/store';
import { money } from '../lib/format';
import { ActionLink, PageTitle, Panel, Stat } from '../components/UI';
import { Reveal } from '../components/Effects';

const Hologram=lazy(()=>import('../components/Hologram'));
const shortcuts=[
 {to:'/companies',name:'استكشاف الشركات',desc:'بحث سريع بالاسم ورقم الإجازة',icon:Building2},
 {to:'/documents/new',name:'إنشاء مستند',desc:'نموذج حمولة متكامل',icon:FilePlus2},
 {to:'/traders',name:'كشف حساب تاجر',desc:'المستحقات والقبوضات والرصيد',icon:Wallet},
];
export default function Home(){
 const {db}=useStore();
 const totals=traderTotals(db);
 const [show3d,setShow3d]=useState(false);
 useEffect(()=>{
  const large=window.matchMedia('(min-width: 1024px)');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>setShow3d(large.matches&&!reduced.matches);
  sync();large.addEventListener('change',sync);reduced.addEventListener('change',sync);
  return()=>{large.removeEventListener('change',sync);reduced.removeEventListener('change',sync);};
 },[]);
 return <>
  <div className="dashboard-topline"><span className="eyebrow">لوحة التحكم / 2026</span><span className="topline-muted"><span className="online-dot"/> مساحة عمل محلية</span></div>
  <section className="hero">
   <div className="hero-copy">
    <span className="hero-kicker"><Orbit size={16}/> مستقبل إدارة عمليات الشحن</span>
    <h1>إدارة أكثر <em>وضوحاً.</em><br/>قرارات أكثر <span>دقة.</span></h1>
    <p>من الشركات ومستندات الحمولة إلى السائقين وحسابات التجار؛ كل ما تحتاجه في مساحة واحدة، مصممة للسرعة والدقة.</p>
    <div className="hero-actions"><ActionLink to="/documents/new">إنشاء مستند جديد</ActionLink><ActionLink to="/companies" secondary>دليل الشركات</ActionLink></div>
    <div className="hero-trust"><ShieldCheck size={15}/> نسخة إدارية مستقلة · لا تصدر مستندات حكومية معتمدة</div>
   </div>
   <div className="hero-art"><div className="orb-fallback"/>{show3d&&<Suspense fallback={null}><Hologram/></Suspense>}
    <span className="holo-label one">DATA / FLOW</span><span className="holo-label two">STUDIO / 01</span></div>
   <div className="hero-orbit-line" aria-hidden="true"/>
  </section>
  <Reveal><div className="section-bar"><div><span className="eyebrow">PERFORMANCE OVERVIEW</span><h2>نظرة عامة على النظام</h2></div><span className="section-hint">تُحسب الأرقام من بياناتك المحفوظة</span></div>
  <div className="stats-grid">
   <Stat label="الشركات المسجلة" value={db.companies.length.toLocaleString('en-US')} icon={<Building2 size={21}/>}/>
   <Stat label="مستندات الحمولة" value={db.documents.length.toLocaleString('en-US')} icon={<FileText size={21}/>}/>
   <Stat label="حسابات التجار" value={db.traders.length.toLocaleString('en-US')} icon={<Users size={21}/>}/>
   <Stat label="الرصيد المستحق" value={money(totals.balance)} detail="مستحقات ناقص القبوضات" icon={<TrendingUp size={21}/>}/>
  </div></Reveal>
  <Reveal><div className="section-bar gap-top"><div><span className="eyebrow">WORKSPACE</span><h2>انطلق إلى العمل</h2></div></div>
   <div className="shortcut-grid">{shortcuts.map(({to,name,desc,icon:Icon},i)=><Link className="shortcut-card" to={to} key={to}>
    <div className="shortcut-index">0{i+1} /</div><div className="shortcut-symbol"><Icon size={26} strokeWidth={1.45}/></div>
    <h3>{name}</h3><p>{desc}</p><span className="shortcut-go"><ArrowLeft size={20}/></span>
   </Link>)}</div>
  </Reveal>
  <Reveal><div className="two-col gap-top">
   <Panel><div className="panel-heading"><h3><ScanLine size={18}/> أحدث المستندات</h3><Link to="/documents">عرض الكل <ArrowLeft size={15}/></Link></div>
    {db.documents.length?db.documents.slice(0,4).map(d=><Link className="recent-row" key={d.id} to={'/documents/'+d.id}>
     <div className="recent-icon"><FileText size={18}/></div>
     <div><strong>{d.company_name_project||'شركة غير محددة'}</strong><small>#{d.doc_id} · {d.driver_name||'لا يوجد سائق'}</small></div>
     <span>{d.date_str}</span></Link>):<p className="panel-empty">لا توجد مستندات بعد. أنشئ أول مستند ليظهر هنا.</p>}
   </Panel>
   <Panel className="system-panel"><div className="panel-heading"><h3><Workflow size={18}/> مركز العمليات</h3></div>
    <div className="system-visual"><div className="system-ring"><span>CS</span></div></div>
    <p>بياناتك حالياً مخزّنة داخل المتصفح على هذا الجهاز. استخدم النسخ الاحتياطي لنقلها أو حمايتها من الحذف.</p>
    <Link className="text-link" to="/settings">إدارة النسخ الاحتياطية <ArrowLeft size={16}/></Link>
   </Panel></div></Reveal>
 </>;
}
