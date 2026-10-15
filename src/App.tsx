import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Atmosphere } from './components/Effects';
import { useStore } from './lib/store';
import Home from './pages/Home';
import Companies from './pages/Companies';
import Documents from './pages/Documents';
import Editor from './pages/Editor';
import Traders from './pages/Traders';
import Settings from './pages/Settings';
import DocumentView from './pages/DocumentView';

export default function App() {
 const location=useLocation();
 const {message,dismiss}=useStore();
 useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});},[location.pathname]);
 return <>
  <Atmosphere />
  <Navigation />
  {message&&<div className="error-toast" role="alert">{message} <button onClick={dismiss} aria-label="إغلاق">×</button></div>}
  <div className="app-content" id="main">
    <AnimatePresence mode="wait">
     <motion.main key={location.pathname} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
      exit={{opacity:0,y:-8}} transition={{duration:.28,ease:[.22,1,.36,1]}} className="page-shell">
      <Routes location={location}>
       <Route path="/" element={<Home/>}/>
       <Route path="/companies" element={<Companies/>}/>
       <Route path="/documents" element={<Documents/>}/>
       <Route path="/documents/new" element={<Editor/>}/>
       <Route path="/documents/:id" element={<DocumentView/>}/>
       <Route path="/traders" element={<Traders/>}/>
       <Route path="/settings" element={<Settings/>}/>
       <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
     </motion.main>
    </AnimatePresence>
  </div>
 </>;
}
