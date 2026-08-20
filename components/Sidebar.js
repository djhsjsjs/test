export default function Sidebar({active=""}){
 const items=[["dashboard","Overview","⌂"],["/","New analysis","＋"],["dashboard?tab=history","My analyses","◷"],["dashboard?tab=saved","Saved products","♡"],["dashboard?tab=buy","Best places to buy","⌁"],["profile","Profile","○"],["subscription","Subscription","◆"]];
 return <aside className="side">
  <a className="sideBrand" href="/dashboard">DEAL<span>CHECK</span></a>
  <nav className="sideNav">{items.map(([href,label,icon])=><a key={label} className={active===label?"active":""} href={href.startsWith("/")?href:"/"+href}><span style={{marginRight:10}}>{icon}</span>{label}</a>)}</nav>
  <div className="sideBottom">Know before you buy.<br/>AI-assisted market research.</div>
 </aside>
}