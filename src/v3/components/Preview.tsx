import React from "react";
import type { BoundaryDraft, V3Preview } from "../types";
import { Kicker, PrimaryButton, Surface } from "./Layout";

function confidenceLabel(value: V3Preview["confidence"]): string {
  if (value === "high") return "wysoka";
  if (value === "medium") return "umiarkowana";
  return "ograniczona";
}

export function FreePreview({
  preview,
  onPremium,
}: {
  preview: V3Preview;
  onPremium: () => void;
}) {
  return (
    <div className="ctms-v7-free">
      <section className="ctms-v7-free-hero">
        <div>
          <Kicker>TWÓJ DARMOWY RAPORT</Kicker>
          <h1>Pierwszy wgląd.<br/><em>Więcej jasności.</em></h1>
          <p>To Twój bezpłatny raport — skrócona analiza oparta na materiale, który podałeś. Pełny raport rozwija najważniejsze wnioski i kryteria dalszego sprawdzenia.</p>
          <div className="ctms-v7-free-meta">
            <span><b>◫</b><small>Typ odczytu</small><strong>Podstawowy</strong></span>
            <span><b>◷</b><small>Pewność</small><strong>{confidenceLabel(preview.confidence)}</strong></span>
          </div>
        </div>
        <div className="ctms-v7-free-hero-art" aria-hidden="true" />
      </section>

      {preview.safety && preview.safety.level !== "clear" && (
        <Surface className="ctms-safety-warning">
          <Kicker>BEZPIECZEŃSTWO MA PIERWSZEŃSTWO</Kicker>
          <h2>{preview.safety.message}</h2>
          <ul>{preview.safety.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
        </Surface>
      )}

      <Surface className="ctms-v7-free-summary">
        <div className="ctms-v7-summary-symbol">✦</div>
        <div>
          <Kicker>PODSUMOWANIE</Kicker>
          <h2>{preview.headline}</h2>
        </div>
        <div>
          <p>{preview.essence}</p>
          <div className="ctms-v7-summary-stats">
            <span><b>♡</b><small>Główny sygnał</small><strong>{preview.observedSignal}</strong></span>
            <span><b>⚖</b><small>Pewność</small><strong>{confidenceLabel(preview.confidence)}</strong></span>
            <span><b>⌁</b><small>Kierunek</small><strong>{preview.verify}</strong></span>
          </div>
        </div>
      </Surface>

      <h2 className="ctms-v7-free-section-title">Pierwszy wgląd w Twoją sytuację</h2>
      <section className="ctms-v7-free-grid">
        <article className="free-card-a"><span>01 · ZDARZENIE</span><h3>Co się wydarzyło?</h3><p>{preview.observedSignal}</p></article>
        <article className="free-card-b"><span>02 · INTERPRETACJA</span><h3>Co to może znaczyć?</h3><p>{preview.essence}</p></article>
        <article className="free-card-c"><span>03 · NAJWIĘKSZA NIEWIADOMA</span><h3>Czego jeszcze nie wiemy?</h3><p>{preview.unknown}</p></article>
        <article className="free-card-d"><span>04 · CO SPRAWDZIĆ DALEJ</span><h3>Jakie są kolejne kroki?</h3><p>{preview.verify}</p></article>
      </section>

      <Surface className="ctms-v7-free-map">
        <div>
          <Kicker>MAPA RELACJI · PODGLĄD</Kicker>
          <h2>Gdzie jesteś dziś?</h2>
          <p>To tylko fragment obrazu. Pełny raport pokazuje zależności pomiędzy faktami, znaczeniami, niewiadomymi i możliwymi kierunkami.</p>
        </div>
        <div className="ctms-v7-map-line">
          <span><b>♡</b><small>WIĘŹ</small><strong>Do sprawdzenia</strong></span>
          <i />
          <span><b>◌</b><small>KOMUNIKACJA</small><strong>Wymaga uwagi</strong></span>
          <i />
          <span><b>◇</b><small>ZAUFANIE</small><strong>Niewiadoma</strong></span>
          <i />
          <span><b>♧</b><small>WSPÓLNY KIERUNEK</small><strong>Do doprecyzowania</strong></span>
        </div>
      </Surface>

      <Surface className="ctms-v7-free-premium">
        <div>
          <h2>Co znajdziesz w pełnym raporcie</h2>
          <PrimaryButton onClick={onPremium}>Zobacz pełny raport</PrimaryButton>
        </div>
        <span><b>▤</b><strong>Pełna analiza zdarzeń</strong><small>Kluczowe sytuacje i wzorce.</small></span>
        <span><b>⌕</b><strong>Głębsza interpretacja</strong><small>Mechanizmy wpływające na relację.</small></span>
        <span><b>♡</b><strong>Ukryte potrzeby</strong><small>Potrzeby i obawy wynikające z materiału.</small></span>
        <span><b>↗</b><strong>Rekomendacje</strong><small>Kroki dopasowane do sytuacji.</small></span>
        <span><b>◌</b><strong>Plan rozmów</strong><small>Tematy warte spokojnego sprawdzenia.</small></span>
      </Surface>

      <p className="ctms-v7-private-footer">▣ Twoja prywatność jest chroniona. Raport widzisz tylko Ty.</p>
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
