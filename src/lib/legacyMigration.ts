import type { Database, DocumentRecord, Payment, Trader } from './types';
import { normalize, uid, dateNow } from './format';

/** Old keys are documented in legacy/js/storage.js and legacy JS constants. */
const KEYS = {
  doc:'shipment_doc_final_all_files_v1',
  ledger:'trader_ledger_v1',
  payments:'trader_payments_v1',
  traders:'saved_traders_v1',
  drivers:'saved_drivers_v1',
  draft:'shipment_doc_form_draft_v1',
};
type DataRow = Record<string, unknown>;
const obj=(x:unknown):DataRow=>x && typeof x==='object' && !Array.isArray(x) ? x as DataRow : {};
const str=(x:unknown)=>String(x??'').trim();
const num=(x:unknown)=>Number(str(x).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[٫,]/g,'.'))||0;
function read(key:string):unknown {
  try {const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}catch{return null;}
}
const array=(x:unknown):unknown[]=>Array.isArray(x)?x:[];
const iso=(x:unknown)=>str(x)||dateNow();
function asDocument(raw:DataRow):DocumentRecord {
  return {
    id:uid(),createdAt:str(raw.created_at||raw.createdAt)||new Date().toISOString(),
    doc_id:str(raw.doc_id),date_str:iso(raw.date_str),time_str:str(raw.time_str),
    subject:str(raw.subject)||'سجل حمولة مستورد من النظام السابق',
    company_number:str(raw.company_number),company_name_project:str(raw.company_name_project),
    governorate_name:str(raw.governorate_name),granting_license_approval:str(raw.granting_license_approval),
    license_approval_number:str(raw.license_approval_number),license_approval_date:str(raw.license_approval_date),
    license_text_specialization:str(raw.license_text_specialization),brand:str(raw.brand),
    item_name:str(raw.item_name),production_capacity:str(raw.production_capacity),unit:str(raw.unit),
    cargo_typedetails:str(raw.cargo_typedetails),checkpoint_name_control:str(raw.checkpoint_name_control),
    driver_name:str(raw.driver_name),vehicle_number:str(raw.vehicle_number),
    registration_governorate:str(raw.registration_governorate),weight_quantity:str(raw.weight_quantity),
    destination_governorate:str(raw.destination_governorate),trader_name:str(raw.trader_name),
    document_value_usd:num(raw.document_value_usd),qr_image_data:str(raw.qr_image_data),
    qr_code:str(raw.qr_code),
  };
}
const docKey=(d:DocumentRecord)=>normalize(d.doc_id)+'|'+normalize(d.trader_name);
const payKey=(p:Payment)=>str(p.id)||[normalize(p.trader_name),p.date,p.type,str(p.amount),p.reference].join('|');

/** One-way, explicit import: original localStorage remains unchanged. */
export function readLegacyDatabase():Database {
 const documents:DocumentRecord[]=[];
 const seen=new Set<string>();
 const latest=asDocument(obj(read(KEYS.doc)));
 if(latest.doc_id){
   documents.push(latest);seen.add(docKey(latest));
 }
 for(const entry of array(read(KEYS.ledger))){
   const d=asDocument(obj(entry));
   if(!d.doc_id||!d.trader_name||seen.has(docKey(d)))continue;
   documents.push(d);seen.add(docKey(d));
 }
 const payments:Payment[]=array(read(KEYS.payments)).map(raw=>{
  const x=obj(raw);
  return {
   id:str(x.id)||uid(),trader_name:str(x.trader_name),
   amount:num(x.amount),date:iso(x.payment_date||x.date),
   type:str(x.payment_type)==='settlement'?'settlement' as const:'receipt' as const,
   reference:str(x.reference_no||x.reference),notes:str(x.notes),
   createdAt:str(x.created_at||x.createdAt)||new Date().toISOString(),
  };
 }).filter(p=>p.trader_name&&p.amount>0);
 const candidates=[
   ...array(read(KEYS.traders)).map(raw=>typeof raw==='string'?raw:str(obj(raw).name)),
   ...documents.map(d=>d.trader_name),
   ...payments.map(p=>p.trader_name),
 ];
 const traders:Trader[]=[];
 const names=new Set<string>();
 for(const raw of candidates){
   const name=str(raw); const key=normalize(name);
   if(!key||names.has(key))continue;
   names.add(key);traders.push({id:uid(),name,createdAt:new Date().toISOString()});
 }
 return {version:1,companies:[],documents,traders,payments,updatedAt:new Date().toISOString()};
}
export function hasLegacyData() {
 return Object.values(KEYS).some(key=>{
   try {return !!localStorage.getItem(key);}catch{return false;}
 });
}
export function legacyStats(){
 const data=readLegacyDatabase();
 return {documents:data.documents.length,payments:data.payments.length,traders:data.traders.length,
   drivers:array(read(KEYS.drivers)).length,hasData:hasLegacyData()};
}
export function mergeLegacyDatabase(current:Database, legacy:Database):Database {
 const docs=[...current.documents],seenDoc=new Set(docs.map(docKey));
 for(const d of legacy.documents)if(!seenDoc.has(docKey(d))){docs.push(d);seenDoc.add(docKey(d));}
 const payments=[...current.payments],seenPay=new Set(payments.map(payKey));
 for(const p of legacy.payments)if(!seenPay.has(payKey(p))){payments.push(p);seenPay.add(payKey(p));}
 const traders=[...current.traders],seenTrader=new Set(traders.map(t=>normalize(t.name)));
 for(const t of legacy.traders){
  const k=normalize(t.name);if(!k||seenTrader.has(k))continue;
  traders.push(t);seenTrader.add(k);
 }
 return {...current,documents:docs,payments,traders,updatedAt:new Date().toISOString()};
}
/** Import legacy JSON exported manually (no origin-crossing browser access). */
export function isLegacyExport(x:unknown):x is DataRow {
 const o=obj(x);
 return ['shipment_doc_final_all_files_v1','trader_ledger_v1','saved_traders_v1','trader_payments_v1']
 .some(k=>k in o);
}
export function legacyFromExport(x:DataRow):Database {
 const restore:Record<string,string|null>={};
 const keys=[KEYS.doc,KEYS.ledger,KEYS.payments,KEYS.traders];
 try{
  for(const key of keys){
   restore[key]=localStorage.getItem(key);
   if(key in x)localStorage.setItem(key,JSON.stringify(x[key]));
   else localStorage.removeItem(key);
  }
  return readLegacyDatabase();
 }finally{
  for(const key of keys)try{const original=restore[key];if(original===null)localStorage.removeItem(key);else if(original!==undefined)localStorage.setItem(key,original);}catch{}
 }
}
