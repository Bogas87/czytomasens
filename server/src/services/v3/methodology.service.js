"use strict";
const schemas = require("./schemas");
const { structured } = require("./openai-json");
const safetyService = require("./safety.service");
const classificationRules = require("./classification.rules");

const CAMERA_RULE = `ZASADA KAMERY: faktem jest tylko to, co można zobaczyć, usłyszeć, policzyć lub umieścić na osi czasu. Intencje, motywy i diagnozy drugiej osoby są interpretacją albo niewiadomą. Wypowiedzi mieszane rozdzielaj. Gdy danych brakuje, nie zgaduj. Nie diagnozuj partnera. Nie przyznawaj automatycznie racji użytkownikowi.`;
const TONE = `Język spokojny, precyzyjny, empatyczny i nieoskarżający. Bez psychologicznego żargonu dla efektu, bez moralizowania, bez procentowej szansy relacji, bez udawania terapii.`;
function compact(input) { return JSON.stringify(input, null, 2).slice(0, 60000); }
function clean(value, fallback = "") { return String(value || fallback).trim(); }
function short(value, max = 220) { const text = clean(value); return text.length > max ? `${text.slice(0, max - 1)}…` : text; }

const PATH_MODELS = {
  unease: {
    headline: "Najważniejszym sygnałem nie jest pojedynczy niepokój, lecz to, jak często wracasz do potrzeby sprawdzania, co naprawdę się dzieje.",
    main: "W relacji może utrzymywać się stan niejasności, który wymaga od Ciebie stałego analizowania i odzyskiwania poczucia bezpieczeństwa.",
    counter: "Część napięcia może wynikać z wcześniejszych doświadczeń albo chwilowego kryzysu, a nie ze stałego wzorca obecnej relacji.",
    unknown: "Nie wiadomo jeszcze, czy niepokój rośnie po konkretnych zachowaniach drugiej osoby, czy przede wszystkim wtedy, gdy brakuje jasnej informacji.",
    verify: "Sprawdź, czy po uzyskaniu konkretnej odpowiedzi napięcie rzeczywiście spada i czy zachowanie pozostaje spójne w kolejnych sytuacjach.",
    protocol: "boundary",
  },
  betrayal: {
    headline: "Odbudowa zaufania nie zależy od samych deklaracji, lecz od powtarzalnego działania, którego nie musisz kontrolować.",
    main: "Ciężar odbudowy zaufania może pozostawać głównie po Twojej stronie, podczas gdy realna zmiana zachowania nie jest jeszcze dostatecznie widoczna.",
    counter: "Druga osoba może podejmować realne działania, których obecnie nie potrafisz uznać z powodu utrzymującego się lęku po wcześniejszym zranieniu.",
    unknown: "Nie wiadomo jeszcze, czy zmiana utrzymuje się bez przypominania, sprawdzania i prowadzenia procesu przez Ciebie.",
    verify: "Porównaj deklaracje z trzema konkretnymi działaniami wykonanymi samodzielnie i utrzymanymi w czasie.",
    protocol: "words_actions",
  },
  uncertain: {
    headline: "Największym kosztem może być nie sama odpowiedź, lecz przeciągająca się niejasność, w której każdemu sygnałowi trzeba nadawać znaczenie.",
    main: "Relacja może być utrzymywana w zawieszeniu, a brak decyzji drugiej osoby przenosi koszt interpretowania i czekania na Ciebie.",
    counter: "Niejasność może być przejściowa, jeżeli istnieją konkretne terminy, działania i uzgodnienia, które rzeczywiście prowadzą do decyzji.",
    unknown: "Nie wiadomo, czy druga osoba ma własny plan działania, czy jedynie reaguje na Twoje kolejne próby uzyskania jasności.",
    verify: "Ustal jeden konkretny warunek i termin, po którym ocenisz zachowanie, a nie kolejną obietnicę.",
    protocol: "boundary",
  },
  asymmetry: {
    headline: "Pytanie nie brzmi tylko, kto stara się bardziej, lecz co zostaje z relacji, kiedy przestajesz wykonywać pracę za dwie osoby.",
    main: "W zebranym materiale może występować nierówny rozkład inicjatywy, odpowiedzialności i naprawiania relacji.",
    counter: "Nierównowaga może być czasowa, jeżeli druga osoba jest przeciążona i mimo tego samodzielnie wraca z konkretnym działaniem.",
    unknown: "Nie wiadomo, czy relacja utrzyma kontakt i kierunek bez Twojego ciągłego impulsu.",
    verify: "Sprawdź, czy druga osoba samodzielnie inicjuje, wraca do ustaleń i przejmuje część odpowiedzialności bez przypominania.",
    protocol: "initiative",
  },
  conflict: {
    headline: "Problemem może być nie sam konflikt, lecz brak trwałego domknięcia i powrót do tego samego mechanizmu.",
    main: "Rozmowy mogą obniżać napięcie, ale nie prowadzić do stabilnej zmiany sposobu kończenia konfliktu.",
    counter: "Opis może dotyczyć wyjątkowo trudnego okresu, a poza nim obie strony potrafią wracać do tematu i wdrażać ustalenia.",
    unknown: "Nie wiadomo, co dokładnie dzieje się po kłótni: czy wracacie do tematu, czy jedynie czekacie, aż napięcie opadnie.",
    verify: "Po kolejnym konflikcie sprawdź, czy pojawia się konkretne domknięcie: powrót do tematu, ustalenie i późniejsze zachowanie zgodne z ustaleniem.",
    protocol: "repair",
  },
  stagnation: {
    headline: "Brak awantur nie musi oznaczać spokoju. Może również oznaczać, że relacja przestała uruchamiać wspólny ruch.",
    main: "Relacja może opierać się głównie na historii, obowiązkach i przyzwyczajeniu, przy malejącej bliskości oraz wspólnym kierunku.",
    counter: "Obecny dystans może wynikać z przejściowego przeciążenia, jeśli nadal istnieje samodzielna inicjatywa i realne próby odbudowy bliskości.",
    unknown: "Nie wiadomo, czy obie strony chcą odbudować więź i czy każda z nich wykonuje własny ruch w tym kierunku.",
    verify: "Sprawdź, czy pojawiają się konkretne działania budujące bliskość, a nie jedynie spokojne funkcjonowanie obok siebie.",
    protocol: "words_actions",
  },
  returning: {
    headline: "Tęsknota potwierdza znaczenie relacji, ale nie potwierdza jeszcze, że mechanizm, który ją zakończył, rzeczywiście się zmienił.",
    main: "Powrót może być napędzany ulgą i pamięcią dobrych momentów bardziej niż nowym, utrzymanym zachowaniem obu stron.",
    counter: "Powrót może mieć realne podstawy, jeżeli pojawiły się konkretne zmiany, odpowiedzialność i nowy sposób reagowania w trudnych sytuacjach.",
    unknown: "Nie wiadomo, co dziś jest inne poza samą gotowością do ponownego kontaktu.",
    verify: "Porównaj nie deklaracje, lecz trzy konkretne zachowania: przed rozpadem relacji i po powrocie.",
    protocol: "words_actions",
  },
  triangle: {
    headline: "Trzecia osoba może być przyczyną kryzysu, ale może też odsłaniać problem, który wcześniej pozostawał nienazwany.",
    main: "W relacji może występować brak jasnych granic, lojalności albo decyzji, który przenosi ciężar porządkowania sytuacji na Ciebie.",
    counter: "Część znaczeń może wynikać z porównań, lęku i niepełnych informacji, a nie z potwierdzonego działania drugiej osoby.",
    unknown: "Nie wiadomo, które elementy są obserwowalnymi zdarzeniami, a które interpretacją intencji i znaczenia kontaktu z trzecią osobą.",
    verify: "Oddziel potwierdzone zachowania od domysłów i sprawdź, czy granice są jasno nazwane oraz respektowane w działaniu.",
    protocol: "boundary",
  },
  loop: {
    headline: "Najważniejszym sygnałem może być nie kolejny powrót, lecz to, czy po powrocie zmienia się cokolwiek poza chwilową ulgą.",
    main: "Relacja może działać w cyklu napięcie–rozstanie–ulga–powrót, bez trwałej zmiany warunków, które uruchamiają kolejny kryzys.",
    counter: "Obecny powrót może być inny, jeżeli obie strony wprowadziły konkretne zasady, działania i odpowiedzialność za wcześniejszy mechanizm.",
    unknown: "Nie wiadomo, czy kryteria zmiany zostały ustalone przed powrotem i czy są realizowane bez przesuwania granicy.",
    verify: "Porównaj obecne działania z kryterium ustalonym przed kolejnym kryzysem, a nie z ulgą odczuwaną po powrocie.",
    protocol: "boundary",
  },
};

