"use strict";
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const Stripe = require("stripe");
const routes = require("./api/routes.js");
const followupRoutes = require("./routes/followup.routes.js");
const feedbackRoutes = require("./routes/feedback.routes.js");
const v3Routes = require("./routes/v3.routes.js");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const stripeSecret = (process.env.STRIPE_SECRET_KEY || "").trim();
const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" }) : null;
app.set("trust proxy", 1);
const ALLOWED_ORIGINS = ["https://czytomasens.pl", "https://www.czytomasens.pl", process.env.CLIENT_URL, process.env.DEV_ORIGIN].filter(Boolean);
app.use(cors({ origin:(origin,cb)=>{ if(!origin || ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV!=="production") return cb(null,true); cb(new Error(`CORS: origin ${origin} not allowed`)); }, credentials:true }));
function unique(error){ return error?.code==="P2002" || /unique constraint/i.test(String(error?.message||"")); }
async function mark(event, token){ try{ await prisma.processedStripeEvent.create({data:{event_id:event.id,event_type:event.type,session_id:token}}); } catch(e){ if(!unique(e)) throw e; } }
async function processPaid(event){
  const checkout=event.data.object; const token=checkout?.metadata?.token||null; const email=checkout?.metadata?.email||checkout?.customer_email||null;
  if(!token){ console.error("[WEBHOOK] Brak tokenu."); return; }
  if(await prisma.processedStripeEvent.findUnique({where:{event_id:event.id}})) return;
  if(checkout?.payment_status && checkout.payment_status!=="paid") return;
  const existing=await prisma.session.findUnique({where:{id:token},select:{id:true,report_status:true}});
  if(!existing) throw new Error(`Nie znaleziono sesji ${token}.`);
  const paymentIntentId=typeof checkout?.payment_intent==="string"?checkout.payment_intent:checkout?.payment_intent?.id||null;
  await prisma.session.update({where:{id:token},data:{payment_status:"PAID",report_status:existing.report_status==="READY"?"READY":"QUEUED",email,stripe_session_id:checkout.id,...(paymentIntentId?{stripe_payment_intent_id:paymentIntentId}:{}),paid_at:new Date()}});
  if(existing.report_status!=="READY"){
    const queue=require("./jobs/queue.js");
    if(typeof queue.enqueueReport!=="function") throw new Error("Brak enqueueReport.");
    await queue.enqueueReport(token);
  }
  await mark(event,token);
}
app.post("/api/webhook",express.raw({type:"application/json"}),async(req,res)=>{
  try{
    if(!stripe||!webhookSecret) return res.status(503).json({ok:false,error:"Brak konfiguracji Stripe webhook."});
    const signature=req.headers["stripe-signature"]; if(!signature) return res.status(400).json({ok:false,error:"Brak stripe-signature."});
    let event; try{ event=stripe.webhooks.constructEvent(req.body,signature,webhookSecret); } catch(e){ return res.status(400).json({ok:false,error:"Nieprawidłowa sygnatura webhooka."}); }
    if(["checkout.session.completed","checkout.session.async_payment_succeeded"].includes(event.type)) await processPaid(event);
    if(event.type==="checkout.session.async_payment_failed"){
      const token=event.data.object?.metadata?.token; if(token) await prisma.session.updateMany({where:{id:token,payment_status:"PENDING"},data:{payment_status:"FAILED",last_error:"Stripe: płatność nie została potwierdzona."}});
    }
    res.json({ok:true});
  }catch(e){ console.error("[WEBHOOK]",e); res.status(500).json({ok:false,error:"Webhook nie został jeszcze poprawnie przetworzony."}); }
});
app.use(express.json({limit:"3mb"}));
app.use(express.urlencoded({extended:true,limit:"3mb"}));
const generalLimiter=rateLimit({windowMs:10*60*1000,max:80,standardHeaders:true,legacyHeaders:false,message:{ok:false,error:"Zbyt wiele zapytań. Poczekaj chwilę."}});
app.use("/api/followup",generalLimiter,followupRoutes);
app.use("/api/feedback",generalLimiter,feedbackRoutes);
app.use("/api/v3",v3Routes);
app.get("/api/health",(req,res)=>res.json({ok:true,service:"CzyToMaSens API",methodology:"6-warstw-v3",model:process.env.OPENAI_MODEL||"gpt-5.6-terra",reportModel:process.env.OPENAI_REPORT_MODEL||"gpt-5.6-sol",aiApi:"responses",price:process.env.PRICE_AMOUNT_GR||process.env.INITIAL_PRICE_AMOUNT_GR||"1999",followupPrice:process.env.FOLLOWUP_PRICE_AMOUNT_GR||"999"}));
app.use("/api",routes);
app.use((err,req,res,next)=>{ console.error(`[API] ${req.method} ${req.originalUrl}`,err); if(err?.name==="ZodError") return res.status(400).json({ok:false,error:"Nieprawidłowe lub niekompletne dane.",details:err.issues}); res.status(err?.status||500).json({ok:false,error:err?.status?err.message:"Nie udało się przetworzyć żądania."}); });
app.use((req,res)=>res.status(404).json({ok:false,error:"Route not found",path:req.originalUrl}));
const PORT=process.env.PORT||8080;
const server=app.listen(PORT,()=>console.log(`CzyToMaSens API 3.0 działa na porcie ${PORT}`));
async function shutdown(signal){ console.log(`[API] ${signal} — zamykanie.`); server.close(async()=>{ await prisma.$disconnect(); process.exit(0); }); setTimeout(()=>process.exit(1),10000).unref(); }
process.on("SIGINT",()=>shutdown("SIGINT")); process.on("SIGTERM",()=>shutdown("SIGTERM"));
