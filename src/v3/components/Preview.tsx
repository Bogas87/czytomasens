
import React from "react";
import type { BoundaryDraft, V3Preview } from "../types";
import { Kicker, PrimaryButton, Surface } from "./Layout";

function confidenceLabel(value: V3Preview["confidence"]): string {
  if (value === "high") return "wysoka — kilka niezależnych elementów wskazuje ten sam wzór";
  if (value === "medium") return "umiarkowana — obraz jest spójny, ale wymaga sprawdzenia jednej niewiadomej";
  return "ograniczona — materiał nadal dopuszcza kilka różnych wyjaśnień";
}

export function FreePreview({
  preview,
  onPremium,
}: {
  preview: V3Preview;
  onPremium: () => void;
}) {
  return (
    <div className="v3-preview-stack">
      <Surface className="v3-preview-hero">
        <Kicker>PIERWSZY ODCZYT</Kicker>
        <h1>{preview.headline}</h1>
        <p>{preview.essence}</p>
        <div className="v3-confidence">
          <span>Pewność tego odczytu</span>
          <strong>{confidenceLabel(preview.confidence)}</strong>
        </div>
      </Surface>

      {preview.safety?.level !== "clear" && (
        <Surface className="v3-safety-warning">
          <Kicker>BEZPIECZEŃSTWO MA PIERWSZEŃSTWO</Kicker>
          <h2>{preview.safety.message}</h2>
          <ul>{preview.safety.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
        </Surface>
      )}

      <section className="v3-preview-grid">
        <article>
          <span>CO WYNIKA Z OPISANYCH ZDARZEŃ</span>
          <p>{preview.observedSignal}</p>
        </article>
        <article>
          <span>CZEGO NADAL NIE WIEMY</span>
          <p>{preview.unknown}</p>
        </article>
        <article className="v3-preview-verify">
          <span>CO NALEŻY SPRAWDZIĆ</span>
          <p>{preview.verify}</p>
        </article>
      </section>

      {preview.discrepancySample.length > 0 && (
        <Surface className="v3-discrepancy-preview">
          <div className="v3-section-intro compact">
            <Kicker>FRAGMENT MAPY ROZBIEŻNOŚCI</Kicker>
            <h2>Znaczenie, materiał i niewiedza nie zawsze mówią to samo.</h2>
          </div>
          <div className="v3-discrepancy-head">
            <span>Twoje rozumienie</span>
            <span>Co wynika z materiału</span>
            <span>Czego nie da się ustalić</span>
          </div>
          {preview.discrepancySample.slice(0, 2).map((row, index) => (
            <div className="v3-discrepancy-row" key={`${row.userMeaning}-${index}`}>
              <p>{row.userMeaning}</p>
              <p>{row.observedMaterial}</p>
              <p>{row.unknown}</p>
            </div>
          ))}
        </Surface>
      )}

      <Surface className="v3-premium-offer">
        <div>
          <Kicker>PEŁNY RAPORT NIE JEST DŁUŻSZĄ WERSJĄ TEGO TEKSTU</Kicker>
          <h2>Kończy analizę decyzją, kryterium i sposobem sprawdzenia jej w rzeczywistości.</h2>
          <p>{preview.premiumPromise}</p>
        </div>
        <ul>
          <li>Mapa Rozbieżności: znaczenie, fakty i obszar niewiedzy</li>
          <li>Hipoteza główna oraz najlepsza kontrhipoteza</li>
          <li>Ślepy punkt i Profil Obciążenia Relacją</li>
          <li>Rejestr Granic oraz kryterium realnej poprawy</li>
          <li>Bezpieczny Protokół Testowania Rzeczywistości</li>
          <li>Termin powrotu i aktualizacja oceny po wyniku testu</li>
        </ul>
        <PrimaryButton onClick={onPremium}>Przejdź do pełnej analizy</PrimaryButton>
      </Surface>
    </div>
  );
}

export function CheckoutPanel({
  boundaries,
  email,
  consent,
  saving,
  onBoundaries,
  onEmail,
  onConsent,
  onBuy,
}: {
  boundaries: BoundaryDraft;
  email: string;
  consent: boolean;
  saving: boolean;
  onBoundaries: (value: BoundaryDraft) => void;
  onEmail: (value: string) => void;
  onConsent: (value: boolean) => void;
  onBuy: () => void;
}) {
  const valid = email.includes("@")
    && boundaries.improvementProof.trim().length >= 10
    && boundaries.unacceptableBehavior.trim().length >= 10
    && boundaries.observationWindow.trim().length >= 2
    && consent;

  return (
    <Surface className="v3-checkout">
      <div className="v3-section-intro">
        <Kicker>REJESTR GRANIC I KRYTERIÓW</Kicker>
        <h1>Zapisz kryteria zanim emocje albo kolejna dobra rozmowa zmienią ich znaczenie.</h1>
        <p>
          Te zdania wrócą przy ponownej ocenie. System pokaże, czy kryterium zostało spełnione,
          świadomie zmienione czy przesunięte dopiero po kolejnym rozczarowaniu.
        </p>
      </div>

      <div className="v3-boundary-form">
        <label>
          <span>Co byłoby dla Ciebie realnym dowodem poprawy?</span>
          <textarea
            value={boundaries.improvementProof}
            onChange={(event) => onBoundaries({ ...boundaries, improvementProof: event.target.value })}
            placeholder="Np. samodzielna inicjatywa i konkretne działanie utrzymane przez kilka tygodni, bez mojego przypominania."
            rows={4}
          />
        </label>
        <label>
          <span>Jakiego zachowania nie chcesz już dalej normalizować?</span>
          <textarea
            value={boundaries.unacceptableBehavior}
            onChange={(event) => onBoundaries({ ...boundaries, unacceptableBehavior: event.target.value })}
            placeholder="Np. znikania po konflikcie bez powrotu do tematu albo kolejnych obietnic bez działania."
            rows={4}
          />
        </label>
        <label>
          <span>Po jakim czasie uczciwie wrócisz do oceny?</span>
          <input
            value={boundaries.observationWindow}
            onChange={(event) => onBoundaries({ ...boundaries, observationWindow: event.target.value })}
            placeholder="Np. 7 dni, 3 tygodnie, miesiąc"
          />
        </label>
        <label>
          <span>Czego Ty nie będziesz robić za drugą stronę?</span>
          <textarea
            value={boundaries.userCommitment}
            onChange={(event) => onBoundaries({ ...boundaries, userCommitment: event.target.value })}
            placeholder="Np. nie będę kolejny raz prowadzić całej rozmowy, przypominać i tłumaczyć każdej ciszy."
            rows={3}
          />
        </label>
      </div>

      <div className="v3-payment-box">
        <label>
          <span>Adres e-mail do bezpiecznego linku z raportem</span>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmail(event.target.value)}
            placeholder="twoj@email.pl"
            autoComplete="email"
          />
        </label>
        <label className="v3-consent">
          <input type="checkbox" checked={consent} onChange={(event) => onConsent(event.target.checked)} />
          <span>
            Wyrażam zgodę na rozpoczęcie przygotowania indywidualnej treści cyfrowej przed upływem
            terminu odstąpienia i przyjmuję do wiadomości utratę prawa odstąpienia po rozpoczęciu realizacji.
          </span>
        </label>
        <div className="v3-price">
          <div><span>Pełny raport + test rzeczywistości</span><strong>19,99 zł</strong></div>
          <small>Płatność jednorazowa. Powrót z wynikiem protokołu zapisuje się w prywatnej historii.</small>
        </div>
        <PrimaryButton onClick={onBuy} disabled={!valid || saving}>
          {saving ? "Zapisujemy kryteria…" : "Kupuję pełną analizę"}
        </PrimaryButton>
      </div>
    </Surface>
  );
}