function pathModel(path) { return PATH_MODELS[path] || PATH_MODELS.unease; }

function fallbackMirror(payload) {
  const high = (payload.answers || []).filter((x) => Number(x.score) >= 2).length;
  return {
    headline: high
      ? "W kilku odpowiedziach wraca podobny koszt, ale jego źródło nie jest jeszcze rozstrzygnięte."
      : "Obraz nie jest jednostronny. Potrzebny jest konkretny przykład.",
    observation: high
      ? "Powtarza się napięcie, brak jasności albo nierówny ciężar. To sygnał do sprawdzenia, nie diagnoza."
      : "Dotychczasowe wybory pokazują zasoby i obszary niepewności.",
    unknown: "Nie wiadomo jeszcze, czy chodzi o stały wzorzec, chwilowy kryzys czy reakcję na jedno zdarzenie.",
    nextFocus: "Dalsze pytania powinny zebrać zachowania, kolejność i kontrsygnał.",
  };
}

async function generateMirror(payload) {
  try {
    return await structured({
      name: "ctms_v3_mirror",
      schema: schemas.mirror,
      model: process.env.OPENAI_PREVIEW_MODEL || process.env.OPENAI_MODEL,
      effort: "low",
      timeoutMs: 12000,
      safetyId: payload.sessionToken,
      system: `Jesteś warstwą metodologiczną CzyToMaSens 3.0. ${CAMERA_RULE} ${TONE} Stwórz tylko jedno lustro pośrednie: obserwacja, niewiadoma i cel kolejnych pytań.`,
      user: compact(payload),
    });
  } catch {
    return fallbackMirror(payload);
  }
}

