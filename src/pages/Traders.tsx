import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight, Download, FileText, Plus, Printer, Users, Wallet } from 'lucide-react';
import { useStore, traderTotals } from '../lib/store';
import { dateNow, downloadText, money, normalize, toCsv, uid } from '../lib/format';
import { ActionButton, Field, PageTitle, Panel } from '../components/UI';

export default function Traders(){
 const {db,addTrader,addPayment}=useStore();
 const [name,setName]=useState('');
 const [filter,setFilter]=useState('');
 const [payment,setPayment]=useState({trader_name:'',amount:'',date:dateNow(),type:'receipt' as 'receipt'|'settlement',reference:'',notes:''});
 const [error,setError]=useState('');
 const totals=traderTotals(db,filter);
 const ledger=useMemo(()=>{
  const docs=db.documents.filter(d=>!filter||normalize(d.trader_name)===normalize(filter)).map(d=>({
   id:d.id,date:d.date_str,sort:d.date_str+'T'+d.time_str,kind:'مستند',ref:d.doc_id,trader:d.trader_name,
   driver:d.driver_name,company:d.company_name_project,destination:d.destination_governorate,
   debit:Number(d.document_value_usd)||0,credit:0
  }));
  const payments=db.payments.filter(p=>!filter||normalize(p.trader_name)===normalize(filter)).map(p=>({
   id:p.id,date:p.date,sort:p.date+'T'+(p.createdAt.slice(11,19)||'00:00'),
   kind:p.type==='receipt'?'قبض':'تسوية',ref:p.reference||'—',trader:p.trader_name,
   driver:'—',company:'—',destination:'—',debit:0,credit:Number(p.amount)||0
  }));
  let balance=0;
  return [...docs,...payments].sort((a,b)=>a.sort.localeCompare(b.sort)).map(x=>({...x,balance:(balance+=x.debit-x.credit)}));
 },[db.documents,db.payments,filter]);
 function addAccount(e:FormEvent){
  e.preventDefault();
  if(!addTrader(name)){setError('أدخل اسماً جديداً غير مكرر.');return;}
  setName('');setError('');
 }
 function savePayment(e:FormEvent){
  e.preventDefault();
  if(!payment.trader_name||!Number.isFinite(Number(payment.amount))||Number(payment.amount)<=0){
   setError('اختر التاجر وأدخل مبلغاً أكبر من صفر.');return;
  }
  addPayment({id:uid(),trader_name:payment.trader_name,amount:Number(payment.amount),date:payment.date,
   type:payment.type,reference:payment.reference,notes:payment.notes,createdAt:new Date().toISOString()});
  setPayment({...payment,amount:'',reference:'',notes:''});setError('');
 }
 const exportCsv=()=>downloadText('traders-ledger.csv',toCsv([
  ['التاريخ','الحركة','المرجع','التاجر','السائق','الشركة','الوجهة','مدين USD','دائن USD','الرصيد USD'],
  ...ledger.map(x=>[x.date,x.kind,x.ref,x.trader,x.driver,x.company,x.destination,x.debit,x.credit,x.balance])
 ]),'text/csv;charset=utf-8');
 return <>
  <PageTitle eyebrow="FINANCIAL OPERATIONS / التجار" title="التجار وكشوف الحساب"
   description="المستحقات الناتجة عن مستندات الحمولة، والقبوضات والتسويات المرتبطة بكل تاجر."/>
  <div className="trader-stats">
   <div className="finance-stat"><div><FileText size={21}/> إجمالي المستحقات</div><strong>{money(totals.debit)}</strong></div>
   <div className="finance-stat"><div><ArrowDownLeft size={21}/> إجمالي القبوضات</div><strong>{money(totals.credit)}</strong></div>
   <div className="finance-stat selected"><div><Wallet size={21}/> الرصيد المتبقي</div><strong>{money(totals.balance)}</strong></div>
  </div>
  <div className="traders-layout">
   <aside className="trader-forms">
    <Panel className="editor-panel"><h2 className="form-section-heading"><Users size={20}/> إضافة تاجر</h2>
     <form onSubmit={addAccount}><Field label="اسم حساب التاجر"><input value={name} onChange={e=>setName(e.target.value)} placeholder="اسم التاجر" required/></Field>
      <ActionButton type="submit" className="full"><Plus size={17}/> إضافة التاجر</ActionButton></form>
    </Panel>
    <Panel className="editor-panel"><h2 className="form-section-heading"><ArrowUpRight size={20}/> تسجيل قبض أو تسوية</h2>
     <form onSubmit={savePayment}>
      <Field label="التاجر"><select value={payment.trader_name} required onChange={e=>setPayment({...payment,trader_name:e.target.value})}>
       <option value="">اختر التاجر</option>{db.traders.map(x=><option key={x.id} value={x.name}>{x.name}</option>)}</select></Field>
      <Field label="نوع الحركة"><select value={payment.type} onChange={e=>setPayment({...payment,type:e.target.value as 'receipt'|'settlement'})}>
       <option value="receipt">قبض من التاجر</option><option value="settlement">تسديد / تسوية</option></select></Field>
      <Field label="المبلغ USD"><input type="number" inputMode="decimal" min=".01" step=".01" required dir="ltr" value={payment.amount} onChange={e=>setPayment({...payment,amount:e.target.value})}/></Field>
      <Field label="التاريخ"><input type="date" required value={payment.date} onChange={e=>setPayment({...payment,date:e.target.value})}/></Field>
      <Field label="رقم الوصل أو المرجع"><input value={payment.reference} onChange={e=>setPayment({...payment,reference:e.target.value})}/></Field>
      <Field label="ملاحظات"><textarea rows={2} value={payment.notes} onChange={e=>setPayment({...payment,notes:e.target.value})}/></Field>
      {error&&<p role="alert" className="form-error">{error}</p>}
      <ActionButton type="submit" className="full">حفظ الحركة <Plus size={17}/></ActionButton>
     </form>
    </Panel>
   </aside>
   <Panel className="ledger-panel"><div className="ledger-toolbar"><div><h3>كشف الحركات</h3><span>{ledger.length} قيد</span></div>
    <div className="ledger-toolbar-actions">
     <select aria-label="تصفية التاجر" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">كل التجار</option>
     {db.traders.map(x=><option key={x.id}>{x.name}</option>)}</select>
     <button type="button" className="inline-button" onClick={exportCsv} disabled={!ledger.length}><Download size={16}/> CSV</button>
     <button type="button" className="inline-button" onClick={()=>window.print()} disabled={!ledger.length}><Printer size={16}/> PDF</button>
    </div></div>
    <div className="print-ledger-head"><h2>كشف حساب التجار</h2><p>{filter||'كل التجار'} — تاريخ الطباعة: {dateNow()}</p></div>
    {ledger.length?<div className="data-table-wrap"><table className="data-table ledger-table">
     <thead><tr><th>#</th><th>التاريخ</th><th>نوع القيد</th><th>المرجع</th><th>التاجر</th><th>السائق / الشركة</th><th>مدين $</th><th>دائن $</th><th>الرصيد $</th></tr></thead>
     <tbody>{ledger.map((x,i)=><tr key={x.id}>
      <td>{i+1}</td><td dir="ltr">{x.date}</td><td><span className={'movement '+(x.credit?'credit':'debit')}>{x.kind}</span></td>
      <td>{x.ref}</td><td>{x.trader}</td><td>{x.driver}<small className="table-secondary">{x.company}</small></td>
      <td className="debit-text">{x.debit?money(x.debit):'—'}</td><td className="credit-text">{x.credit?money(x.credit):'—'}</td>
      <td><strong dir="ltr">{money(x.balance)}</strong></td></tr>)}</tbody>
     </table></div>:<p className="panel-empty">لا توجد قيود مالية مطابقة بعد.</p>}
    <div className="ledger-total"><span>الرصيد النهائي</span><strong dir="ltr">{money(totals.balance)}</strong></div>
   </Panel>
  </div>
 </>;
}
