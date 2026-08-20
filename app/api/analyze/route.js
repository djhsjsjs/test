import OpenAI from "openai";
import {buildPrompt} from "../../../lib/analysisPrompt";

export const runtime="nodejs";

function cleanJson(text){
  const t=text.trim().replace(/^```json/i,"").replace(/^```/,"").replace(/```$/,"").trim();
  const first=t.indexOf("{"), last=t.lastIndexOf("}");
  if(first<0||last<first)throw new Error("AI returned an invalid result.");
  return JSON.parse(t.slice(first,last+1));
}

export async function POST(req){
 try{
  const body=await req.json();
  if(!process.env.OPENAI_API_KEY) return Response.json({error:"OPENAI_API_KEY is missing in Vercel."},{status:500});
  const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const model=process.env.OPENAI_MODEL||"gpt-5.6";
  const prompt=buildPrompt(body);
  const content=[{type:"input_text",text:prompt}];
  if(body.image?.startsWith("data:image/")) content.push({type:"input_image",image_url:body.image});
  const response=await client.responses.create({
    model,
    tools:[{type:"web_search"}],
    input:[{role:"user",content}]
  });
  const parsed=cleanJson(response.output_text||"");
  parsed.input={price:String(body.price),currency:body.currency};
  parsed.createdAt=new Date().toISOString();
  return Response.json(parsed);
 }catch(e){
  console.error(e);
  const status=e?.status===429?429:500;
  return Response.json({error:status===429?"OpenAI quota/rate limit reached. Check your API billing and limits.":(e.message||"Analysis failed.")},{status});
 }
}