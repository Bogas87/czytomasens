import React from "react";
import type { V3FullReport } from "../types";
import { Kicker, PrimaryButton, SecondaryButton, Surface } from "./Layout";

function confidenceLabel(value: V3FullReport["confidence"]): string {
  if (value === "high") return "wysoka";
  if (value === "medium") return "umiarkowana";
  return "ograniczona";
}

function BulletList({ items }: { items: string[] }) {
  return <ul>{items.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>;
}

export function PremiumReport({
  report,
  protocolStarted,
  startingProtocol,
  recoveryUrl,
  onStartProtocol,
  onCopyLink,
}: {
  report: V3FullReport;
  protocolStarted: boolean;
  startingProtocol: boolean;
  recoveryUrl: string;
  onStartProtocol: () => void;
  onCopyLink: () => void;
}) {
  return (
    <div className="ctms-v7-premium">
      <section className="ctms-v7-premium-hero">
        <div>
          <Kicker>TWÓJ PEŁNY RAPORT</Kicker>
          <h1>{report.headline}</h1>
          <p>{report.subheadline}</p>
          <div className="ctms-v7-premium-meta">
            <span><b>◫</b><small>Pewność odczytu</small><strong>{confidenceLabel(report.confidence)}</strong></span>
            <span><b>♡</b><small>Charakter analizy</small><strong>indywidualny</strong></span>
            <span><b>◷</b><small>Materiał</small><strong>Twoje odpowiedzi</strong></span>
          </div>
        </div>
        <div className="ctms-v7-premium-hero-art" aria-hidden="true" />
      </section>

      <section className="ctms-v7-premium-top-grid">
        <Surface className="ctms-v7-premium-card key">
          <Kicker>01 · KLUCZOWY WNIOSEK</Kicker>
          <h2>{report.essence}</h2>
          <div className="ctms-v7-strength"><span>Siła odczytu</span><i><b style={{width: report.confidence === "high" ? "78%" : report.confidence === "medium" ? "58%" : "38%"}} /></i><strong>{confidenceLabel(report.confidence)}</strong></div>
        </Surface>

        <Surface className="ctms-v7-premium-card dynamics">
          <Kicker>02 · DYNAMIKA RELACJI</Kicker>
          <h2>Jak materiał układa się w powtarzalny mechanizm.</h2>
          <div className="ctms-v7-orbit">
            <span>Twoja perspektywa</span><i /><strong>{report.mainHypothesis.title}</strong><i /><span>alternatywa</span>
          </div>
          <p>{report.mainHypothesis.explanation}</p>
        </Surface>

        <Surface className="ctms-v7-premium-card patterns">
          <Kicker>03 · POWTARZAJĄCE SIĘ WZORCE</Kicker>
          <BulletList items={report.whatWeKnow.slice(0, 4)} />
          <div className="ctms-v7-decor" aria-hidden="true" />
        </Surface>
      </section>

      <section className="ctms-v7-premium-mid-grid">
        <Surface className="ctms-v7-premium-card gaps">
          <Kicker>04 · LUKI W POSTRZEGANIU</Kicker>
          <div className="ctms-v7-gap-cols">
            <div><span>CO DZIŚ WIESZ</span><BulletList items={report.whatWeKnow.slice(0, 3)} /></div>
            <div><span>CZEGO JESZCZE NIE WIESZ</span><BulletList items={report.unknowns.slice(0, 3)} /></div>
          </div>
        </Surface>

        <Surface className="ctms-v7-premium-card verify">
          <Kicker>05 · CO JEST PRAWDOPODOBNE, A CO WARTO JESZCZE ZWERYFIKOWAĆ</Kicker>
          <div className="ctms-v7-gap-cols">
            <div><span>PRAWDOPODOBNE</span><BulletList items={report.evidenceFor.slice(0, 4)} /></div>
            <div><span>WARTO ZWERYFIKOWAĆ</span><BulletList items={report.changeConditions.slice(0, 4)} /></div>
          </div>
        </Surface>

        <Surface className="ctms-v7-premium-card practical">
          <Kicker>06 · PRAKTYCZNE KROKI</Kicker>
          <h2>{report.nextMove}</h2>
          <BulletList items={report.safety.protocolAllowed ? report.recommendedProtocol.observe.slice(0,4) : report.changeConditions.slice(0,4)} />
        </Surface>
      </section>

      <section className="ctms-v7-premium-reflection">
        <Surface className="ctms-v7-premium-card reflection">
          <Kicker>07 · REFLEKSJA I REKOMENDACJA</Kicker>
          <p>{report.closing}</p>
          <div className="ctms-v7-reflection-row">
            <span><b>◉</b><small>Największa siła</small><strong>{report.mainHypothesis.title}</strong></span>
            <span><b>◇</b><small>Największe wyzwanie</small><strong>{report.blindSpot}</strong></span>
            <span><b>⌘</b><small>Rekomendacja</small><strong>{report.nextMove}</strong></span>
          </div>
        </Surface>

        <blockquote>
          „Relacja nie jest dana raz na zawsze. Jest tworzona — w codziennych wyborach, rozmowach i gestach.”
        </blockquote>
        <div className="ctms-v7-premium-bottom-art" aria-hidden="true" />
      </section>

      {report.safety.protocolAllowed && (
        <Surface className="ctms-v7-protocol">
          <div>
            <Kicker>SPRAWDZENIE W RZECZYWISTOŚCI</Kicker>
            <h2>{report.recommendedProtocol.title}</h2>
            <p>{report.recommendedProtocol.hypothesis}</p>
          </div>
          {!protocolStarted ? (
            <PrimaryButton onClick={onStartProtocol} disabled={startingProtocol}>
              {startingProtocol ? "Uruchamiamy…" : "Zaplanuj kolejną analizę"}
            </PrimaryButton>
          ) : (
            <div className="ctms-recovery-box">
              <strong>Sprawdzenie zapisane.</strong>
              <code>{recoveryUrl}</code>
              <SecondaryButton onClick={onCopyLink}>Kopiuj prywatny link</SecondaryButton>
            </div>
          )}
        </Surface>
      )}
    </div>
  );
}
