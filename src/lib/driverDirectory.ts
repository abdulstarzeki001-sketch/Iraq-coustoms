import { normalize } from './format';
export interface DriverEntry {
  driver_name:string;vehicle_number:string;registration_governorate:string;created_at?:string;
}
const DRIVER_KEY='saved_drivers_v1';
function key(d:DriverEntry){return [d.driver_name,d.vehicle_number,d.registration_governorate].map(normalize).join('|');}
export function getDrivers():DriverEntry[] {
 let current:DriverEntry[]=[];
 try{
   const val=JSON.parse(localStorage.getItem(DRIVER_KEY)||'[]');
   if(Array.isArray(val))current=val.filter(x=>x?.driver_name&&x?.vehicle_number)
    .map(x=>({driver_name:String(x.driver_name),vehicle_number:String(x.vehicle_number),
      registration_governorate:String(x.registration_governorate||''),created_at:String(x.created_at||'')}));
 }catch{}
 const found=new Set<string>();
 return current.filter(d=>{
   const k=key(d);if(found.has(k))return false;found.add(k);return true;
 });
}
export function searchDrivers(query:string,limit=12) {
 const q=normalize(query);
 return getDrivers().filter(d=>!q||[d.driver_name,d.vehicle_number,d.registration_governorate]
   .some(v=>normalize(v).includes(q))).slice(0,limit);
}
export function saveDriver(driver:DriverEntry){
 if(!driver.driver_name.trim()||!driver.vehicle_number.trim())return;
 try{
  const target={...driver,created_at:new Date().toISOString()};
  const without=getDrivers().filter(d=>key(d)!==key(target));
  localStorage.setItem(DRIVER_KEY,JSON.stringify([target,...without].slice(0,200)));
 }catch{ /* Browser storage limits: primary document still saves through Store. */ }
}
