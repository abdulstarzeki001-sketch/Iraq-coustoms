import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowUpLeft, Inbox, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';

export function PageTitle({eyebrow,title,description,action}:{eyebrow:string,title:string,description?:string,action?:ReactNode}){
 return <div className="page-heading">
  <div><p className="eyebrow"><Sparkles size={13}/>{eyebrow}</p><h1>{title}</h1>{description&&<p className="subheading">{description}</p>}</div>
  {action&&<div className="heading-actions">{action}</div>}
 </div>;
}
export function Panel({children,className='',...rest}:{children:ReactNode,className?:string}&HTMLAttributes<HTMLElement>){
 return <section className={'glass-panel '+className} {...rest}>{children}</section>;
}
export function ActionLink({to,children,secondary=false}:{to:string,children:ReactNode,secondary?:boolean}){
 return <Link to={to} className={secondary?'action-button outline':'action-button primary'}>{children}<ArrowUpLeft size={17}/></Link>;
}
export function ActionButton({children,secondary=false,className='',...rest}:HTMLMotionProps<'button'>&{secondary?:boolean}){
 return <motion.button whileTap={{scale:.975}} transition={{type:'spring',stiffness:400,damping:22}}
  className={'action-button '+(secondary?'outline':'primary')+' '+className} {...rest}>{children}</motion.button>;
}
export function Empty({title,description,action}:{title:string,description:string,action?:ReactNode}){
 return <div className="empty-state"><div className="empty-glyph"><Inbox size={34}/></div>
  <h3>{title}</h3><p>{description}</p>{action&&<div className="empty-action">{action}</div>}</div>;
}
export function Field({label,children,hint}:{label:string,children:ReactNode,hint?:string}){
 return <label className="field"><span className="field-label">{label}</span>{children}{hint&&<small className="hint">{hint}</small>}</label>;
}
export function Stat({label,value,detail,icon}:{label:string,value:ReactNode,detail?:string,icon:ReactNode}){
 return <div className="stat-tile"><div className="stat-icon">{icon}</div><div className="stat-name">{label}</div>
  <strong className="stat-number" dir="auto">{value}</strong><small>{detail||'إجمالي السجلات الحالية'}</small></div>;
}
