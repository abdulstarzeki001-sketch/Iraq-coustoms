import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Company, Database, DocumentRecord, Payment, Trader } from './types';
import { normalize, uid } from './format';

const KEY='customs_studio_database_v1';
const empty=():Database=>({version:1,companies:[],documents:[],traders:[],payments:[],updatedAt:new Date().toISOString()});
export function validDatabase(x: unknown): x is Database {
  if (!x || typeof x !== 'object') return false;
  const a=x as Partial<Database>;
  return Array.isArray(a.companies)&&Array.isArray(a.documents)&&Array.isArray(a.traders)&&Array.isArray(a.payments);
}
function load(): Database {
  try {
    const raw=localStorage.getItem(KEY);
    if(raw) {const parsed=JSON.parse(raw); if(validDatabase(parsed))return {...parsed,version:1};}
  } catch(e) {console.warn('تعذر قراءة البيانات المحلية', e);}
  return empty();
}
interface Store {
 db:Database; message:string; dismiss:()=>void;
 addDocument:(x:DocumentRecord)=>void; addPayment:(x:Payment)=>void;
 addTrader:(name:string)=>boolean; importCompanies:(x:Company[])=>void;
 replaceDatabase:(x:Database)=>void; reset:()=>void;
}
const Context=createContext<Store | null>(null);
export function StoreProvider({children}:{children:ReactNode}){
 const [db,setDb]=useState<Database>(load);
 const [message,setMessage]=useState('');
 useEffect(()=>{
   try {localStorage.setItem(KEY,JSON.stringify(db));}
   catch {setMessage('تعذّر حفظ البيانات: مساحة التخزين ممتلئة. صدّر نسخة احتياطية وقلّل صور QR.');}
 },[db]);
 const patch=(change:Partial<Database>)=>setDb(prev=>({...prev,...change,updatedAt:new Date().toISOString()}));
 const value=useMemo<Store>(()=>({
   db,message,dismiss:()=>setMessage(''),
   addDocument(x){
     setDb(prev=>({...prev,
       documents:[x,...prev.documents],
       traders:prev.traders.some(t=>normalize(t.name)===normalize(x.trader_name))?prev.traders:
       [{id:uid(),name:x.trader_name,createdAt:new Date().toISOString()},...prev.traders],
       updatedAt:new Date().toISOString()}));
   },
   addPayment(x){patch({payments:[x,...db.payments]});},
   addTrader(name){
     const n=name.trim();
     if(!n || db.traders.some(t=>normalize(t.name)===normalize(n)))return false;
     patch({traders:[{id:uid(),name:n,createdAt:new Date().toISOString()},...db.traders]});
     return true;
   },
   importCompanies(companies){patch({companies});},
   replaceDatabase(next){if(validDatabase(next))setDb({...next,version:1,updatedAt:new Date().toISOString()});},
   reset(){setDb(empty());}
 }),[db,message]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useStore() {
 const s=useContext(Context); if(!s)throw new Error('StoreProvider missing'); return s;
}
export function traderTotals(db:Database,name='') {
 const matches=(x:string)=>!name || normalize(x)===normalize(name);
 const docs=db.documents.filter(x=>matches(x.trader_name));
 const pays=db.payments.filter(x=>matches(x.trader_name));
 const debit=docs.reduce((n,x)=>n+(Number(x.document_value_usd)||0),0);
 const credit=pays.reduce((n,x)=>n+(Number(x.amount)||0),0);
 return {debit,credit,balance:debit-credit,count:docs.length+pays.length};
}
