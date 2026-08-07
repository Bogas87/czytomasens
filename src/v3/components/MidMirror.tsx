import React from "react";
import type { V3Mirror } from "../types";
import { Kicker, PrimaryButton, Surface } from "./Layout";

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
    headline: "Odpowiedzi zaczynają układać się w jeden kierunek, ale to jeszcze nie jest wniosek.",
    observation: "W kilku miejscach wraca podobny koszt i potrzeba odzyskania jasności.",
    unknown: "Nie wiadomo jeszcze, czy opisujesz stały wzorzec, chwilowy kryzys czy reakcję na jedno zdarzenie.",
    nextFocus: "Dalsze pytania sprawdzą rozkład odpowiedzialności i zachowanie obu stron po trudnym momencie.",
  };

  return (
    <Surface className="ctms-mirror">
      <div className="ctms-stage-head ctms-stage-head-compact">
        <Kicker>TWOJE PIERWSZE LUSTRO</Kicker>
        <h1>{loading ? "Porządkujemy pierwszą część odpowiedzi…" : content.headline}</h1>
        <p>To punkt zwrotny, nie diagnoza. Pokazuje kierunek, który teraz trzeba uczciwie sprawdzić.</p>
      </div>

      <div className="ctms-mirror-grid">
        <article>
          <span>01 · Co zaczyna się powtarzać</span>
          <p>{content.observation}</p>
        </article>
        <article>
          <span>02 · Czego jeszcze nie wiemy</span>
          <p>{content.unknown}</p>
        </article>
        <article>
          <span>03 · Dlatego idziemy dalej</span>
          <p>{content.nextFocus}</p>
        </article>
      </div>

      <div className="ctms-actions">
        <PrimaryButton onClick={onContinue} disabled={loading}>Idziemy głębiej</PrimaryButton>
      </div>
    </Surface>
  );
}
