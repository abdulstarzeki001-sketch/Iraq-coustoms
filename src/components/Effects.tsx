import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export function Atmosphere() {
 return <div className="atmosphere" aria-hidden="true">
  <div className="aurora aurora-one"/><div className="aurora aurora-two"/>
  <div className="ambient-grid"/><div className="grain"/>
 </div>;
}
export function Reveal({children,className=''}:{children:ReactNode,className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=ref.current;
  if(!el||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const ctx=gsap.context(()=>{
    gsap.fromTo(el,{opacity:0,y:24},{opacity:1,y:0,duration:.7,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 92%',once:true}});
  },el);
  return ()=>ctx.revert();
 },[]);
 return <div ref={ref} className={className}>{children}</div>;
}
