"use client";
import {useState} from "react";
export default function Checker(){
 const [mode,setMode]=useState("link"),[url,setUrl]=useState(""),[name,setName]=useState(""),[price,setPrice]=useState(""),[currency,setCurrency]=useState("EUR"),[country,setCountry]=useState(""),[image,setImage]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const fileChange=e=>{const f=e.target.files?.[0]; if(!f)return; const r=new FileReader();r.onload=()=>setImage(r.result);r.readAsDataURL(f)};
 async function submit(e){
   e.preventDefault();setError("");
   if(!name && !url && !image){setError("Add a product link, screenshot, or product name.");return}
   if(!price){setError("Add the price you are being asked to pay.");return}
   setLoading(true);
   try{
     const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,name,price,currency,country,image})});
     const data=await res.json(); if(!res.ok)throw new Error(data.error||"Analysis failed.");
     localStorage.setItem("dealcheck:last",JSON.stringify(data));
     const old=JSON.parse(localStorage.getItem("dealcheck:history")||"[]"); localStorage.setItem("dealcheck:history",JSON.stringify([data,...old].slice(0,30)));
     window.location.href="/results";
   }catch(err){setError(err.message)}finally{setLoading(false)}
 }
 return <div className="heroCard" id="checker">
  <div className="tabs"><button className={`tab ${mode==="link"?"active":""}`} onClick={()=>setMode("link")}>Product link</button><button className={`tab ${mode==="image"?"active":""}`} onClick={()=>setMode("image")}>Screenshot</button></div>
  <form onSubmit={submit}>
   {mode==="link" ? <div className="field"><label className="label">Product link</label><input className="input" placeholder="https://store.com/product/..." value={url} onChange={e=>setUrl(e.target.value)}/></div>
   : <div className="field"><label className="label">Product screenshot</label><input className="input" type="file" accept="image/*" onChange={fileChange}/><div className="helper">We use the screenshot only to identify the product and visible price.</div></div>}
   <div className="field"><label className="label">Product name</label><input className="input" placeholder="e.g. iPhone 17 Pro Max 512GB" value={name} onChange={e=>setName(e.target.value)}/><div className="helper">If the product is not recognized, enter it manually.</div></div>
   <div className="row"><div className="field"><label className="label">Your price</label><input className="input" type="number" min="0" step="0.01" placeholder="1800" value={price} onChange={e=>setPrice(e.target.value)}/></div><div className="field"><label className="label">Currency</label><select className="select" value={currency} onChange={e=>setCurrency(e.target.value)}>{["EUR","USD","GBP","CAD","AUD","INR","PLN","UAH"].map(x=><option key={x}>{x}</option>)}</select></div></div>
   <div className="row"><div className="field"><label className="label">Country</label><input className="input" placeholder="e.g. Germany" value={country} onChange={e=>setCountry(e.target.value)}/></div><div className="field"><label className="label">First check</label><div className="input" style={{background:"#f6f3ed"}}>Free</div></div></div>
   <button className="btn btn-dark" style={{width:"100%",padding:"16px"}} disabled={loading}>{loading?"Researching the market…":"Check this product →"}</button>
   {error&&<div className="error">{error}</div>}
  </form>
  <div className="trust"><span>✓ No card for first check</span><span>✓ Live market research</span><span>✓ English</span></div>
 </div>
}