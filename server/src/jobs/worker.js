"use strict";
const { Worker, UnrecoverableError } = require("bullmq");
const Redis = require("ioredis");
const { Resend } = require("resend");
const prisma = require("../db/prisma");
const openaiService = require("../services/openai.service");
const caseReasoning = require("../services/case_reasoning.service.js");
const v3Controller = require("../controllers/v3.controller.js");
const v3Retention = require("../services/v3/retention.service.js");
const { createSignedAccess } = require("../security/report-access.js");
const { historyByRecoveryToken, saveCheckin, updateCaseStateByRecoveryToken, ensureFollowupSchema, dueReminders, markReminderSent, issueRecoveryTokenForProfile, publicUrl } = require("../services/followup.service.js");

if(!process.env.REDIS_URL) throw new Error("Brak REDIS_URL.");
const connection=new Redis(process.env.REDIS_URL,{maxRetriesPerRequest:null});
const resendKey=(process.env.RESEND_API_KEY||"").trim();
const resendFrom=(process.env.RESEND_FROM_EMAIL||"").trim();
const resend=resendKey?new Resend(resendKey):null;
const clientUrl=(process.env.CLIENT_URL||"https://czytomasens.pl").replace(/\/$/,"");
const LOCK_STALE_MS=10*60*1000;
function safeJson(v,f){ if(!v)return f; if(typeof v==="object")return v; try{return JSON.parse(v)}catch{return f} }
function escapeHtml(v){ return String(v||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function reportUrl(token){ const a=createSignedAccess(token); return `${clientUrl}?access_token=${encodeURIComponent(a.token)}&exp=${encodeURIComponent(a.exp)}&sig=${encodeURIComponent(a.sig)}`; }
async function sendReportEmail(token,email){
  if(!email||!resend||!resendFrom) return;
  const url=reportUrl(token), safe=escapeHtml(url);
  await resend.emails.send({from:resendFrom,to:email,subject:"Twój raport CzyToMaSens jest gotowy",html:`<div style="background:#0b0b0b;padding:32px;color:#f5f1ea;font-family:Arial"><div style="max-width:620px;margin:auto;background:#151515;border:1px solid #333;border-radius:22px;padding:32px"><div style="color:#c5a059;letter-spacing:.25em">CZYTOMASENS 3.0</div><h1>Twój raport jest gotowy.</h1><p style="color:#cfc8bd;line-height:1.7">Raport oddziela zdarzenia od interpretacji, pokazuje Mapę Rozbieżności, hipotezę, kontrhipotezę i bezpieczny test rzeczywistości.</p><a href="${safe}" style="display:inline-block;background:#c5a059;color:#111;text-decoration:none;font-weight:700;border-radius:999px;padding:15px 24px">Otwórz raport</a></div></div>`,text:`Twój raport CzyToMaSens jest gotowy: ${url}`});
  await prisma.session.update({where:{id:token},data:{email_status:"SENT",email_sent_at:new Date(),last_error:null}});
}
async function legacyReport(session,payload,patterns){
  if(payload?.reportKind==="followup"&&payload?.recoveryToken){
    const h=await historyByRecoveryToken(payload.recoveryToken); if(!h) throw new Error("Nie znaleziono historii.");
    const pre=await caseReasoning.updateCaseState({previousState:h.caseState,source:"followup_report_preparation",context:{history:caseReasoning.compactHistoryContext(h),latestConversation:payload.followUpHistory||[],elapsedDays:payload.elapsedDays||0,patterns}});
    const report=await openaiService.generateComparativeReport({history:{...caseReasoning.compactHistoryContext(h),caseState:caseReasoning.compactCaseStateForModel(pre)},caseState:caseReasoning.compactCaseStateForModel(pre),latestConversation:payload.followUpHistory||[],elapsedDays:payload.elapsedDays||0,patterns});
    const final=await caseReasoning.updateCaseState({previousState:pre,source:"followup_report_finalization",context:{previousHistory:caseReasoning.compactHistoryContext(h),latestConversation:payload.followUpHistory||[],comparativeReport:report,elapsedDays:payload.elapsedDays||0}});
    await updateCaseStateByRecoveryToken(payload.recoveryToken,final,{source:"followup_report_finalization",createSnapshot:true,trigger:"followup_report",sourceSessionToken:session.id});
    await saveCheckin(payload.recoveryToken,payload.elapsedDays||0,payload.followUpHistory||[],report);
    return {report,payload:{...payload,caseState:final}};
  }
  const pre=await caseReasoning.updateCaseState({previousState:payload?.caseState,source:"initial_report_preparation",context:{payload,patterns}});
  const report=await openaiService.generateFullReport({...payload,patterns,caseState:caseReasoning.compactCaseStateForModel(pre)});
  const final=await caseReasoning.updateCaseState({previousState:pre,source:"initial_report_finalization",context:{payload,patterns,fullReport:report}});
  return {report,payload:{...payload,caseState:final}};
}
const worker=new Worker("reports",async job=>{
  const token=job.data?.token; if(!token) throw new UnrecoverableError("Brak tokenu.");
  const lock=await prisma.session.updateMany({where:{id:token,payment_status:"PAID",OR:[{report_status:"QUEUED"},{report_status:"PROCESSING",worker_locked_at:{lt:new Date(Date.now()-LOCK_STALE_MS)}}]},data:{report_status:"PROCESSING",worker_locked_at:new Date()}});
  if(!lock.count){ const s=await prisma.session.findUnique({where:{id:token}}); if(!s)throw new UnrecoverableError("Brak sesji."); if(s.report_status==="READY"||s.report_status==="FAILED")return; throw new Error("Sesja ma aktywne przetwarzanie."); }
  const session=await prisma.session.findUnique({where:{id:token}}); if(!session)throw new UnrecoverableError("Brak sesji po locku.");
  try{
    const payload=safeJson(session.payload,{}), patterns=safeJson(session.patterns,[]);
    let report,nextPayload=payload;
    if(payload.analysisVersion==="3.0") report=await v3Controller.generateReportForWorker(session);
    else { const legacy=await legacyReport(session,payload,patterns); report=legacy.report; nextPayload=legacy.payload; }
    await prisma.session.update({where:{id:token},data:{payload:nextPayload,full_report:report,report_status:"READY",report_ready_at:new Date(),worker_locked_at:null,last_error:null,email_status:session.email?"PENDING":"NONE"}});
    await sendReportEmail(token,session.email);
  }catch(e){
    const last=job.attemptsMade+1>=(job.opts.attempts||1);
    await prisma.session.update({where:{id:token},data:{report_status:last?"FAILED":"QUEUED",last_error:e.message,retry_count:{increment:1},worker_locked_at:null}});
    throw e;
  }
},{connection,concurrency:1});
worker.on("failed",(job,e)=>console.error(`[Worker] ${job?.id}`,e));
worker.on("completed",job=>console.log(`[Worker] gotowy ${job.id}`));
async function reminders(){ if(!resend||!resendFrom)return; try{ await ensureFollowupSchema(); for(const item of await dueReminders(100)){ try{ const token=await issueRecoveryTokenForProfile(item.profile_id); const url=publicUrl(token); await resend.emails.send({from:resendFrom,to:item.email,subject:"Co naprawdę się zmieniło?",html:`<div style="font-family:Arial;background:#111;color:#eee;padding:30px"><h2>Czy zmiana się utrzymała?</h2><p>Sprawdź zachowanie, a nie tylko nastrój po rozmowie.</p><a href="${escapeHtml(url)}" style="color:#c5a059">Wróć do prywatnej analizy</a></div>`}); await markReminderSent(item.reminder_id,item.profile_id); }catch(e){console.error("[Reminder]",e.message)} } }catch(e){console.error("[Reminder cycle]",e.message)} }
reminders(); const reminderTimer=setInterval(reminders,60*60*1000);
async function retentionCycle(){
  try{
    const result=await v3Retention.cleanupExpiredCases();
    if(result.removed) console.log(`[V3 retention] usunięto ${result.removed} wygasłych historii.`);
  }catch(e){ console.error("[V3 retention]",e.message); }
}
retentionCycle(); const retentionTimer=setInterval(retentionCycle,24*60*60*1000);
async function shutdown(signal){ console.log(`[Worker] ${signal}`); clearInterval(reminderTimer); clearInterval(retentionTimer); await worker.close(); await prisma.$disconnect(); await connection.quit(); process.exit(0); }
process.on("SIGINT",()=>shutdown("SIGINT")); process.on("SIGTERM",()=>shutdown("SIGTERM"));
