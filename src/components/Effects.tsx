import type { ReactNode } from 'react';

/**
 * Decorative backdrop never moves the document or listens to scroll.
 * Safari's changing browser viewport and repeated scroll measurements cause
 * visible jumps when its address bar changes height.
 */
export function Atmosphere() {
 return <div className="atmosphere" aria-hidden="true">
  <div className="aurora aurora-one"/><div className="aurora aurora-two"/>
  <div className="ambient-grid"/><div className="grain"/>
 </div>;
}

/** Reveal content immediately and without translate/opacity scroll animation. */
export function Reveal({children,className=''}:{children:ReactNode,className?:string}){
 return <div className={className}>{children}</div>;
}
