import Stripe from "stripe";
export const runtime="nodejs";
export async function POST(req){
 try{
  if(!process.env.STRIPE_SECRET_KEY||!process.env.STRIPE_PRICE_ID) return Response.json({error:"Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Vercel."},{status:500});
  const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
  const {email}=await req.json();
  const origin=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin;
  const session=await stripe.checkout.sessions.create({
   mode:"subscription",line_items:[{price:process.env.STRIPE_PRICE_ID,quantity:1}],
   customer_email:email||undefined,success_url:`${origin}/subscription?success=1`,cancel_url:`${origin}/subscription?cancelled=1`,
   allow_promotion_codes:true
  });
  return Response.json({url:session.url});
 }catch(e){console.error(e);return Response.json({error:e.message||"Stripe checkout failed."},{status:500})}
}