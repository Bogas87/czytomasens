"use strict";
const schemas = require("./schemas");
const { structured } = require("./openai-json");
const protocols = require("./protocols.service");
function boundariesArray(draft = {}) {
  return [
    ["Dowód poprawy", draft.improvementProof], ["Granica", draft.unacceptableBehavior],
    ["Okres obserwacji", draft.observationWindow], ["Czego użytkownik nie przejmie za drugą stronę", draft.userCommitment],
  ].map(([label,value]) => ({ label, value:value || "Nie ustalono", status:value ? "declared" : "not-set" }));
}
function fallback(caseModel, boundaries) {
  const protocol = protocols.choose(caseModel?.recommendedProtocol?.key, caseModel);
  const review = new Date(Date.now() + protocol.durationDays * 86400000).toISOString();
  return { version:"3.0", safety:caseModel.safety, headline:caseModel.preview.headline, subheadline:"Raport oddziela zdarzenia od znaczeń i wskazuje, co nadal wymaga sprawdzenia.", confidence:caseModel.mainHypothesis.confidence, essence:caseModel.preview.essence, whatWeKnow:caseModel.events.length ? caseModel.events.map(x=>x.what).slice(0,8) : [caseModel.preview.observedSignal,"Materiał pochodzi z jednej perspektywy."], unknowns:caseModel.unknowns, discrepancyMap:caseModel.discrepancies, mainHypothesis:caseModel.mainHypothesis, counterHypothesis:caseModel.counterHypothesis, evidenceFor:caseModel.mainHypothesis.evidence, evidenceAgainst:caseModel.counterHypothesis.evidence, blindSpot:"Największym ryzykiem poznawczym jest nadawanie pojedynczym sygnałom większej wagi niż powtarzalnemu układowi zachowań.", burdenProfile:caseModel.burden, boundaries:boundariesArray(boundaries), changeConditions:["Samodzielna, powtarzalna zmiana zachowania.","Nowe zdarzenia podważające główną hipotezę.","Świadoma i uzasadniona zmiana własnych kryteriów."], recommendedProtocol:protocol, nextMove:"Zapisz kryterium wyniku przed rozpoczęciem obserwacji i nie zmieniaj go pod wpływem jednego dobrego lub złego dnia.", reviewAt:review, closing:"Nie szukamy winnego. Sprawdzamy, czy Twoje rozumienie sytuacji wytrzymuje porównanie z tym, co rzeczywiście się wydarza." };
}
async function generateV3FullReport({ sessionToken, input, caseModel, boundaries }) {
  if (!caseModel) throw new Error("Brak modelu sprawy V3.");
  if (caseModel.safety?.level !== "clear") return fallback(caseModel, boundaries);
  const protocol = protocols.choose(caseModel.recommendedProtocol?.key, caseModel);
  try {
    const result = await structured({ name:"ctms_v3_full_report", schema:schemas.report, model:process.env.OPENAI_REPORT_MODEL, effort:"high", timeoutMs:90000, safetyId:sessionToken, system:`Tworzysz raport premium CzyToMaSens 3.0. Nie diagnozuj drugiej osoby. Pokaż materiał, niewiadome, hipotezę, kontrhipotezę i warunki rozstrzygnięcia. Język ma być empatyczny, techniczny i stanowczy bez oskarżania. Nie używaj procentów psychologicznych. Protokół jest z kontrolowanej biblioteki i nie wolno zmieniać jego działania na manipulacyjne.`, user:JSON.stringify({ input, caseModel, boundaries, controlledProtocol:protocol },null,2).slice(0,90000) });
    result.safety = caseModel.safety;
    result.recommendedProtocol = protocol;
    result.boundaries = boundariesArray(boundaries);
    return result;
  } catch { return fallback(caseModel, boundaries); }
}
module.exports = { generateV3FullReport, fallback };
