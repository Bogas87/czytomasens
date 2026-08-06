"use strict";

const methodology = require("../src/services/v3/methodology.service");

async function main() {
  const started = Date.now();
  const input = {
    path: "asymmetry",
    answers: [
      { question: "Kto częściej wraca po konflikcie?", answer: "Najczęściej ja", score: 3 },
      { question: "Czy druga osoba inicjuje zmianę?", answer: "Rzadko", score: 2 },
    ],
    context: {
      forceMap: {
        initiative: "definitely_me",
        repair: "mostly_me",
        emotionalLabor: "mostly_me",
        clarity: "definitely_me",
      },
      burdens: ["inicjowanie wszystkiego", "brak wzajemności"],
      emotions: ["zmęczenie", "żal"],
      truth: "Gdy przestaję się starać, relacja wyraźnie słabnie.",
    },
    interview: [
      {
        question: "Opisz konkretną sytuację.",
        answer: "Po kłótni przez trzy dni nie było kontaktu. Napisałem pierwszy i dopiero wtedy wróciliśmy do rozmowy.",
        focus: "concrete_event",
      },
    ],
    finalContext: "Podobny układ powtarzał się już wcześniej, ale nie w każdej trudnej sytuacji.",
  };

  const result = await methodology.analyzeCaseFast({ input });
  const elapsed = Date.now() - started;

  if (!result?.preview?.headline || !result?.mainHypothesis || !result?.counterHypothesis) {
    throw new Error("Pierwszy odczyt V3 ma niepełną strukturę.");
  }
  if (elapsed > 2000) {
    throw new Error(`Pierwszy odczyt trwał zbyt długo: ${elapsed} ms.`);
  }

  console.log(`V3 free preview smoke test: OK (${elapsed} ms)`);
  console.log(result.preview.headline);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
