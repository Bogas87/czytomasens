
import React from "react";
import type { V3FullReport } from "../types";
import { Kicker, PrimaryButton, SecondaryButton, Surface } from "./Layout";

function confidenceLabel(value: V3FullReport["confidence"]): string {
  if (value === "high") return "wysoka";
  if (value === "medium") return "umiarkowana";
  return "ograniczona";
}

function ListBlock({
  title,
  items,
  tone = "normal",
}: {
  title: string;
  items: string[];
  tone?: "normal" | "gold" | "danger";
}) {
  return (
    <article className={`v3-report-block tone-${tone}`}>
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
    <div className="v3-report">
      <Surface className="v3-report-cover">
        <div>
          <Kicker>PEŁNY RAPORT — MODEL 6 WARSTW</Kicker>
          <h1>{report.headline}</h1>
          <p>{report.subheadline}</p>
        </div>
        <div className="v3-report-meta">
          <span>Pewność</span>
          <strong>{confidenceLabel(report.confidence)}</strong>
          <small>Jedna perspektywa. Wnioski zależą od jakości i kompletności opisanego materiału.</small>
        </div>
      </Surface>

      <Surface className="v3-report-essence">
        <Kicker>SEDNO</Kicker>
        <blockquote>{report.essence}</blockquote>
      </Surface>

      <section className="v3-report-two">
        <ListBlock title="CO WIEMY" items={report.whatWeKnow} tone="gold" />
        <ListBlock title="CZEGO JESZCZE NIE WIEMY" items={report.unknowns} />
      </section>

      <Surface className="v3-discrepancy-map">
        <div className="v3-section-intro compact">
          <Kicker>MAPA ROZBIEŻNOŚCI</Kicker>
          <h2>To, co rozumiesz, to, co opisujesz i to, czego nie da się jeszcze ustalić.</h2>
        </div>
        <div className="v3-discrepancy-head">
          <span>Twoje rozumienie</span>
          <span>Co wynika z opisanych zdarzeń</span>
          <span>Czego nadal nie da się ustalić</span>
        </div>
        {report.discrepancyMap.map((row, index) => (
          <div className={`v3-discrepancy-row importance-${row.importance}`} key={`${row.userMeaning}-${index}`}>
            <p>{row.userMeaning}</p>
            <p>{row.observedMaterial}</p>
            <p>{row.unknown}</p>
          </div>
        ))}
      </Surface>

      <section className="v3-hypotheses">
        <article className="v3-hypothesis main">
          <span>HIPOTEZA GŁÓWNA</span>
          <h2>{report.mainHypothesis.title}</h2>
          <p>{report.mainHypothesis.explanation}</p>
          <div>
            <strong>Co ją wspiera</strong>
            <ul>{report.mainHypothesis.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <small>Pewność: {confidenceLabel(report.mainHypothesis.confidence)}</small>
        </article>
        <article className="v3-hypothesis counter">
          <span>KONTRHIPOTEZA</span>
          <h2>{report.counterHypothesis.title}</h2>
          <p>{report.counterHypothesis.explanation}</p>
          <div>
            <strong>Granice tej wersji</strong>
            <ul>{report.counterHypothesis.limits.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <small>Pewność: {confidenceLabel(report.counterHypothesis.confidence)}</small>
        </article>
      </section>

      <section className="v3-report-two">
        <ListBlock title="CO WZMACNIA HIPOTEZĘ GŁÓWNĄ" items={report.evidenceFor} tone="gold" />
        <ListBlock title="CO JĄ OSŁABIA LUB WYMAGA OSTROŻNOŚCI" items={report.evidenceAgainst} />
      </section>

      <Surface className="v3-blind-spot">
        <Kicker>MOŻLIWY ŚLEPY PUNKT</Kicker>
        <h2>Nie jest oskarżeniem. Jest miejscem do sprawdzenia.</h2>
        <p>{report.blindSpot}</p>
      </Surface>

      <Surface className="v3-burden-report">
        <div className="v3-burden-level">
          <Kicker>PROFIL OBCIĄŻENIA RELACJĄ</Kicker>
          <strong>{report.burdenProfile.level === "overloading" ? "przeciążające" : report.burdenProfile.level === "high" ? "wysokie" : report.burdenProfile.level === "moderate" ? "umiarkowane" : "niskie"}</strong>
          <p>{report.burdenProfile.mainSource}</p>
        </div>
        <div>
          <span>PROCESY, KTÓRE ZJADAJĄ ENERGIĘ</span>
          <ul>{report.burdenProfile.processes.map((item) => <li key={item}>{item}</li>)}</ul>
          <p className="v3-burden-spillover"><strong>Wpływ poza relacją:</strong> {report.burdenProfile.spillover}</p>
        </div>
      </Surface>

      <Surface className="v3-boundaries-report">
        <div className="v3-section-intro compact">
          <Kicker>REJESTR GRANIC I KRYTERIÓW</Kicker>
          <h2>Te zdania są punktem odniesienia dla kolejnej oceny.</h2>
        </div>
        <div className="v3-boundary-ledger">
          {report.boundaries.map((boundary, index) => (
            <article key={`${boundary.label}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{boundary.label}</small><p>{boundary.value}</p></div>
            </article>
          ))}
        </div>
      </Surface>

      <ListBlock title="CO MOŻE ZMIENIĆ OCENĘ" items={report.changeConditions} tone="gold" />

      {report.safety.protocolAllowed ? (
        <Surface className="v3-protocol">
          <div className="v3-protocol-head">
            <Kicker>PROTOKÓŁ TESTOWANIA RZECZYWISTOŚCI</Kicker>
            <h2>{report.recommendedProtocol.title}</h2>
            <p>{report.recommendedProtocol.hypothesis}</p>
          </div>
          <div className="v3-protocol-action">
            <span>DZIAŁANIE</span>
            <strong>{report.recommendedProtocol.action}</strong>
          </div>
          <div className="v3-protocol-grid">
            <div>
              <span>CZEGO NIE ROBIĆ</span>
              <ul>{report.recommendedProtocol.dontDo.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <span>CO OBSERWOWAĆ</span>
              <ul>{report.recommendedProtocol.observe.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          <div className="v3-protocol-time">
            <span>Czas obserwacji</span>
            <strong>{report.recommendedProtocol.durationDays} dni</strong>
          </div>
          <p className="v3-protocol-safety">{report.recommendedProtocol.safetyNote}</p>

          {!protocolStarted ? (
            <PrimaryButton onClick={onStartProtocol} disabled={startingProtocol}>
              {startingProtocol ? "Uruchamiamy protokół…" : "Uruchom mój test rzeczywistości"}
            </PrimaryButton>
          ) : (
            <div className="v3-recovery-box">
              <strong>Protokół zapisany.</strong>
              <p>Ten prywatny link pozwoli wrócić z wynikiem i zaktualizować ocenę.</p>
              <code>{recoveryUrl}</code>
              <SecondaryButton onClick={onCopyLink}>Kopiuj prywatny link</SecondaryButton>
            </div>
          )}
        </Surface>
      ) : (
        <Surface className="v3-safety-stop">
          <Kicker>BEZPIECZEŃSTWO MA PIERWSZEŃSTWO</Kicker>
          <h2>W tej sytuacji nie uruchamiamy eksperymentu relacyjnego.</h2>
          <p>{report.safety.message}</p>
          <small>Raport nadal porządkuje materiał, ale nie zaleca ciszy, konfrontacji ani testowania reakcji drugiej osoby.</small>
        </Surface>
      )}

      <Surface className="v3-next-move">
        <Kicker>NAJBLIŻSZY ROZSĄDNY RUCH</Kicker>
        <h2>{report.nextMove}</h2>
        <p><strong>Termin ponownej oceny:</strong> {report.reviewAt}</p>
      </Surface>

      <Surface className="v3-report-closing">
        <p>{report.closing}</p>
      </Surface>
    </div>
  );
}
