import { Building2, FileText, LayoutDashboard, PlusCircle, Users, Settings, ShieldCheck, ArrowUpLeft, ChevronLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const items:{to:string,label:string,short:string,Icon:LucideIcon}[]=[
 {to:'/',label:'لوحة التحكم',short:'الرئيسية',Icon:LayoutDashboard},
 {to:'/companies',label:'دليل الشركات',short:'الشركات',Icon:Building2},
 {to:'/documents',label:'أرشيف المستندات',short:'الوثائق',Icon:FileText},
 {to:'/documents/new',label:'إنشاء مستند',short:'إنشاء',Icon:PlusCircle},
 {to:'/traders',label:'حسابات التجار',short:'الحسابات',Icon:Users},
 {to:'/settings',label:'الإعدادات',short:'المزيد',Icon:Settings}
];

export function Navigation(){
 const {pathname}=useLocation();
 const current=pathname.startsWith('/documents/') && pathname!=='/documents/new'
   ? 'عرض مستند الحمولة' : items.find(item=>item.to===pathname)?.label || 'لوحة التحكم';
 return <>
  <a className="skip" href="#main">تجاوز إلى المحتوى</a>
  <aside className="sidebar-nav" aria-label="التنقل الرئيسي">
   <NavLink to="/" className="brand" aria-label="العودة إلى الرئيسية">
    <div className="brand-mark"><ShieldCheck size={26} strokeWidth={1.6}/></div>
    <div><strong>CUSTOMS <span>STUDIO</span></strong><small>إدارة الشحن والوثائق</small></div>
   </NavLink>
   <div className="side-section">القائمة الرئيسية <span>01 — 06</span></div>
   <nav className="side-links">
    {items.map(({to,label,Icon})=><NavLink key={to} to={to} end={to==='/'}
      className={({isActive})=>'side-link'+(isActive?' active':'')}>
      <Icon size={19} strokeWidth={1.7}/><span>{label}</span><ArrowUpLeft className="link-arrow" size={15}/>
    </NavLink>)}
   </nav>
   <div className="side-bottom">
    <span className="online-dot"/> سجلات محلية ضمن جهازك
    <small>منصة إدارية مستقلة · غير حكومية</small>
   </div>
  </aside>
  <header className="mobile-topbar">
   <NavLink to="/" className="brand" aria-label="الرئيسية">
    <div className="brand-mark"><ShieldCheck size={21}/></div>
    <div><strong>CUSTOMS <span>STUDIO</span></strong><small>{current}</small></div>
   </NavLink>
   <div className="mobile-live"><ChevronLeft size={15}/><span>{current}</span></div>
  </header>
  <nav className="mobile-bottom-nav" aria-label="التنقل على الهاتف">
   {items.map(({to,short,Icon})=><NavLink key={to} to={to} end={to==='/'}
    className={({isActive})=>'bottom-link'+(isActive?' active':'')}
    aria-label={items.find(x=>x.to===to)?.label}>
     <Icon size={21} strokeWidth={1.7}/><span>{short}</span>
   </NavLink>)}
  </nav>
 </>;
}
