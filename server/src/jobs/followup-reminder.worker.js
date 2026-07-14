"use strict";

const {
  dueReminders,
  markReminderSent,
  issueRecoveryTokenForProfile,
  publicUrl,
} = require("../services/followup.service");

async function sendWithResend(to, recoveryUrl) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "CzyToMaSens <onboarding@resend.dev>";
  if (!apiKey) throw new Error("Brak RESEND_API_KEY.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Minęło trochę czasu. Co naprawdę się zmieniło?",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#231f1a;line-height:1.65">
          <div style="font-family:Georgia,serif;font-size:32px;font-weight:800">CzyToMaSens<span style="color:#c5a059">.</span></div>
          <p>Od Twojego pierwszego odczytu minęło kilka dni. To dobry moment, żeby sprawdzić nie sam nastrój, ale zachowanie: czy druga strona zrobiła coś bez nacisku, czy problem wrócił i czy masz dziś więcej jasności.</p>
          <p><a href="${recoveryUrl}" style="display:inline-block;padding:14px 22px;background:#c5a059;color:#111;text-decoration:none;border-radius:999px;font-weight:700">Zrób ponowny odczyt</a></p>
          <p style="font-size:12px;color:#736b62">Link otwiera prywatną analizę bez konta i hasła. Nie przesyłaj go innym osobom.</p>
        </div>`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend ${response.status}: ${body}`);
  }
}

async function runOnce() {
  const due = await dueReminders(100);
  for (const item of due) {
    try {
      const token = await issueRecoveryTokenForProfile(item.id);
      await sendWithResend(item.email, publicUrl(token));
      await markReminderSent(item.id);
      console.log("[FollowUp] reminder sent", item.id);
    } catch (error) {
      console.error("[FollowUp] reminder failed", item.id, error);
    }
  }
}

async function main() {
  console.log("[FollowUp] reminder worker started");
  await runOnce();
  setInterval(runOnce, 60 * 60 * 1000);
}

main().catch((error) => {
  console.error("[FollowUp] worker fatal", error);
  process.exit(1);
});
