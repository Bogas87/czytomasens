"use strict";
const schemas = require("./schemas");
const { structured } = require("./openai-json");
const safetyService = require("./safety.service");
const classificationRules = require("./classification.rules");

const CAMERA_RULE = `ZASADA KAMERY: faktem jest tylko to, co można zobaczyć, usłyszeć, policzyć lub umieścić na osi czasu. Intencje, motywy i diagnozy drugiej osoby są interpretacją albo niewiadomą. Wypowiedzi mieszane rozdzielaj. Gdy danych brakuje, nie zgaduj. Nie diagnozuj partnera. Nie przyznawaj automatycznie racji użytkownikowi.`;
const TONE = `Język spokojny, precyzyjny, empatyczny i nieoskarżający. Bez psychologicznego żargonu dla efektu, bez moralizowania, bez procentowej szansy relacji, bez udawania terapii.`;
function compact(input) { return JSON.stringify(input, null, 2).slice(0, 60000); }

function fallbackMirror(payload) {
  const high = (payload.answers || []).filter((x) => Number(x.score) >= 2).length;
  return { headline: high ? "W kilku odpowiedziach wraca podobny koszt, ale jego źródło nie jest jeszcze rozstrzygnięte." : "Obraz nie jest jednostronny. Potrzebny jest konkretny przykład.", observation: high ? "Powtarza się napięcie, brak jasności albo nierówny ciężar. To sygnał do sprawdzenia, nie diagnoza." : "Dotychczasowe wybory pokazują zasoby i obszary niepewności.", unknown:"Nie wiadomo jeszcze, czy chodzi o stały wzorzec, chwilowy kryzys czy reakcję na jedno zdarzenie.", nextFocus:"Dalsze pytania powinny zebrać zachowania, kolejność i kontrsygnał." };
}
async function generateMirror(payload) {
  try { return await structured({ name:"ctms_v3_mirror", schema:schemas.mirror, model:process.env.OPENAI_MODEL, effort:"low", safetyId:payload.sessionToken, system:`Jesteś warstwą metodologiczną CzyToMaSens 3.0. ${CAMERA_RULE} ${TONE} Stwórz tylko jedno lustro pośrednie: obserwacja, niewiadoma i cel kolejnych pytań.`, user:compact(payload) }); }
  catch { return fallbackMirror(payload); }
}

const FOCUS = ["concrete_event", "mechanism", "counter_signal"];
async function nextInterviewQuestion(payload) {
  const step = Math.max(0, Math.min(2, Number(payload.step || 0)));
  const fallback = [
    "Odtwórz jedną sytuację: kiedy to było, co dokładnie zrobiła lub powiedziała druga osoba, co zrobiłeś/zrobiłaś Ty i co wydarzyło się potem?",
    "W tej sytuacji kto wykonał kolejny ruch, kto przejął odpowiedzialność i jaki koszt poniosłeś/poniosłaś, żeby utrzymać kontakt albo spokój?",
    "Jaki konkretny fakt mógłby podważyć Twoje obecne wyjaśnienie tej sytuacji? Opisz go bez tłumaczenia intencji drugiej osoby.",
  ][step];
  const schema = { type:"object", additionalProperties:false, required:["question","focus","observation","finished"], properties:{ question:{type:"string"}, focus:{type:"string",enum:FOCUS}, observation:{type:"string"}, finished:{type:"boolean"} } };
  try { return await structured({ name:"ctms_v3_interview", schema, model:process.env.OPENAI_MODEL, effort:"medium", safetyId:payload.sessionToken, system:`Wybierasz jedno kontrolowane pytanie adaptacyjne. Krok 0 zbiera zdarzenie, krok 1 mechanizm i odpowiedzialność, krok 2 kontrsygnał lub próbę prawdy. ${CAMERA_RULE} ${TONE} Nie powtarzaj poprzedniego pytania.`, user:compact(payload) }); }
  catch { return { question:fallback, focus:FOCUS[step], observation:step ? "Pytanie wynika z brakującej warstwy materiału, nie z gotowego werdyktu." : "Najpierw potrzebny jest kadr możliwy do opisania z perspektywy kamery.", finished:step >= 2 }; }
}

