import React from "react";
import type { V3Mirror } from "../types";
import { Kicker, PrimaryButton, Surface } from "./Layout";

export function MidMirror({ mirror, loading, onContinue }: { mirror: V3Mirror | null; loading: boolean; onContinue: () => void }) {
  const content = mirror || {
    headline: "Odpowiedzi zaczynają układać się w jeden kierunek.",
    observation: "Na razie widać powtarzalność napięcia i sposób, w jaki próbujesz odzyskać jasność.",
    unknown: "Nie wiadomo jeszcze, czy głównym źródłem jest zachowanie drugiej osoby, czy sposób reagowania na niepewność.",
    nextFocus: "Dalsza część sprawdzi rozkład odpowiedzialności i konkretne zachowania po trudnych momentach.",
  };

  return (
    <Surface className="ctms-mirror">
      <header>
        <div><Kicker>PIERWSZE LUSTRO</Kicker><span>To jeszcze nie jest wniosek</span></div>
        <b>02 / 06</b>
      </header>
      <h1>{loading ? "Układamy pierwsze zależności…" : content.headline}</h1>
      <div className="ctms-mirror-grid">
        <article><span>CO SIĘ POWTARZA</span><p>{content.observation}</p></article>
        <article><span>CZEGO NIE WIEMY</span><p>{content.unknown}</p></article>
        <article className="ctms-mirror-next"><span>CO SPRAWDZIMY DALEJ</span><p>{content.nextFocus}</p></article>
      </div>
      <div className="ctms-mirror-actions"><PrimaryButton onClick={onContinue} disabled={loading}>Idziemy dalej</PrimaryButton></div>
    </Surface>
  );
}
