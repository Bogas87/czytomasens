"use strict";
const RULES = {
  emotion: [/(czuj|czuł|czuła|boję|bał|bała|lęk|smut|złoś|wstyd|ulg|tęskn|niepokój)/i],
  prediction: [/(na pewno|nigdy|zawsze będzie|znowu (zrobi|odejd|zdradz)|nie zmieni się|nie zrozumie|już nigdy)/i],
  interpretation: [/(chce mnie|robi to,? żeby|boi się (zaangażowania|bliskości|odpowiedzialności)|nienawidz|manipulu|nie szanuje|chce kontrolować)/i],
  justification: [/(bo ma dużo pracy|bo jest zmęcz|bo mia[łła]+ trudne dzieciństwo|taki ma charakter|potrzebuje czasu|dlatego nie inicjuje)/i],
  event: [/(nie odpisa[łła]|odpisa[łła]|powiedzia[łła]|napisa[łła]|wyszedł|wyszła|zadzwoni[łła]|nie zadzwoni[łła]|przerwa[łła]|nie przyszedł|nie przyszła|przyszedł|przyszła|odwoła[łła]|nie napisa[łła])/i, /\b\d+\s*(dni|dzień|razy|tygodni|godzin|godziny)\b/i],
};
function classify(text) {
  const value=String(text||"").trim();
  const matches=[];
  for (const [category, patterns] of Object.entries(RULES)) if(patterns.some(p=>p.test(value))) matches.push(category);
  const unique=[...new Set(matches)];
  if(!unique.length) return { category:"unknown", cameraObservable:false, confidence:"low", note:"Brak wystarczającego sygnału do automatycznej klasyfikacji." };
  if(unique.length>1) return { category:"mixed", cameraObservable:false, confidence:"medium", note:`Wypowiedź łączy: ${unique.join(", ")}. Wymaga segmentacji.` };
  const category=unique[0];
  return { category, cameraObservable:category==="event", confidence:"medium", note:category==="event"?"Wypowiedź zawiera element możliwy do zobaczenia, usłyszenia, policzenia albo osadzenia w czasie.":"To znaczenie, emocja, przewidywanie lub wyjaśnienie — nie sam obserwowalny fakt." };
}
function hints(input){
  const texts=[];
  for(const x of input?.interview||[]) if(x?.answer) texts.push(x.answer);
  if(input?.finalContext) texts.push(input.finalContext);
  return texts.slice(0,20).map(sourceText=>({sourceText,hint:classify(sourceText)}));
}
module.exports={classify,hints};
