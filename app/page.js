import SiteNav from "../components/SiteNav";
import Checker from "../components/Checker";
export default function Home(){
 return <>
  <SiteNav/>
  <main>
   <section className="hero container"><div className="eyebrow">DEALCHECK · SMARTER BUYING</div><h1>Are you <em>overpaying?</em></h1><p className="lead">Check a product before you buy. DEALCHECK analyzes price, value, risks, alternatives and fresh market offers — so you know what a fair deal looks like.</p><Checker/></section>
   <section className="section container" id="how"><div className="eyebrow">How it works</div><h2 className="sectionTitle">A second opinion before you spend.</h2><p className="sectionLead">One free analysis gives you the core verdict. Create an account afterwards to keep your analyses, save products and unlock deeper comparisons.</p><div className="grid3">
    <div className="feature"><div className="featureIcon">⌕</div><h3>1. Identify</h3><p>Paste a product link, upload a screenshot or enter the product manually.</p></div>
    <div className="feature"><div className="featureIcon">◈</div><h3>2. Research</h3><p>AI checks market context, comparable offers, value, risks and alternative products.</p></div>
    <div className="feature"><div className="featureIcon">✓</div><h3>3. Decide</h3><p>See a clear verdict, fair-price range and where the product appears to be a better buy.</p></div>
   </div></section>
   <section className="section container" id="features"><div className="eyebrow">Built for real buying decisions</div><h2 className="sectionTitle">Everything that matters.</h2><div className="grid3">
    <div className="feature"><h3>Fair price</h3><p>Estimate what the market price should look like instead of judging the sticker price alone.</p></div>
    <div className="feature"><h3>Best places to buy</h3><p>Find current offers from relevant stores and marketplaces, with source links and timestamps.</p></div>
    <div className="feature"><h3>Alternatives</h3><p>Discover products that may offer better value for the same budget.</p></div>
   </div></section>
  </main>
  <footer className="footer"><div className="container">© 2026 DEALCHECK · AI-assisted information, not a guarantee of price or availability.</div></footer>
 </>
}