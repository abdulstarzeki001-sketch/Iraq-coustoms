import { Building2, FileText, LayoutDashboard, PlusCircle, Users, Settings, ShieldCheck, ArrowUpLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items:{to:string,label:string,short:string,Icon:LucideIcon}[]=[
 {to:'/',label:'الرئيسية',short:'الرئيسية',Icon:LayoutDashboard},
 {to:'/companies',label:'دليل الشركات',short:'الشركات',Icon:Building2},
 {to:'/documents',label:'المستندات',short:'المستندات',Icon:FileText},
 {to:'/documents/new',label:'إنشاء مستند',short:'جديد',Icon:PlusCircle},
 {to:'/traders',label:'حسابات التجار',short:'التجار',Icon:Users},
 {to:'/settings',label:'الإعدادات',short:'الإعدادات',Icon:Settings},
];
export function Navigation(){
 return <>
  <a className="skip" href="#main">تجاوز إلى المحتوى</a>
  <aside className="sidebar-nav" aria-label="التنقل الرئيسي">
   <NavLink to="/" className="brand">
    <div className="brand-mark"><ShieldCheck size={25} strokeWidth={1.6}/></div>
    <div><strong>CUSTOMS <span>STUDIO</span></strong><small>منصة إدارة الشحن</small></div>
   </NavLink>
   <div className="side-section">مساحة العمل <span>01 / 06</span></div>
   <nav className="side-links">
    {items.map(({to,label,Icon})=><NavLink key={to} to={to} end={to==='/'}
     className={({isActive})=>'side-link'+(isActive?' active':'')}>
     <Icon size={19} strokeWidth={1.65}/><span>{label}</span><ArrowUpLeft className="link-arrow" size={15}/>
    </NavLink>)}
   </nav>
   <div className="side-bottom"><span className="online-dot"/>البيانات محفوظة على هذا الجهاز
    <small>نظام إداري مستقل · غير حكومي</small></div>
  </aside>
  <header className="mobile-topbar">
   <NavLink to="/" className="brand"><div className="brand-mark"><ShieldCheck size={21}/></div>
    <div><strong>CUSTOMS <span>STUDIO</span></strong><small>إدارة الشحن والمستندات</small></div></NavLink>
   <span className="mobile-live"><span className="online-dot"/> محلي</span>
  </header>
  <nav className="mobile-bottom-nav" aria-label="التنقل الرئيسي">
   {items.map(({to,short,Icon})=><NavLink key={to} to={to} end={to==='/'}
    className={({isActive})=>'bottom-link'+(isActive?' active':'')}>
    <Icon size={21} strokeWidth={1.7}/><span>{short}</span></NavLink>)}
  </nav>
 </>;
}
