import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use((req, res, next) => {
  if (req.originalUrl === "/api/stripe/webhook") return next();
  express.json({ limit: "1mb" })(req, res, next);
});

app.use(
  cors({
    origin: process.env.APP_ORIGIN?.split(",").map((x) => x.trim()) || true,
    credentials: true,
  })
);

const required = ["OPENAI_API_KEY", "STRIPE_SECRET_KEY"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Brak zmiennej środowiskowej: ${key}`);
    process.exit(1);
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PORT = Number(process.env.PORT || 4000);
const APP_URL = process.env.APP_URL || "http://localhost:5173";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const PRICE_AMOUNT_GROSZE = 1500;

function fail(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

function asText(v) {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeAnswers(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      q: asText(item?.q || item?.question || item?.text),
      a: asText(item?.a || item?.answer || item?.label),
    }))
    .filter((x) => x.q && x.a);
}

function normalizeInterview(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      ai: asText(item?.ai || item?.aiPrompt || item?.question),
      user: asText(item?.user || item?.userText || item?.answer),
    }))
    .filter((x) => x.ai || x.user);
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function chatJson({ developer, user, temperature = 0.3, max_tokens = 1200 }) {
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature,
    max_tokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "developer", content: developer },
      { role: "user", content: user },
    ],
  });

  const content = response.choices?.[0]?.message?.content || "";
  const parsed = parseJson(content);

  if (!parsed) {
    throw new Error("Model zwrócił niepoprawny JSON.");
  }

  return parsed;
}

function buildClassifierPrompt() {
  return `
Jesteś silnikiem klasyfikacji relacji dla produktu premium "CzyToMaSens".

Najpierw sklasyfikuj przypadek jako:
- green: relacja raczej stabilna lub problem ograniczony
- yellow: relacja mieszana, chwiejna, niejednoznaczna
- red: relacja wyraźnie destrukcyjna, z wysokim ryzykiem degradacji

Zasady:
- nie zakładaj z góry patologii
- nie wciskaj każdemu czerwonego raportu
- oddzielaj fakty od hipotez
- nie używaj diagnoz psychiatrycznych
- jeśli danych jest mało, obniż confidence
- partner nie ma być automatycznie manipulatorem

Zwróć wyłącznie JSON:
{
  "status": "green|yellow|red",
  "confidence": 0-100,
  "asymmetry_score": 0-100,
  "tension_score": 0-100,
  "degradation_risk_score": 0-100,
  "evidence_summary": "krótkie streszczenie",
  "unknowns": ["lista braków danych"]
}
`.trim();
}

function buildProbePrompt() {
  return `
Jesteś chłodnym systemem analitycznym dla produktu premium "CzyToMaSens".

Masz wygenerować:
1. jedną trafną obserwację
2. jedno pytanie pogłębiające

Zasady:
- ton ma być mocny, ale inteligentny
- bez taniego dramatyzmu
- bez tekstów typu "analizuję twoje kłamstwa"
- uderzaj w niespójność, ślepą plamkę albo brak konkretu
- jeśli status jest green, nie twórz sztucznej katastrofy
- jeśli status jest yellow, rozbrajaj racjonalizację
- jeśli status jest red, możesz być twardy, ale nadal trzymaj się faktów

Zwróć wyłącznie JSON:
{
  "observation": "krótka, mocna obserwacja",
  "question": "jedno pytanie pogłębiające"
}
`.trim();
}

function buildPreviewPrompt() {
  return `
Tworzysz wstępny raport premium dla produktu "CzyToMaSens".

Cel:
- ma być trafny
- ma nie oddawać całego mięsa
- ma budować chęć kupna pełnego raportu
- nie może brzmieć generycznie
- nie może wszystkim dawać tej samej katastroficznej narracji

Dostosuj ton do statusu:
- green: chłodno i precyzyjnie, bez apokalipsy
- yellow: pokaż napięcie i rozjazd
- red: pokaż wyraźne ryzyko i mechanizm

Zwróć wyłącznie JSON:
{
  "headline": "mocny nagłówek",
  "subheadline": "1-2 zdania kontekstu",
  "previewLine": "jedno uderzające zdanie",
  "sections": [
    { "title": "sekcja 1", "text": "treść", "tone": "normal|gold|danger" },
    { "title": "sekcja 2", "text": "treść", "tone": "normal|gold|danger" }
  ]
}
`.trim();
}

function buildFullReportPrompt() {
  return `
Jesteś systemem analitycznym "CzyToMaSens".
Tworzysz pełny raport premium po polsku.

Najpierw respektuj status sprawy:
- green: nie wolno pisać raportu tak, jakby relacja była toksycznym piekłem
- yellow: pokaż napięcie, rozjazd, nierówność, ale bez sztucznego wyroku
- red: raport może być bezlitosny, ale musi być oparty na faktach z danych

Zasady:
- żadnych diagnoz psychiatrycznych
- żadnego coachowego pocieszania
- żadnych fałszywych pewników
- żadnego automatycznego oskarżania partnera o manipulację bez przesłanek
- styl ma być chłodny, premium, analityczny

Długość:
- minimum 1200 słów
- wynik jako czysty Markdown

Obowiązkowa struktura:
# DOKUMENT ANALITYCZNY: KARTA WYNIKÓW

## 1. WERDYKT OPERACYJNY
Jedno ostre zdanie o faktycznym statusie relacji.

## 2. METRYKI
Wygeneruj i zinterpretuj:
- Indeks Asymetrii Zaangażowania
- Poziom Napięcia Relacyjnego
- Wskaźnik Ryzyka Degradacji

## 3. CO WYNIKA Z DANYCH, A CO JEST HIPOTEZĄ
Oddziel fakty od domysłów.

## 4. GŁÓWNE MECHANIZMY PO STRONIE UŻYTKOWNIKA
Nazwij błędy poznawcze, racjonalizacje, ślepe plamki.

## 5. DYNAMIKA DRUGIEJ STRONY
Analizuj zachowanie partnera bez nadużywania słowa manipulacja.

## 6. TRAJEKTORIE 6 MIESIĘCY
A) status quo
B) błędna konfrontacja
C) odzyskanie kontroli