const FOCUS = ["concrete_event", "mechanism", "counter_signal"];
async function nextInterviewQuestion(payload) {
  const step = Math.max(0, Math.min(2, Number(payload.step || 0)));
  const fallback = [
    "Odtwórz jedną sytuację: kiedy to było, co dokładnie zrobiła lub powiedziała druga osoba, co zrobiłeś/zrobiłaś Ty i co wydarzyło się potem?",
    "W tej sytuacji kto wykonał kolejny ruch, kto przejął odpowiedzialność i jaki koszt poniosłeś/poniosłaś, żeby utrzymać kontakt albo spokój?",
    "Jaki konkretny fakt mógłby podważyć Twoje obecne wyjaśnienie tej sytuacji? Opisz go bez tłumaczenia intencji drugiej osoby.",
  ][step];
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["question", "focus", "observation", "finished"],
    properties: {
      question: { type: "string" },
      focus: { type: "string", enum: FOCUS },
      observation: { type: "string" },
      finished: { type: "boolean" },
    },
  };
  try {
    return await structured({
      name: "ctms_v3_interview",
      schema,
      model: process.env.OPENAI_INTERVIEW_MODEL || process.env.OPENAI_MODEL,
      effort: "low",
      timeoutMs: 15000,
      safetyId: payload.sessionToken,
      system: `Wybierasz jedno kontrolowane pytanie adaptacyjne. Krok 0 zbiera zdarzenie, krok 1 mechanizm i odpowiedzialność, krok 2 kontrsygnał lub próbę prawdy. ${CAMERA_RULE} ${TONE} Nie powtarzaj poprzedniego pytania.`,
      user: compact(payload),
    });
  } catch {
    return {
      question: fallback,
      focus: FOCUS[step],
      observation: step
        ? "Pytanie wynika z brakującej warstwy materiału, nie z gotowego werdyktu."
        : "Najpierw potrzebny jest kadr możliwy do opisania z perspektywy kamery.",
      finished: step >= 2,
    };
  }
}

