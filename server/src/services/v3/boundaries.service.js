"use strict";
const { structured } = require("./openai-json");
const schema = {
  type:"object", additionalProperties:false,
  required:["status","criterion","observed","newExplanations","message"],
  properties:{
    status:{type:"string",enum:["not-set","not-enough-data","respected","possibly-crossed","consciously-revised","possibly-moved"]},
    criterion:{type:"string"}, observed:{type:"string"}, newExplanations:{type:"array",items:{type:"string"},maxItems:6}, message:{type:"string"}
  }
};
async function compare({caseId,boundaries,checkin,previousState}){
  if(!boundaries?.unacceptableBehavior && !boundaries?.improvementProof) return {status:"not-set",criterion:"Nie ustalono",observed:"Brak wcześniejszego kryterium.",newExplanations:[],message:"Nie ma jeszcze zapisanej granicy, z którą można porównać nowe zdarzenia."};
  try{
    return await structured({name:"ctms_v3_boundary_comparison",schema,model:process.env.OPENAI_MODEL,effort:"medium",safetyId:caseId,system:"Porównaj nowe zdarzenia z wcześniej zadeklarowaną granicą i dowodem poprawy. Nie oskarżaj użytkownika o samookłamywanie. Odróżnij świadomą zmianę kryterium od możliwego przesunięcia bramki po rozczarowaniu. Nie diagnozuj partnera. Jeśli danych brakuje, wybierz not-enough-data.",user:JSON.stringify({boundaries,checkin,previousState},null,2).slice(0,50000)});
  }catch{
    const text=JSON.stringify(checkin||{}).toLowerCase();
    const criterion=boundaries.unacceptableBehavior||boundaries.improvementProof;
    const possibly=/znowu|to samo|nie zmieni|brak|nadal/.test(text);
    return {status:possibly?"possibly-crossed":"not-enough-data",criterion,observed:possibly?"Nowy zapis zawiera sygnał podobny do wcześniejszego kryterium.":"Brak wystarczających danych do porównania.",newExplanations:[],message:possibly?"Warto świadomie sprawdzić, czy wcześniejsze kryterium nadal obowiązuje, czy zostało zmienione po pojawieniu się nowych faktów.":"Potrzebny jest konkretniejszy opis zachowania."};
  }
}
module.exports={compare};
