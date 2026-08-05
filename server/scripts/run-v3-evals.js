"use strict";
const fs=require("fs");
const path=require("path");
const { classify }=require("../src/services/v3/classification.rules");
const cases=JSON.parse(fs.readFileSync(path.join(__dirname,"../evals/v3-classification.cases.json"),"utf8"));
let passed=0; const errors=[];
for(const item of cases){ const actual=classify(item.text).category; const ok=item.accept.includes(actual); if(ok)passed++; else errors.push({id:item.id,text:item.text,expected:item.accept,actual}); }
const score=passed/cases.length;
console.log(`V3 classification baseline: ${passed}/${cases.length} (${(score*100).toFixed(1)}%)`);
if(errors.length) console.table(errors.slice(0,20));
if(score<0.85){ console.error("Benchmark poniżej 85%. Blokuję wdrożenie."); process.exit(1); }