function buildImmediateCase(input, safety = safetyService.scan(input)) {
  const model = pathModel(input.path);
  const answers = Array.isArray(input.answers) ? input.answers : [];
  const context = input.context || {};
  const interview = Array.isArray(input.interview) ? input.interview : [];
  const substantive = interview.filter((item) => {
    const answer = clean(item?.answer);
    return answer.length >= 20 && !/brak wystarczających danych/i.test(answer);
  });
  const scores = answers.map((item) => Number(item.score) || 0);
  const average = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
  const burdens = Array.isArray(context.burdens) ? context.burdens.filter(Boolean) : [];
  const emotions = Array.isArray(context.emotions) ? context.emotions.filter(Boolean) : [];
  const truth = clean(context.truth);
  const forceValues = Object.values(context.forceMap || {});
  const userLoad = forceValues.filter((value) => value === "definitely_me" || value === "mostly_me").length;
  const otherLoad = forceValues.filter((value) => value === "definitely_other" || value === "mostly_other").length;
  const burdenLevel = average >= 2.35 || burdens.length >= 3
    ? "overloading"
    : average >= 1.65 || burdens.length >= 2
      ? "high"
      : average >= 0.75 || burdens.length >= 1
        ? "moderate"
        : "low";
  const confidence = substantive.length >= 2 && answers.length >= 6 ? "medium" : "low";
  const mainSource = burdens.length
    ? burdens.slice(0, 2).join(" i ")
    : userLoad > otherLoad
      ? "przejmowanie inicjatywy i odpowiedzialności za utrzymanie relacji"
      : "niepewność oraz konieczność ciągłego interpretowania sytuacji";
  const observed = userLoad > otherLoad
    ? `W mapie odpowiedzialności częściej wskazujesz własną inicjatywę i własny udział w naprawianiu sytuacji. Najmocniej obciążają Cię: ${burdens.slice(0, 3).join(", ") || "analizowanie i brak jasności"}.`
    : `Odpowiedzi nie pokazują jednoznacznie, że cały ciężar pozostaje po jednej stronie. Najmocniej wracają jednak: ${burdens.slice(0, 3).join(", ") || emotions.slice(0, 3).join(", ") || "niepewność i potrzeba sprawdzenia wzorca"}.`;
  const eventEvidence = substantive[0]
    ? short(substantive[0].answer, 260)
    : "Nie podano jeszcze wystarczająco konkretnego zdarzenia, które można umieścić na osi czasu.";
  const userMeaning = truth || short(answers.filter((item) => Number(item.score) >= 2)[0]?.answer, 180) || "Sytuacja ma dla Ciebie wyraźne znaczenie, ale wymaga oddzielenia od obserwowalnych zdarzeń.";

  const discrepancyOne = {
    userMeaning,
    observedMaterial: observed,
    unknown: model.unknown,
    importance: "important",
  };
  const discrepancyTwo = {
    userMeaning: "Zmiana powinna być widoczna nie tylko w rozmowie, ale również w późniejszym zachowaniu.",
    observedMaterial: substantive.length
      ? `Najbardziej konkretny fragment opisu brzmi: „${eventEvidence}”`
      : "Materiał zawiera odpowiedzi zamknięte i mapę kontekstu, ale niewiele obserwowalnych zdarzeń.",
    unknown: "Nie wiadomo, czy ten sam sposób działania powtarza się w kilku sytuacjach i utrzymuje w czasie.",
    importance: substantive.length ? "important" : "supporting",
  };

  const evidence = [
    observed,
    substantive.length
      ? "Użytkownik podał co najmniej jeden konkretny opis sytuacji."
      : "Brakuje rozbudowanego opisu konkretnego zdarzenia.",
  ];
  if (truth) evidence.push(`Użytkownik wskazał jako ważne zdanie: „${short(truth, 180)}”`);
  if (emotions.length) evidence.push(`Najczęściej wskazywane stany to: ${emotions.slice(0, 3).join(", ")}.`);

  const mainHypothesis = {
    title: model.main,
    explanation: `${model.main} Obecny materiał wzmacnia tę wersję przede wszystkim przez sposób rozkładu odpowiedzialności, powtarzający się koszt oraz brak jednej informacji rozstrzygającej.`,
    evidence: evidence.slice(0, 6),
    limits: [model.unknown, "Analiza opiera się na perspektywie jednej osoby."],
    confidence,
  };
  const counterHypothesis = {
    title: model.counter,
    explanation: `${model.counter} Ta wersja wymaga jednak potwierdzenia konkretnym zachowaniem, a nie wyłącznie deklaracją albo pojedynczym dobrym momentem.`,
    evidence: substantive.length
      ? ["Opis zawiera przynajmniej jeden konkretny fragment, który może być dalej weryfikowany."]
      : ["Brak pełnej osi czasu pozostawia miejsce dla alternatywnego wyjaśnienia."],
    limits: ["Kontrhipoteza nie jest potwierdzona bez obserwacji zachowania w czasie.", model.unknown],
    confidence: "low",
  };

  const mirror = {
    headline: model.headline,
    observation: observed,
    unknown: model.unknown,
    nextFocus: model.verify,
  };
  const preview = {
    version: "3.0",
    headline: model.headline,
    essence: mainHypothesis.explanation,
    observedSignal: observed,
    unknown: model.unknown,
    verify: model.verify,
    premiumPromise: "Pełny raport pokaże pełną Mapę Rozbieżności, główną hipotezę i kontrhipotezę, Profil Obciążenia, Rejestr Granic oraz konkretny test rzeczywistości.",
    discrepancySample: [discrepancyOne, discrepancyTwo],
    confidence,
    safety,
  };

  const statements = [];
  for (const item of substantive) {
    statements.push({
      sourceText: item.answer,
      segments: [{
        text: item.answer,
        category: "mixed",
        cameraObservable: false,
        confidence: "low",
        note: "Opis zawiera materiał obserwowalny oraz znaczenie nadane sytuacji; pełny raport rozdzieli te elementy.",
      }],
    });
  }
  if (clean(input.finalContext).length >= 20) {
    statements.push({
      sourceText: input.finalContext,
      segments: [{
        text: input.finalContext,
        category: "mixed",
        cameraObservable: false,
        confidence: "low",
        note: "Szerszy kontekst może zarówno wspierać, jak i osłabiać pierwszą hipotezę.",
      }],
    });
  }

  return {
    version: "3.0",
    safety,
    statements,
    events: substantive.slice(0, 3).map((item) => ({
      what: short(item.answer, 320),
      when: "Nie określono precyzyjnie",
      frequency: "Do sprawdzenia",
      actor: "both",
      evidence: short(item.answer, 320),
      confidence: "low",
    })),
    discrepancies: [discrepancyOne, discrepancyTwo],
    unknowns: [model.unknown, "Nie wiadomo, czy obserwowany wzorzec utrzymuje się w czasie bez aktywnego podtrzymywania go przez użytkownika."],
    mainHypothesis,
    counterHypothesis,
    burden: {
      level: burdenLevel,
      mainSource,
      processes: burdens.length ? burdens.slice(0, 6) : ["analizowanie", "przewidywanie", "szukanie jasności"],
      spillover: burdenLevel === "high" || burdenLevel === "overloading"
        ? "Obciążenie może wpływać na koncentrację, decyzje i zdolność odpoczywania, ale skala tego wpływu wymaga osobnego potwierdzenia."
        : "Materiał nie pokazuje jeszcze silnego przeniesienia kosztu na inne obszary życia.",
      evidence: evidence.slice(0, 6),
    },
    mirror,
    preview,
    recommendedProtocol: {
      key: model.protocol,
      title: model.protocol === "initiative"
        ? "Test samodzielnej inicjatywy"
        : model.protocol === "repair"
          ? "Test odpowiedzialności po konflikcie"
          : model.protocol === "words_actions"
            ? "Test spójności słów i działań"
            : "Test respektowania ustalonego kryterium",
      reason: model.verify,
    },
  };
}

