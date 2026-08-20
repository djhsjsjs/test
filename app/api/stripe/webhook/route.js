import Stripe from "stripe";
export const runtime="nodejs";
export async function POST(req){
 const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
 const sig=req.headers.get("stripe-signature");
 const raw=await req.text();
 try{
  const event=stripe.webhooks.constructEvent(raw,sig,process.env.STRIPE_WEBHOOK_SECRET);
  switch(event.type){
   case "checkout.session.completed":
   case "invoice.paid":
   case "invoice.payment_failed":
   case "customer.subscription.updated":
   case "customer.subscription.deleted":
    console.log("DEALCHECK Stripe event:",event.type);
    break;
  }
  return Response.json({received:true});
 }catch(e){return new Response(`Webhook Error: ${e.message}`,{status:400})}
}