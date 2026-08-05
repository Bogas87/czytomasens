
import React from "react";
import { Kicker, PrimaryButton, Surface } from "./Layout";
import type { V3Mirror } from "../types";

export function MidMirror({
  mirror,
  loading,
  onContinue,
}: {
  mirror: V3Mirror | null;
  loading: boolean;
  onContinue: () => void;
}) {
  const content = mirror || {
    headline: "Odpowiedzi zaczynają układać się w jeden kierunek.",
    observation: "Na razie widać powtarzalność napięcia i sposób, w jaki próbujesz odzyskać jasność.",
    unknown: "Nie wiadomo jeszcze, czy głównym źródłem jest zachowanie drugiej osoby, czy sposób reagowania na niepewność.",
    nextFocus: "Dalsza część sprawdzi rozkład odpowiedzialności i konkretne zachowania po trudnych momentach.",
  };

  return (
    <Surface className="v3-mid-mirror">
      <div className="v3-mid-mirror-mark" aria-hidden="true">
        <span />
        <span />
      </div>
      <Kicker>PIERWSZE LUSTRO — TO JESZCZE NIE WNIOSEK</Kicker>
      <h1>{loading ? "Układamy pierwsze zależności…" : content.headline}</h1>
      <div className="v3-mid-mirror-grid">
        <article>
          <span>CO ZACZYNA SIĘ POWTARZAĆ</span>
          <p>{content.observation}</p>
        </article>
        <article>
          <span>CZEGO JESZCZE NIE WIEMY</span>
          <p>{content.unknown}</p>
        </article>
        <article className="v3-mid-mirror-next">
          <span>DLATEGO IDZIEMY DALEJ</span>
          <p>{content.nextFocus}</p>
        </article>
      </div>
      <div className="v3-mid-mirror-boundary">
        To nie jest śledzenie „toku myślenia AI”. To krótka informacja, jakie sygnały wynikają
        z dotychczasowych odpowiedzi i jakiego materiału nadal brakuje.
      </div>
      <PrimaryButton onClick={onContinue} disabled={loading}>Idziemy głębiej</PrimaryButton>
    </Surface>
  );
}