function fallbackCase(input, safety) {
  const statements = [];
  for (const item of input.interview || []) statements.push({ sourceText:item.answer, segments:[{ text:item.answer, category:"mixed", cameraObservable:false, confidence:"low", note:"Wymaga rozdzielenia obserwacji od znaczenia." }] });
  if (input.finalContext) statements.push({ sourceText:input.finalContext, segments:[{ text:input.finalContext, category:"mixed", cameraObservable:false, confidence:"low", note:"Szerszy kontekst użytkownika." }] });
  const main = { title:"W zebranym materiale może występować nierównowaga między interpretowaniem sytuacji a obserwowalną zmianą zachowania.", explanation:"Powtarza się potrzeba sprawdzania, co znaczą zachowania drugiej osoby. To hipoteza robocza, nie ocena partnera.", evidence:["Użytkownik zgłasza niepewność i potrzebę analizy.","Materiał zawiera interpretacje wymagające sprawdzenia zachowaniem."], limits:["Perspektywa jednej osoby.","Brakuje dłuższej osi czasu."], confidence:"low" };
  const counter = { title:"Część napięcia może wynikać z chwilowego kryzysu albo wcześniejszych doświadczeń użytkownika.", explanation:"Bez powtarzalnych zdarzeń nie można przypisać źródła wyłącznie obecnej relacji.", evidence:["Brak pełnej chronologii."], limits:["Kontrhipoteza wymaga konkretnego kontrsygnału."], confidence:"low" };
  const discrepancy = { userMeaning:"Sytuacja ma określone znaczenie.", observedMaterial:"Opis zawiera emocje i interpretacje, ale jeszcze za mało uporządkowanych zdarzeń.", unknown:"Nie wiadomo, czy wzór utrzyma się bez aktywnego podtrzymywania go przez użytkownika.", importance:"important" };
  const mirror = fallbackMirror({ answers:input.answers || [] });
  const preview = { version:"3.0", headline:"Najważniejsza różnica leży między tym, co sytuacja może znaczyć, a tym, co zostało potwierdzone zachowaniem.", essence:main.explanation, observedSignal:"W materiale wraca potrzeba przewidywania i wyjaśniania.", unknown:discrepancy.unknown, verify:"Potrzebny jest jeden obserwowalny test zachowania bez manipulowania sytuacją.", premiumPromise:"Pełny raport pokaże Mapę Rozbieżności, hipotezę, kontrhipotezę, granice i bezpieczny test rzeczywistości.", discrepancySample:[discrepancy], confidence:"low", safety };
  return { version:"3.0", safety, statements, events:[], discrepancies:[discrepancy], unknowns:[discrepancy.unknown], mainHypothesis:main, counterHypothesis:counter, burden:{ level:"moderate", mainSource:"ciągłe interpretowanie i przewidywanie", processes:["analizowanie","przewidywanie","szukanie wyjaśnień"], spillover:"Materiał nie pozwala jeszcze uczciwie określić skali wpływu na inne obszary życia.", evidence:["Powracająca potrzeba uzyskania jasności."] }, mirror, preview, recommendedProtocol:{ key:"initiative", title:"Test samodzielnej inicjatywy", reason:"Pozwala zebrać obserwowalny materiał bez diagnozowania intencji." } };
}
async function analyzeCase({ sessionToken, input }) {
  const safety = safetyService.scan(input);
  try {
    const result = await structured({ name:"ctms_v3_case_model", schema:schemas.caseModel, model:process.env.OPENAI_REPORT_MODEL, effort:"high", safetyId:sessionToken, system:`Tworzysz ustrukturyzowany model sprawy CzyToMaSens 3.0 według sześciu warstw: zdarzenia, narracja, rozbieżności, koszt, kryteria/test, zmiana w czasie. ${CAMERA_RULE} ${TONE} Bezpieczny protokół wybierz tylko spośród: initiative, words_actions, repair, boundary. Jeśli safety level nie jest clear, protocolAllowed=false i nie sugeruj eksperymentu. Obowiązkowo podaj najsilniejszą kontrhipotezę, ale nie wymyślaj jej bez oparcia.`, user:compact({ input, deterministicSafety:safety, deterministicClassificationHints:classificationRules.hints(input) }) });
    result.safety = safety.level === "clear" ? result.safety : safety;
    result.preview.safety = result.safety;
    return result;
  } catch { return fallbackCase(input, safety); }
}
module.exports = { generateMirror, nextInterviewQuestion, analyzeCase, CAMERA_RULE };
