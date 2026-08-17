import React from "react";
import type { V3FullReport } from "../types";
import { Kicker, PrimaryButton, SecondaryButton, Surface } from "./Layout";

function confidenceLabel(value: V3FullReport["confidence"]): string {
  if (value === "high") return "wysoka";
  if (value === "medium") return "umiarkowana";
  return "ograniczona";
}

function List({ items }: { items: string[] }) {
  return <ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
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
    <div className="ctms-v9-report">
      <section className="ctms-v9-report-hero">
        <div>
          <Kicker>TWÓJ PEŁNY RAPORT</Kicker>
          <h1>{report.headline}</h1>
          <p>{report.subheadline}</p>
          <div className="ctms-v9-report-meta">
            <span><small>PEWNOŚĆ ODCZYTU</small><strong>{confidenceLabel(report.confidence)}</strong></span>
            <span><small>ŹRÓDŁO</small><strong>Twoja perspektywa</strong></span>
            <span><small>STATUS</small><strong>niewiadome pozostają oznaczone</strong></span>
          </div>
        </div>
        <div className="ctms-v9-report-photo" aria-hidden="true" />
      </section>

      <section className="ctms-v9-report-thesis">
        <span className="ctms-v9-report-number">01</span>
        <div>
          <Kicker>KLUCZOWY WNIOSEK</Kicker>
          <h2>{report.essence}</h2>
        </div>
        <aside>
          <span>PEWNOŚĆ</span>
          <strong>{confidenceLabel(report.confidence)}</strong>
          <p>To siła obecnego odczytu, nie ocena relacji ani człowieka.</p>
        </aside>
      </section>

      <section className="ctms-v9-report-two">
        <article>
          <Kicker>02 · CO DZIŚ WIEMY</Kicker>
          <h2>Materiał, który da się oprzeć na Twoim opisie.</h2>
          <List items={report.whatWeKnow} />
        </article>
        <article>
          <Kicker>03 · CZEGO JESZCZE NIE WIEMY</Kicker>
          <h2>Miejsca, w których uczciwa odpowiedź brzmi: „to nadal wymaga danych”.</h2>
          <List items={report.unknowns} />
        </article>
      </section>

      <section className="ctms-v9-report-discrepancy">
        <div className="ctms-v9-report-section-head">
          <div>
            <Kicker>04 · MAPA ROZBIEŻNOŚCI</Kicker>
            <h2>To, co znaczenie mówi o sytuacji, i to, co pokazuje materiał, nie zawsze jest tym samym.</h2>
          </div>
          <p>Nie rozstrzygamy intencji. Pokazujemy różnicę pomiędzy wnioskiem, obserwacją i niewiadomą.</p>
        </div>
        <div className="ctms-v9-discrepancy-list">
          {report.discrepancyMap.map((row, index) => (
            <article key={`${row.userMeaning}-${index}`}>
              <span className="ctms-v9-discrepancy-no">{String(index + 1).padStart(2, "0")}</span>
              <div><small>TWOJE ZNACZENIE</small><p>{row.userMeaning}</p></div>
              <div><small>OPISANY MATERIAŁ</small><p>{row.observedMaterial}</p></div>
              <div><small>NIEWIADOMA</small><p>{row.unknown}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="ctms-v9-report-hypotheses">
        <article className="is-main">
          <Kicker>05 · HIPOTEZA GŁÓWNA</Kicker>
          <h2>{report.mainHypothesis.title}</h2>
          <p>{report.mainHypothesis.explanation}</p>
          <strong>Co ją wspiera</strong>
          <List items={report.mainHypothesis.evidence} />
          <small>Pewność: {confidenceLabel(report.mainHypothesis.confidence)}</small>
        </article>

        <div className="ctms-v9-hypothesis-axis" aria-hidden="true">
          <span>HIPOTEZA</span><i /><b>≠</b><i /><span>FAKT</span>
        </div>

        <article>
          <Kicker>06 · KONTRHIPOTEZA</Kicker>
          <h2>{report.counterHypothesis.title}</h2>
          <p>{report.counterHypothesis.explanation}</p>
          <strong>Co ogranicza tę wersję</strong>
          <List items={report.counterHypothesis.limits} />
          <small>Pewność: {confidenceLabel(report.counterHypothesis.confidence)}</small>
        </article>
      </section>

      <section className="ctms-v9-report-evidence">
        <article>
          <Kicker>07 · CO WZMACNIA OBECNY ODCZYT</Kicker>
          <List items={report.evidenceFor} />
        </article>
        <article>
          <Kicker>08 · CO GO OSŁABIA</Kicker>
          <List items={report.evidenceAgainst} />
        </article>
        <article className="ctms-v9-blind">
          <Kicker>09 · MOŻLIWY ŚLEPY PUNKT</Kicker>
          <h2>Nie oskarżenie. Miejsce, które warto sprawdzić.</h2>
          <p>{report.blindSpot}</p>
        </article>
      </section>

      <section className="ctms-v9-report-burden">
        <div>
          <Kicker>10 · KOSZT TEJ DYNAMIKI</Kicker>
          <h2>{report.burdenProfile.level === "overloading" ? "Przeciążający" : report.burdenProfile.level === "high" ? "Wysoki" : report.burdenProfile.level === "moderate" ? "Umiarkowany" : "Niski"}</h2>
          <p>{report.burdenProfile.mainSource}</p>
        </div>
        <div>
          <span>CO ZABIERA ENERGIĘ</span>
          <List items={report.burdenProfile.processes} />
          <p><strong>Wpływ poza relacją:</strong> {report.burdenProfile.spillover}</p>
        </div>
      </section>

      <section className="ctms-v9-report-boundaries">
        <div className="ctms-v9-report-section-head">
          <div><Kicker>11 · GRANICE I KRYTERIA</Kicker><h2>Punkty odniesienia przed kolejną oceną.</h2></div>
          <p>Te kryteria chronią przed przesuwaniem poprzeczki pod wpływem pojedynczego dobrego lub złego dnia.</p>
        </div>
        <div className="ctms-v9-boundary-grid">
          {report.boundaries.map((boundary, index) => (
            <article key={`${boundary.label}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <small>{boundary.label}</small>
              <p>{boundary.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ctms-v9-report-change">
        <Kicker>12 · CO MOŻE ZMIENIĆ OCENĘ</Kicker>
        <h2>Nie szukaj potwierdzenia. Szukaj danych, które mogą zarówno wzmocnić, jak i osłabić obecny wniosek.</h2>
        <List items={report.changeConditions} />
      </section>

      {report.safety.protocolAllowed ? (
        <section className="ctms-v9-report-protocol">
          <div>
            <Kicker>13 · SPRAWDZENIE W RZECZYWISTOŚCI</Kicker>
            <h2>{report.recommendedProtocol.title}</h2>
            <p>{report.recommendedProtocol.hypothesis}</p>
          </div>
          <div className="ctms-v9-protocol-detail">
            <span>DZIAŁANIE</span>
            <strong>{report.recommendedProtocol.action}</strong>
            <div className="ctms-v9-protocol-columns">
              <div><small>CZEGO NIE ROBIĆ</small><List items={report.recommendedProtocol.dontDo} /></div>
              <div><small>CO OBSERWOWAĆ</small><List items={report.recommendedProtocol.observe} /></div>
            </div>
            <p><b>Czas obserwacji:</b> {report.recommendedProtocol.durationDays} dni</p>
            <p>{report.recommendedProtocol.safetyNote}</p>
          </div>

          {!protocolStarted ? (
            <PrimaryButton onClick={onStartProtocol} disabled={startingProtocol}>
              {startingProtocol ? "Uruchamiamy sprawdzenie…" : "Uruchom sprawdzenie"}
            </PrimaryButton>
          ) : (
            <div className="ctms-recovery-box">
              <strong>Sprawdzenie zapisane.</strong>
              <p>Ten prywatny link pozwoli wrócić z wynikiem i zaktualizować ocenę.</p>
              <code>{recoveryUrl}</code>
              <SecondaryButton onClick={onCopyLink}>Kopiuj prywatny link</SecondaryButton>
            </div>
          )}
        </section>
      ) : (
        <Surface className="ctms-safety-warning">
          <Kicker>BEZPIECZEŃSTWO MA PIERWSZEŃSTWO</Kicker>
          <h2>W tej sytuacji nie uruchamiamy wspólnego eksperymentu.</h2>
          <p>{report.safety.message}</p>
        </Surface>
      )}

      <section className="ctms-v9-report-final">
        <div>
          <Kicker>NAJBLIŻSZY ROZSĄDNY RUCH</Kicker>
          <h2>{report.nextMove}</h2>
          <p><strong>Termin ponownej oceny:</strong> {report.reviewAt}</p>
        </div>
        <blockquote>{report.closing}</blockquote>
        <div className="ctms-v9-report-final-art" aria-hidden="true" />
      </section>
    </div>
  );
}
