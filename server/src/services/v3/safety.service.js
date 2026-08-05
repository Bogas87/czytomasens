"use strict";
const HIGH = ["uderzył", "uderzyła", "dusi", "grozi", "zabij", "śledzi mnie", "stalking", "boję się wrócić", "zabrał mi telefon", "zabrała mi telefon", "nie pozwala wyjść", "przemoc", "gwałt", "broń"];
const CAUTION = ["kontroluje", "upokarza", "szantaż", "izoluje", "krzyczy", "groźba", "boję się reakcji", "sprawdza telefon", "zabrania"];
function scan(input) {
  const text = JSON.stringify(input || {}).toLowerCase();
  const high = HIGH.filter((token) => text.includes(token));
  const caution = CAUTION.filter((token) => text.includes(token));
  if (high.length) return { level: "high-risk", signals: high.slice(0, 8), protocolAllowed: false, message: "W materiale pojawia się sygnał mogący dotyczyć bezpieczeństwa. Nie proponujemy testów relacyjnych ani eksperymentów zachowania." };
  if (caution.length) return { level: "caution", signals: caution.slice(0, 8), protocolAllowed: false, message: "W materiale pojawiają się sygnały kontroli lub presji. Najpierw potrzebna jest ocena bezpieczeństwa, nie testowanie partnera." };
  return { level: "clear", signals: [], protocolAllowed: true, message: "Nie wykryto wprost sygnału wymagającego wyłączenia protokołów. To nie jest gwarancja bezpieczeństwa." };
}
module.exports = { scan };
