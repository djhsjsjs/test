 "use client";
import {useEffect,useState} from "react";
import DashboardShell from "../../components/DashboardShell";
export default function Profile(){
 const [email,setEmail]=useState(""); useEffect(()=>setEmail(JSON.parse(localStorage.getItem("dealcheck:user")||"{}").email||""),[]);
 function save(e){e.preventDefault();localStorage.setItem("dealcheck:user",JSON.stringify({email}));alert("Saved.");}
 return <DashboardShell active="Profile"><div className="content"><div className="eyebrow">Account</div><h1 style={{fontFamily:"var(--font-serif)",fontSize:58,margin:"8px 0 25px"}}>Profile</h1><div className="card" style={{maxWidth:700}}><h2>Email</h2><p className="muted">This is the email used for your DEALCHECK workspace.</p><form onSubmit={save}><div className="field"><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div><button className="btn btn-dark">Save changes</button></form></div></div></DashboardShell>
}