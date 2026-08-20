export default function SiteNav(){
  return <nav className="nav container">
    <a className="brand" href="/">DEAL<span>CHECK</span></a>
    <div className="navlinks"><a href="#how">How it works</a><a href="#features">Features</a><a href="/dashboard">Dashboard</a></div>
    <a className="btn btn-dark" href="#checker">Check a product</a>
  </nav>
}