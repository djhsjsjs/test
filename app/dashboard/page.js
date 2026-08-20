 "use client";
import {useEffect,useState} from "react";
import DashboardShell from "../../components/DashboardShell";
export default function Dashboard(){
 const [history,setHistory]=useState([]),[email,setEmail]=useState("");
 useEffect(()=>{setHistory(JSON.parse(localStorage.getItem("dealcheck:history")||"[]"));setEmail(JSON.parse(localStorage.getItem("dealcheck:user")||"{}").email||"Guest")},[]);
 return <DashboardShell active="Overview"><div className="content"><div className="dashHead"><div><div className="eyebrow">Your workspace</div><h1>Good to see you.</h1><div className="muted">{email}</div></div><a className="btn btn-dark" href="/">＋ New analysis</a></div>
 <div className="stats"><div className="stat"><div className="muted">Analyses</div><div className="num">{history.length}</div></div><div className="stat"><div className="muted">Saved products</div><div className="num">0</div></div><div className="stat"><div className="muted">Subscription</div><div className="num" style={{fontSize:22}}>Free</div></div></div>
 <div className="card" style={{marginTop:18}}><h2>Recent analyses</h2><div className="muted">Your latest product checks appear here.</div><div className="list">{history.length?history.slice(0,8).map((x,i)=><div className="listItem" key={i}><div><b>{x.product?.name||"Product"}</b><div className="muted">{x.input?.price} {x.input?.currency} · {new Date(x.createdAt).toLocaleDateString()}</div></div><span className={`pill ${x.verdict?.tone==="good"?"green":x.verdict?.tone==="bad"?"red":""}`}>{x.verdict?.label||"Reviewed"}</span></div>):<div className="listItem"><div><b>No analyses yet</b><div className="muted">Start with your first free check.</div></div><a className="btn btn-light" href="/">Check a product</a></div>}</div></div>
 </div></DashboardShell>
}