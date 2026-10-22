import type { Company } from './types';

export const uid = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto
  ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);

export function normalize(value: unknown) {
  return String(value ?? '').toLowerCase().trim()
    .replace(/[\u064B-\u065F\u0670]/g,'')
    .replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي')
    .replace(/[٠-٩]/g, c => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/\s+/g,' ');
}
export function money(value: number) {
  return new Intl.NumberFormat('en-US', {maximumFractionDigits:2,minimumFractionDigits:2}).format(value || 0) + ' $';
}
export function dateNow() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}
export function timeNow() {
  const d = new Date();
  return [String(d.getHours()).padStart(2,'0'),String(d.getMinutes()).padStart(2,'0')].join(':');
}
export function companyFrom(raw: Record<string, unknown>): Company {
  const get = (k: string) => String(raw[k] ?? '');
  return {
    Number:get('Number') || get('number'),
    CompanyNameProject:get('CompanyNameProject') || get('company_name_project') || get('name'),
    Brand:get('Brand'),LicenseApprovalNumber:get('LicenseApprovalNumber'),
    GovernorateName:get('GovernorateName'),GrantingLicenseApproval:get('GrantingLicenseApproval'),
    LicenseApprovalDate:get('LicenseApprovalDate'),LicenseTextSpecialization:get('LicenseTextSpecialization'),
    CargoDetails:get('CargoDetails'),TypeIndustryProduction:get('TypeIndustryProduction'),Unit:get('Unit'),
    ProductionCapacity:get('ProductionCapacity')
  };
}
export function findCompanies(list: Company[], query: string, limit = 30) {
  const q=normalize(query); if (!q) return [];
  return list.filter(c => [c.Number,c.CompanyNameProject,c.Brand,c.LicenseApprovalNumber,
    c.GovernorateName,c.TypeIndustryProduction].some(v=>normalize(v).includes(q))).slice(0,limit);
}
export function downloadText(name: string, text: string, mime='text/plain;charset=utf-8') {
  const blob=new Blob(['\ufeff',text],{type:mime});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function toCsv(rows: (string | number)[][]) {
  return rows.map(row=>row.map(v=>'"'+String(v ?? '').replace(/"/g,'""')+'"').join(',')).join('\r\n');
}
