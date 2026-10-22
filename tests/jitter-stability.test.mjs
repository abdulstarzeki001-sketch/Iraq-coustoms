import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=(path)=>readFileSync(path,'utf8');

test('page routing does not animate or translate the whole content area',()=>{
  const app=read('src/App.tsx');
  assert.doesNotMatch(app,/AnimatePresence|motion\.main|y:\s*-?\d+/);
  assert.match(app,/<main className="page-shell">/);
  assert.match(app,/window\.scrollTo\(0,0\)/);
});

test('homepage sections never track scroll position or shift during scroll',()=>{
  const effects=read('src/components/Effects.tsx');
  const home=read('src/pages/Home.tsx');
  assert.doesNotMatch(effects,/ScrollTrigger|gsap\.fromTo|translateY|IntersectionObserver/);
  assert.match(effects,/return <div className=\{className\}>\{children\}<\/div>/);
  assert.doesNotMatch(home,/frameloop|Hologram|Suspense|show3d/);
});

test('touch and reduced motion modes never repaint blurred moving fixed layers',()=>{
  const css=read('src/styles.css');
  assert.match(css,/@media \(pointer: coarse\), \(max-width: 1023px\)/);
  assert.match(css,/\.aurora \{ display: none !important; animation: none !important; filter: none !important;/);
  assert.match(css,/backdrop-filter: none !important/);
  assert.match(css,/html\{scroll-behavior:auto\}/);
  assert.doesNotMatch(css,/animation:drift/);
});

test('A4 vector printing remains available after stabilization',()=>{
  const print=read('src/print-document.css');
  const view=read('src/pages/DocumentView.tsx');
  assert.match(print,/@page\{size:A4/);
  assert.match(print,/\.print-sheet\{position:static!important/);
  assert.match(view,/<QRCodeSVG/);
  assert.match(view,/window\.print\(\)/);
  assert.doesNotMatch(view,/html2canvas|toDataURL/);
});
