import React from "react";
import type { V3FullReport } from "../types";
import { Kicker, PrimaryButton, SecondaryButton, Surface } from "./Layout";

function confidenceLabel(value: V3FullReport["confidence"]): string {
  if (value === "high") return "wysoka";
  if (value === "medium") return "umiarkowana";
  return "ograniczona";
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="ctms-report-card">
      <span>{title}</span>
      <ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
    </article>
  );
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
    <div className="ctms-report">
      <Surface className="ctms-report-cover">
        <div className="ctms-report-cover-copy">
          <Kicker>PEŁNY RAPORT</Kicker>
          <h1>{report.headline}</h1>
          <p>{report.subheadline}</p>
        </div>
        <aside>
          <span>PEWNOŚĆ ODCZYTU</span>
          <strong>{confidenceLabel(report.confidence)}</strong>
          <p>Raport opiera się na jednej perspektywie i jakości opisanego materiału. Niewiadome pozostają oznaczone.</p>
        </aside>
      </Surface>

      <Surface className="ctms-report-essence">
        <Kicker>KLUCZOWY WNIOSEK</Kicker>
        <p>{report.essence}</p>
      </Surface>

      <section className="ctms-report-grid">
        <ListCard title="01 · CO WIEMY" items={report.whatWeKnow} />
        <ListCard title="02 · CZEGO JESZCZE NIE WIEMY" items={report.unknowns} />
      </section>

      <Surface className="ctms-report-section">
        <div className="ctms-section-head">
          <Kicker>03 · MAPA ROZBIEŻNOŚCI</Kicker>
          <h2>Twoje rozumienie, opisane zdarzenia i niewiadome.</h2>
        </div>
        <div className="ctms-discrepancy-list">
          {report.discrepancyMap.map((row, index) => (
            <article key={`${row.userMeaning}-${index}`}>
              <div><span>Twoje rozumienie</span><p>{row.userMeaning}</p></div>
              <div><span>Opisany materiał</span><p>{row.observedMaterial}</p></div>
              <div><span>Niewiadoma</span><p>{row.unknown}</p></div>
            </article>
          ))}
        </div>
      </Surface>

      <section className="ctms-hypothesis-grid">
        <article className="ctms-hypothesis-card is-main">
          <span>04 · HIPOTEZA GŁÓWNA</span>
          <h2>{report.mainHypothesis.title}</h2>
          <p>{report.mainHypothesis.explanation}</p>
          <strong>Co ją wspiera</strong>
          <ul>{report.mainHypothesis.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
          <small>Pewność: {confidenceLabel(report.mainHypothesis.confidence)}</small>
        </article>
        <article className="ctms-hypothesis-card">
          <span>05 · KONTRHIPOTEZA</span>
          <h2>{report.counterHypothesis.title}</h2>
          <p>{report.counterHypothesis.explanation}</p>
          <strong>Granice tej wersji</strong>
          <ul>{report.counterHypothesis.limits.map((item) => <li key={item}>{item}</li>)}</ul>
          <small>Pewność: {confidenceLabel(report.counterHypothesis.confidence)}</small>
        </article>
      </section>

      <section className="ctms-report-grid">
        <ListCard title="CO WZMACNIA HIPOTEZĘ GŁÓWNĄ" items={report.evidenceFor} />
        <ListCard title="CO JĄ OSŁABIA LUB WYMAGA OSTROŻNOŚCI" items={report.evidenceAgainst} />
      </section>

      <Surface className="ctms-report-section ctms-blind-spot">
        <Kicker>06 · MOŻLIWY ŚLEPY PUNKT</Kicker>
        <h2>Nie jest oskarżeniem. Jest miejscem do sprawdzenia.</h2>
        <p>{report.blindSpot}</p>
      </Surface>

      <Surface className="ctms-burden">
        <div>
          <Kicker>07 · PROFIL OBCIĄŻENIA</Kicker>
          <h2>{report.burdenProfile.level === "overloading" ? "przeciążające" : report.burdenProfile.level === "high" ? "wysokie" : report.burdenProfile.level === "moderate" ? "umiarkowane" : "niskie"}</h2>
          <p>{report.burdenProfile.mainSource}</p>
        </div>
        <div>
          <span>Procesy, które zużywają energię</span>
          <ul>{report.burdenProfile.processes.map((item) => <li key={item}>{item}</li>)}</ul>
          <p><strong>Wpływ poza relacją:</strong> {report.burdenProfile.spillover}</p>
        </div>
      </Surface>

      <Surface className="ctms-report-section">
        <div className="ctms-section-head">
          <Kicker>08 · REJESTR GRANIC I KRYTERIÓW</Kicker>
          <h2>Punkty odniesienia dla kolejnej oceny.</h2>
        </div>
        <div className="ctms-ledger">
          {report.boundaries.map((boundary, index) => (
            <article key={`${boundary.label}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{boundary.label}</small><p>{boundary.value}</p></div>
            </article>
          ))}
        </div>
      </Surface>

      <ListCard title="09 · CO MOŻE ZMIENIĆ OCENĘ" items={report.changeConditions} />

      {report.safety.protocolAllowed ? (
        <Surface className="ctms-protocol">
          <div className="ctms-section-head">
            <Kicker>10 · PROTOKÓŁ SPRAWDZANIA RZECZYWISTOŚCI</Kicker>
            <h2>{report.recommendedProtocol.title}</h2>
            <p>{report.recommendedProtocol.hypothesis}</p>
          </div>
          <div className="ctms-protocol-action">
            <span>Działanie</span>
            <strong>{report.recommendedProtocol.action}</strong>
          </div>
          <div className="ctms-report-grid">
            <ListCard title="CZEGO NIE ROBIĆ" items={report.recommendedProtocol.dontDo} />
            <ListCard title="CO OBSERWOWAĆ" items={report.recommendedProtocol.observe} />
          </div>
          <div className="ctms-protocol-time"><span>Czas obserwacji</span><strong>{report.recommendedProtocol.durationDays} dni</strong></div>
          <p className="ctms-protocol-note">{report.recommendedProtocol.safetyNote}</p>

          {!protocolStarted ? (
            <PrimaryButton onClick={onStartProtocol} disabled={startingProtocol}>
              {startingProtocol ? "Uruchamiamy protokół…" : "Uruchom test rzeczywistości"}
            </PrimaryButton>
          ) : (
            <div className="ctms-recovery-box">
              <strong>Protokół zapisany.</strong>
              <p>Ten prywatny link pozwoli wrócić z wynikiem i zaktualizować ocenę.</p>
              <code>{recoveryUrl}</code>
              <SecondaryButton onClick={onCopyLink}>Kopiuj prywatny link</SecondaryButton>
            </div>
          )}
        </Surface>
      ) : (
        <Surface className="ctms-safety-warning">
          <Kicker>BEZPIECZEŃSTWO MA PIERWSZEŃSTWO</Kicker>
          <h2>W tej sytuacji nie uruchamiamy eksperymentu relacyjnego.</h2>
          <p>{report.safety.message}</p>
        </Surface>
      )}

      <Surface className="ctms-next-step">
        <Kicker>NAJBLIŻSZY ROZSĄDNY RUCH</Kicker>
        <h2>{report.nextMove}</h2>
        <p><strong>Termin ponownej oceny:</strong> {report.reviewAt}</p>
      </Surface>

      <Surface className="ctms-report-closing"><p>{report.closing}</p></Surface>
    </div>
  );
}
