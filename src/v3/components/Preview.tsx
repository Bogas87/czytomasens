import React from "react";
import type { BoundaryDraft, V3Preview } from "../types";
import { Kicker, PrimaryButton, Surface } from "./Layout";

function confidenceLabel(value: V3Preview["confidence"]): string {
  if (value === "high") return "wysoka — kilka niezależnych elementów wskazuje podobny kierunek";
  if (value === "medium") return "umiarkowana — obraz jest spójny, ale ważna niewiadoma nadal pozostaje";
  return "ograniczona — materiał dopuszcza więcej niż jedno wyjaśnienie";
}

export function FreePreview({
  preview,
  onPremium,
}: {
  preview: V3Preview;
  onPremium: () => void;
}) {
  return (
    <div className="ctms-preview ctms-preview-prestige">
      <Surface className="ctms-preview-hero">
        <div className="ctms-preview-hero-copy">
          <Kicker>TWÓJ PIERWSZY ODCZYT</Kicker>
          <h1>Pierwszy wgląd.<br /><em>Więcej jasności.</em></h1>
          <p>
            To skrócony obraz oparty wyłącznie na materiale, który podałeś. Nie jest wyrokiem ani etykietą —
            pokazuje, co dziś wynika z opisu i czego nadal nie można rozstrzygnąć.
          </p>
          <div className="ctms-confidence">
            <span>PEWNOŚĆ ODCZYTU</span>
            <strong>{confidenceLabel(preview.confidence)}</strong>
          </div>
        </div>
        <aside className="ctms-preview-signal">
          <span>GŁÓWNY SYGNAŁ</span>
          <p>{preview.headline}</p>
        </aside>
      </Surface>

      {preview.safety && preview.safety.level !== "clear" && (
        <Surface className="ctms-safety-warning">
          <Kicker>BEZPIECZEŃSTWO MA PIERWSZEŃSTWO</Kicker>
          <h2>{preview.safety.message}</h2>
          <ul>{preview.safety.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
        </Surface>
      )}

      <Surface className="ctms-preview-essence">
        <div className="ctms-preview-essence-mark" aria-hidden="true">01</div>
        <div>
          <Kicker>SEDNO ODCZYTU</Kicker>
          <p>{preview.essence}</p>
        </div>
      </Surface>

      <section className="ctms-reading-grid ctms-reading-grid-four">
        <article>
          <span>01 · ZDARZENIE / SYGNAŁ</span>
          <h3>Co dziś widać?</h3>
          <p>{preview.observedSignal}</p>
        </article>
        <article>
          <span>02 · NAJWIĘKSZA NIEWIADOMA</span>
          <h3>Czego jeszcze nie wiemy?</h3>
          <p>{preview.unknown}</p>
        </article>
        <article className="ctms-reading-verify">
          <span>03 · CO MOŻE ZMIENIĆ OCENĘ</span>
          <h3>Co warto sprawdzić?</h3>
          <p>{preview.verify}</p>
        </article>
        <article className="ctms-reading-confidence">
          <span>04 · PEWNOŚĆ ODCZYTU</span>
          <h3>Jak mocny jest dziś wniosek?</h3>
          <p>{confidenceLabel(preview.confidence)}</p>
        </article>
      </section>

      {preview.discrepancySample.length > 0 && (
        <Surface className="ctms-discrepancy-preview">
          <div className="ctms-section-head">
            <Kicker>FRAGMENT MAPY ROZBIEŻNOŚCI</Kicker>
            <h2>To, co czujesz, i to, co można dziś potwierdzić, nie zawsze jest tym samym.</h2>
          </div>
          <div className="ctms-discrepancy-list">
            {preview.discrepancySample.slice(0, 2).map((row, index) => (
              <article key={`${row.userMeaning}-${index}`}>
                <div><span>Twoje rozumienie</span><p>{row.userMeaning}</p></div>
                <div><span>Opisany materiał</span><p>{row.observedMaterial}</p></div>
                <div><span>Niewiadoma</span><p>{row.unknown}</p></div>
              </article>
            ))}
          </div>
        </Surface>
      )}

      <Surface className="ctms-premium-offer ctms-premium-teaser">
        <div>
          <Kicker>PEŁNIEJSZY OBRAZ</Kicker>
          <h2>Ten odczyt pokazuje kierunek. Pełny raport pokazuje mechanizm, kontrhipotezę i warunki realnej zmiany.</h2>
          <p>{preview.premiumPromise}</p>
        </div>
        <div className="ctms-premium-teaser-grid">
          <span>pełna mapa rozbieżności</span>
          <span>hipoteza i kontrhipoteza</span>
          <span>możliwy ślepy punkt</span>
          <span>warunki zmiany oceny</span>
          <span>granice i kryteria</span>
          <span>protokół sprawdzenia</span>
        </div>
        <PrimaryButton onClick={onPremium}>Przejdź do pełnego raportu</PrimaryButton>
        <p className="ctms-payment-note">Pełny raport jest opcjonalny. Płatność jest jednorazowa — bez subskrypcji i automatycznych odnowień.</p>
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
    <Surface className="ctms-stage ctms-checkout">
      <div className="ctms-stage-head">
        <Kicker>PRZED PEŁNYM RAPORTEM</Kicker>
        <h1>Zapisz swoje kryteria, zanim kolejna rozmowa przesunie granicę.</h1>
        <p>Te zdania staną się punktem odniesienia przy późniejszej ocenie rzeczywistej zmiany.</p>
      </div>

      <div className="ctms-boundary-form">
        <label className="ctms-writing-field">
          <span>Co byłoby realnym dowodem poprawy?</span>
          <textarea
            value={boundaries.improvementProof}
            onChange={(event) => onBoundaries({ ...boundaries, improvementProof: event.target.value })}
            placeholder="Np. samodzielna inicjatywa i konkretne działanie utrzymane przez kilka tygodni."
            rows={4}
          />
        </label>

        <label className="ctms-writing-field">
          <span>Jakiego zachowania nie chcesz dalej normalizować?</span>
          <textarea
            value={boundaries.unacceptableBehavior}
            onChange={(event) => onBoundaries({ ...boundaries, unacceptableBehavior: event.target.value })}
            placeholder="Np. znikania po konflikcie bez powrotu do tematu."
            rows={4}
          />
        </label>

        <label className="ctms-writing-field">
          <span>Po jakim czasie uczciwie wrócisz do oceny?</span>
          <input
            value={boundaries.observationWindow}
            onChange={(event) => onBoundaries({ ...boundaries, observationWindow: event.target.value })}
            placeholder="Np. 7 dni, 3 tygodnie, miesiąc"
          />
        </label>

        <label className="ctms-writing-field">
          <span>Czego nie będziesz robić za drugą stronę?</span>
          <textarea
            value={boundaries.userCommitment}
            onChange={(event) => onBoundaries({ ...boundaries, userCommitment: event.target.value })}
            placeholder="Np. nie będę prowadzić całej rozmowy i tłumaczyć każdej ciszy."
            rows={3}
          />
        </label>
      </div>

      <div className="ctms-payment-box">
        <div className="ctms-payment-intro">
          <Kicker>PEŁNY RAPORT</Kicker>
          <h2>Raport powstaje dla tej konkretnej historii i zachowuje zapisane wyżej kryteria.</h2>
        </div>

        <label className="ctms-writing-field">
          <span>Adres e-mail do bezpiecznego linku z raportem</span>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmail(event.target.value)}
            placeholder="twoj@email.pl"
            autoComplete="email"
          />
          <small>Adres służy do dostarczenia prywatnego linku i obsługi tej usługi.</small>
        </label>

        <label className="ctms-consent">
          <input type="checkbox" checked={consent} onChange={(event) => onConsent(event.target.checked)} />
          <span>
            Zgadzam się na rozpoczęcie przygotowania indywidualnej treści cyfrowej przed upływem terminu odstąpienia
            i przyjmuję do wiadomości utratę prawa odstąpienia po rozpoczęciu realizacji.
          </span>
        </label>

        <div className="ctms-price-row">
          <div><span>Pełny raport i protokół obserwacji</span><strong>19,99 zł</strong></div>
          <p>19,99 zł jednorazowo. Bez subskrypcji, abonamentu i automatycznych odnowień.</p>
        </div>

        <PrimaryButton onClick={onBuy} disabled={!valid || saving}>
          {saving ? "Zapisujemy kryteria…" : "Kupuję pełny raport"}
        </PrimaryButton>
      </div>
    </Surface>
  );
}
