"use strict";
const crypto = require("crypto");
function tokenHash(token) { return crypto.createHash("sha256").update(String(token)).digest("hex"); }
function newToken() { return crypto.randomBytes(32).toString("base64url"); }
function publicUrl(token) { return `${(process.env.CLIENT_URL || "https://czytomasens.pl").replace(/\/$/,"")}/?v3_return=${encodeURIComponent(token)}`; }
function earlyWarning(checkins = []) {
  const last = checkins.slice(0,3);
  if (last.length < 3) return null;
  const text = JSON.stringify(last.map(x=>x.input)).toLowerCase();
  const markers = ["to samo","znowu","wrócił","brak zmiany","usprawiedliw","nadal ja","nie inicjuje"].filter(x=>text.includes(x));
  if (markers.length >= 3) return { level:"important", message:"W trzech ostatnich zapisach wracają podobne sygnały bez wyraźnego potwierdzenia trwałej zmiany.", evidence:markers };
  if (markers.length) return { level:"watch", message:"W kolejnych zapisach pojawia się podobny mechanizm. Warto porównać go z wcześniejszym kryterium.", evidence:markers };
  return { level:"none", message:"Nie ma jeszcze wystarczającego wzoru do ostrzeżenia.", evidence:[] };
}
module.exports = { tokenHash, newToken, publicUrl, earlyWarning };
