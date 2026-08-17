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
    <div className="ctms-v9-free">
      <section className="ctms-v9-free-hero">
        <div className="ctms-v9-free-copy">
          <Kicker>TWÓJ PIERWSZY ODCZYT</Kicker>
          <h1>Pierwszy wgląd.<br/><em>Więcej jasności.</em></h1>
          <p>To nie jest ocena relacji. To pierwszy uporządkowany obraz materiału, który podałeś: co dziś wygląda na istotne, co może mieć inne wyjaśnienie i czego nadal nie wiadomo.</p>
          <div className="ctms-v9-free-meta">
            <span><small>PEWNOŚĆ</small><strong>{confidenceLabel(preview.confidence)}</strong></span>
            <span><small>CHARAKTER</small><strong>pierwszy odczyt</strong></span>
          </div>
        </div>
        <div className="ctms-v9-free-photo" aria-hidden="true" />
      </section>

      {preview.safety && preview.safety.level !== "clear" && (
        <Surface className="ctms-safety-warning">
          <Kicker>BEZPIECZEŃSTWO MA PIERWSZEŃSTWO</Kicker>
          <h2>{preview.safety.message}</h2>
          <ul>{preview.safety.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
        </Surface>
      )}

      <section className="ctms-v9-free-lead">
        <div className="ctms-v9-free-mark">✦</div>
        <div>
          <Kicker>SEDNO ODCZYTU</Kicker>
          <h2>{preview.headline}</h2>
        </div>
        <p>{preview.essence}</p>
      </section>

      <section className="ctms-v9-free-dossier">
        <article>
          <span>01 · ZDARZENIE / SYGNAŁ</span>
          <h3>Co dziś widać?</h3>
          <p>{preview.observedSignal}</p>
        </article>
        <article>
          <span>02 · ALTERNATYWNE ZNACZENIE</span>
          <h3>Co jeszcze może to wyjaśniać?</h3>
          <p>{preview.essence}</p>
        </article>
        <article>
          <span>03 · NAJWIĘKSZA NIEWIADOMA</span>
          <h3>Czego jeszcze nie wiemy?</h3>
          <p>{preview.unknown}</p>
        </article>
        <article>
          <span>04 · KRYTERIUM SPRAWDZENIA</span>
          <h3>Co może zmienić ocenę?</h3>
          <p>{preview.verify}</p>
        </article>
      </section>

      {preview.discrepancySample.length > 0 && (
        <section className="ctms-v9-free-reality">
          <div>
            <Kicker>RÓŻNICA MIĘDZY ODCZUCIEM A MATERIAŁEM</Kicker>
            <h2>Najważniejsze jest nie to, co brzmi przekonująco, ale to, co da się dziś podeprzeć opisem.</h2>
          </div>
          <div className="ctms-v9-free-reality-list">
            {preview.discrepancySample.slice(0, 2).map((row, index) => (
              <article key={`${row.userMeaning}-${index}`}>
                <div><span>Twoje znaczenie</span><p>{row.userMeaning}</p></div>
                <div><span>Materiał</span><p>{row.observedMaterial}</p></div>
                <div><span>Nadal nie wiadomo</span><p>{row.unknown}</p></div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="ctms-v9-free-next">
        <div className="ctms-v9-free-next-copy">
          <Kicker>PEŁNY RAPORT</Kicker>
          <h2>Pełny odczyt nie dodaje „więcej tekstu”. Dodaje strukturę, kontrhipotezę i konkretne warunki sprawdzenia.</h2>
          <p>{preview.premiumPromise}</p>
        </div>
        <div className="ctms-v9-free-next-grid">
          <span>pełna mapa rozbieżności</span>
          <span>hipoteza główna i kontrhipoteza</span>
          <span>możliwy ślepy punkt</span>
          <span>warunki zmiany oceny</span>
          <span>granice i kryteria</span>
          <span>sprawdzenie w rzeczywistości</span>
        </div>
        <PrimaryButton onClick={onPremium}>Zobacz pełny raport</PrimaryButton>
        <small>Opcjonalnie. Jednorazowa płatność, bez subskrypcji i automatycznych odnowień.</small>
      </section>

      <p className="ctms-v9-private-footer">▣ Ten odczyt jest prywatny. Surowe odpowiedzi nie są publikowane ani pokazywane innym osobom.</p>
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
