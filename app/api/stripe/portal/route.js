import Stripe from "stripe";
export const runtime="nodejs";
export async function POST(req){
 try{
  if(!process.env.STRIPE_SECRET_KEY)return Response.json({error:"Stripe is not configured."},{status:500});
  const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);const {customerId}=await req.json();
  if(!customerId)return Response.json({error:"No Stripe customer ID."},{status:400});
  const origin=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin;
  const session=await stripe.billingPortal.sessions.create({customer:customerId,return_url:`${origin}/subscription`});
  return Response.json({url:session.url});
 }catch(e){return Response.json({error:e.message||"Portal failed."},{status:500})}
}