async function analyzeCaseFast({ input }) {
  const safety = safetyService.scan(input);
  return buildImmediateCase(input, safety);
}

async function analyzeCase({ sessionToken, input }) {
  const safety = safetyService.scan(input);
  const baseline = buildImmediateCase(input, safety);
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(baseline), 18000);
  });
  const ai = structured({
    name: "ctms_v3_case_model",
    schema: schemas.caseModel,
    model: process.env.OPENAI_REASONING_MODEL || process.env.OPENAI_MODEL,
    effort: "low",
    timeoutMs: 16000,
    safetyId: sessionToken,
    system: `Tworzysz ustrukturyzowany model sprawy CzyToMaSens 3.0 według sześciu warstw: zdarzenia, narracja, rozbieżności, koszt, kryteria/test, zmiana w czasie. ${CAMERA_RULE} ${TONE} Bezpieczny protokół wybierz tylko spośród: initiative, words_actions, repair, boundary. Jeśli safety level nie jest clear, protocolAllowed=false i nie sugeruj eksperymentu. Obowiązkowo podaj najsilniejszą kontrhipotezę, ale nie wymyślaj jej bez oparcia.`,
    user: compact({ input, deterministicSafety: safety, deterministicClassificationHints: classificationRules.hints(input) }),
  }).then((result) => {
    result.safety = safety.level === "clear" ? result.safety : safety;
    result.preview.safety = result.safety;
    return result;
  }).catch(() => baseline);

  const result = await Promise.race([ai, timeout]);
  clearTimeout(timer);
  return result;
}

module.exports = {
  generateMirror,
  nextInterviewQuestion,
  analyzeCase,
  analyzeCaseFast,
  buildImmediateCase,
  CAMERA_RULE,
};