## 7. PROTOKÓŁ OPERACYJNY OD JUTRA
3 twarde zasady.

## 8. 2 GOTOWE SKRYPTY KOMUNIKACYJNE
Konkretne teksty do użycia.

## 9. ZAMKNIĘCIE
Mocne, krótkie zakończenie.
`.trim();
}

async function classifyCase({ path, answers, aiInterview }) {
  const parsed = await chatJson({
    developer: buildClassifierPrompt(),
    user: JSON.stringify({ path, answers, aiInterview }, null, 2),
    temperature: 0.2,
    max_tokens: 900,
  });

  return {
    status: ["green", "yellow", "red"].includes(parsed?.status) ? parsed.status : "yellow",
    confidence: Number.isFinite(parsed?.confidence) ? Math.max(0, Math.min(100, Number(parsed.confidence))) : 55,
    asymmetry_score: Number.isFinite(parsed?.asymmetry_score)
      ? Math.max(0, Math.min(100, Number(parsed.asymmetry_score)))
      : 50,
    tension_score: Number.isFinite(parsed?.tension_score)
      ? Math.max(0, Math.min(100, Number(parsed.tension_score)))
      : 50,
    degradation_risk_score: Number.isFinite(parsed?.degradation_risk_score)
      ? Math.max(0, Math.min(100, Number(parsed.degradation_risk_score)))
      : 50,
    evidence_summary: asText(parsed?.evidence_summary) || "Brak pełnego streszczenia.",
    unknowns: Array.isArray(parsed?.unknowns) ? parsed.unknowns.map(asText).filter(Boolean) : [],
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "CzyToMaSens API", model: OPENAI_MODEL });
});

app.post("/api/ai-probe", async (req, res) => {
  try {
    const path = asText(req.body?.path) || "unknown";
    const answers = normalizeAnswers(req.body?.answers);
    const aiInterview = normalizeInterview(req.body?.aiInterview);

    if (answers.length < 2) {
      return fail(res, 400, "Za mało danych do pytania pogłębiającego.");
    }

    const classification = await classifyCase({ path, answers, aiInterview });

    const probe = await chatJson({
      developer: buildProbePrompt(),
      user: JSON.stringify({ classification, path, answers, aiInterview }, null, 2),
      temperature: 0.35,
      max_tokens: 700,
    });

    return res.json({
      ok: true,
      classification,
      probe: {
        observation:
          asText(probe?.observation) ||
          "W danych widać rozjazd między tym, co deklarujesz, a tym, co realnie opisujesz.",
        question:
          asText(probe?.question) ||
          "Który fakt o tej relacji najwygodniej Ci dziś pominąć?",
      },
    });
  } catch (error) {
    console.error("AI_PROBE_ERROR", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się wygenerować pytania pogłębiającego.",
    });
  }
});

app.post("/api/analyze-preview", async (req, res) => {
  try {
    const path = asText(req.body?.path) || "unknown";
    const answers = normalizeAnswers(req.body?.answers);
    const aiInterview = normalizeInterview(req.body?.aiInterview);

    if (answers.length < 3) {
      return fail(res, 400, "Za mało danych do wygenerowania preview.");
    }

    const classification = await classifyCase({ path, answers, aiInterview });

    const preview = await chatJson({
      developer: buildPreviewPrompt(),
      user: JSON.stringify({ classification, path, answers, aiInterview }, null, 2),
      temperature: 0.4,
      max_tokens: 1200,
    });

    return res.json({
      ok: true,
      classification,
      preview: {
        headline:
          asText(preview?.headline) ||
          "Relacja wymaga chłodnej oceny, nie dalszego zgadywania.",
        subheadline: asText(preview?.subheadline) || classification.evidence_summary,
        previewLine:
          asText(preview?.previewLine) ||
          "W danych widać mechanizm, którego nie przykryje już sama nadzieja.",
        tensionPercent: classification.tension_score,
        driftPercent: classification.asymmetry_score,
        rebuildPercent: Math.max(0, 100 - classification.degradation_risk_score),
        sections: Array.isArray(preview?.sections)
          ? preview.sections.slice(0, 2).map((sec) => ({
              title: asText(sec?.title) || "Sekcja",
              text: asText(sec?.text) || "",
              tone: ["normal", "gold", "danger"].includes(sec?.tone) ? sec.tone : "normal",
            }))
          : [],
      },
    });
  } catch (error) {
    console.error("ANALYZE_PREVIEW_ERROR", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się wygenerować preview raportu.",
    });
  }
});

app.post("/api/checkout", async (req, res) => {
  try {
    const email = asText(req.body?.email);
    const sessionToken = asText(req.body?.sessionToken);
    const noRefundConsent = Boolean(req.body?.noRefundConsent);

    if (!email || !email.includes("@")) {
      return fail(res, 400, "Podaj prawidłowy e-mail.");
    }

    if (!sessionToken) {
      return fail(res, 400, "Brak tokenu sesji.");
    }

    if (!noRefundConsent) {
      return fail(
        res,
        400,
        "Brak wymaganej zgody na natychmiastowe dostarczenie treści cyfrowej."
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: sessionToken,
      billing_address_collection: "auto",
      submit_type: "pay",
      allow_promotion_codes: false,
      consent_collection: {
        terms_of_service: "required",
      },
      metadata: {
        product: "CzyToMaSens Premium Report",
        sessionToken,
        noRefundConsent: "true",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: PRICE_AMOUNT_GROSZE,
            product_data: {
              name: "CzyToMaSens — Pełny raport premium",
              description:
                "Rozbudowany raport analityczny relacji w formacie cyfrowym.",
            },
          },
        },
      ],
      success_url: `${APP_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/?cancelled=true`,
    });

    return res.json({ ok: true, url: session.url });
  } catch (error) {
    console.error("CHECKOUT_ERROR", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się utworzyć sesji płatności.",
    });
  }
});

app.post("/api/generate-report", async (req, res) => {
  try {
    const sessionId = asText(req.body?.sessionId);
    const sessionToken = asText(req.body?.sessionToken);
    const path = asText(req.body?.path) || "unknown";
    const answers = normalizeAnswers(req.body?.answers);
    const aiInterview = normalizeInterview(req.body?.aiInterview);

    if (!sessionId) {
      return fail(res, 400, "Brak session_id ze Stripe.");
    }

    if (!sessionToken) {
      return fail(res, 400, "Brak tokenu sesji.");
    }

    if (answers.length < 3) {
      return fail(res, 400, "Za mało danych do pełnego raportu.");
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return fail(res, 402, "Płatność nie została potwierdzona.");
    }

    if (checkoutSession.client_reference_id !== sessionToken) {
      return fail(
        res,
        403,
        "Token sesji nie zgadza się z opłaconą sesją Stripe."
      );
    }

    const classification = await classifyCase({ path, answers, aiInterview });

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.35,
      max_tokens: 3200,
      messages: [
        { role: "developer", content: buildFullReportPrompt() },
        {
          role: "user",
          content: JSON.stringify(
            { classification, path, answers, aiInterview },
            null,
            2
          ),
        },
      ],
    });

    const report = asText(response.choices?.[0]?.message?.content);

    if (!report) {
      throw new Error("Model zwrócił pusty raport.");
    }

    return res.json({
      ok: true,
      classification,
      report,
    });
  } catch (error) {
    console.error("GENERATE_REPORT_ERROR", error);
    return res.status(500).json({
      ok: false,
      error: "Nie udało się wygenerować pełnego raportu.",
    });
  }
});

app.post("/api/stripe/webhook", (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(200).send("Webhook secret not configured.");
  }

  try {
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(req.body, signature, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("STRIPE_CHECKOUT_COMPLETED", {
        id: session.id,
        client_reference_id: session.client_reference_id,
        payment_status: session.payment_status,
      });
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("STRIPE_WEBHOOK_ERROR", err?.message || err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`CzyToMaSens API działa na porcie ${PORT}`);
});
