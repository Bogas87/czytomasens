
import React from "react";
import type { ReturnCase } from "../types";
import { Kicker, PrimaryButton, SecondaryButton, Surface } from "./Layout";

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(new Date(value));
  } catch {
    return value;
  }
}

export function ReturnFlow({
  caseData,
  loading,
  onProtocolCheckin,
  onWeeklyCheckin,
  onRefresh,
  onDelete,
}: {
  caseData: ReturnCase;
  loading: boolean;
  onProtocolCheckin: (result: {
    whatHappened: string;
    initiative: string;
    repeatedPattern: string;
    userCost: string;
    unusualCircumstances: string;
  }) => Promise<void>;
  onWeeklyCheckin: (input: {
    concreteEvent: string;
    repeatedPattern: string;
    realChange: string;
    energyCost: string;
  }) => Promise<void>;
  onRefresh: () => void;
  onDelete: () => void;
}) {
  const [mode, setMode] = React.useState<"overview" | "protocol" | "weekly">("overview");
  const [protocolForm, setProtocolForm] = React.useState({
    whatHappened: "",
    initiative: "",
    repeatedPattern: "",
    userCost: "",
    unusualCircumstances: "",
  });
  const [weeklyForm, setWeeklyForm] = React.useState({
    concreteEvent: "",
    repeatedPattern: "",
    realChange: "",
    energyCost: "",
  });

  return (
    <div className="ctms-return">
      <Surface className="ctms-return-head">
        <Kicker>PRYWATNA HISTORIA RELACJI</Kicker>
        <h1>Nie zaczynasz od zera. System porównuje nowe zdarzenia z wcześniejszymi kryteriami.</h1>
        <p>
          Ostatnia aktualizacja: {formatDate(caseData.updatedAt)}. Historia nie ocenia pojedynczego dnia.
          Szuka zmian, które utrzymują się w czasie.
        </p>
      </Surface>

      {caseData.earlyWarning && caseData.earlyWarning.level !== "none" && (
        <Surface className={`ctms-early-warning level-${caseData.earlyWarning.level}`}>
          <Kicker>{caseData.earlyWarning.level === "important" ? "WAŻNY POWRÓT WZORCA" : "SYGNAŁ DO OBSERWACJI"}</Kicker>
          <h2>{caseData.earlyWarning.message}</h2>
          <ul>{caseData.earlyWarning.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
        </Surface>
      )}

      {mode === "overview" && (
        <>
          <section className="ctms-return-actions">
            {caseData.activeProtocol && (
              <button type="button" onClick={() => setMode("protocol")}>
                <span>01</span>
                <div>
                  <strong>Wróć z wynikiem protokołu</strong>
                  <p>{caseData.activeProtocol.title}</p>
                  <small>Termin: {formatDate(caseData.activeProtocol.dueAt)}</small>
                </div>
              </button>
            )}
            <button type="button" onClick={() => setMode("weekly")}>
              <span>{caseData.activeProtocol ? "02" : "01"}</span>
              <div>
                <strong>Cotygodniowy check-in</strong>
                <p>Trzy zdarzenia i koszt energii. Bez codziennego monitorowania.</p>
              </div>
            </button>
            <button type="button" onClick={onRefresh}>
              <span>{caseData.activeProtocol ? "03" : "02"}</span>
              <div>
                <strong>Odśwież historię</strong>
                <p>Pobierz najnowszy stan po innym urządzeniu lub wcześniejszym zapisie.</p>
              </div>
            </button>
          </section>

          <Surface className="ctms-history">
            <div className="ctms-section-intro compact">
              <Kicker>OŚ CZASU</Kicker>
              <h2>Co zostało zapisane i co zmieniało się po drodze.</h2>
            </div>
            <div className="ctms-timeline">
              {caseData.analyses.map((analysis) => (
                <article key={analysis.id}>
                  <time>{formatDate(analysis.createdAt)}</time>
                  <span>ANALIZA</span>
                  <h3>{analysis.report?.headline || analysis.preview?.headline || "Odczyt relacji"}</h3>
                  <p>{analysis.report?.essence || analysis.preview?.essence || "Zapisano uporządkowany stan sprawy."}</p>
                </article>
              ))}
              {caseData.checkins.map((checkin) => (
                <article key={checkin.id}>
                  <time>{formatDate(checkin.createdAt)}</time>
                  <span>{checkin.kind === "protocol" ? "WYNIK PROTOKOŁU" : "CHECK-IN"}</span>
                  <h3>{checkin.kind === "protocol" ? "Sprawdzenie hipotezy w rzeczywistości" : "Tygodniowa aktualizacja"}</h3>
                  <p>{String((checkin.result as any)?.summary || (checkin.input as any)?.concreteEvent || (checkin.input as any)?.whatHappened || "Zapisano nowe zdarzenia.")}</p>
                </article>
              ))}
            </div>
          </Surface>

          <Surface className="ctms-data-control">
            <div>
              <Kicker>KONTROLA NAD DANYMI</Kicker>
              <h2>Możesz usunąć całą historię relacji.</h2>
              <p>Usunięcie jest nieodwracalne i obejmuje analizy, granice, protokoły i check-iny.</p>
            </div>
            <SecondaryButton onClick={onDelete}>Usuń moją historię</SecondaryButton>
          </Surface>
        </>
      )}

      {mode === "protocol" && caseData.activeProtocol && (
        <Surface className="ctms-checkin-form">
          <Kicker>WYNIK TESTU RZECZYWISTOŚCI</Kicker>
          <h1>{caseData.activeProtocol.title}</h1>
          <p>Nie oceniaj całej relacji. Zapisz tylko to, co wydarzyło się w czasie testu.</p>

          <label>
            <span>Co konkretnie się wydarzyło?</span>
            <textarea value={protocolForm.whatHappened} onChange={(e) => setProtocolForm({ ...protocolForm, whatHappened: e.target.value })} rows={5} />
          </label>
          <label>
            <span>Czy druga osoba wykonała własny ruch bez przypominania?</span>
            <select value={protocolForm.initiative} onChange={(e) => setProtocolForm({ ...protocolForm, initiative: e.target.value })}>
              <option value="">Wybierz</option>
              <option value="clear">Tak, konkretnie i samodzielnie</option>
              <option value="partial">Częściowo lub dopiero po sygnale</option>
              <option value="surface">Kontakt był powierzchowny</option>
              <option value="none">Nie pojawiła się inicjatywa</option>
            </select>
          </label>
          <label>
            <span>Czy wrócił wcześniejszy schemat?</span>
            <select value={protocolForm.repeatedPattern} onChange={(e) => setProtocolForm({ ...protocolForm, repeatedPattern: e.target.value })}>
              <option value="">Wybierz</option>
              <option value="no">Nie wrócił</option>
              <option value="weaker">Wrócił słabiej</option>
              <option value="same">Wrócił podobnie</option>
              <option value="stronger">Wrócił mocniej</option>
            </select>
          </label>
          <label>
            <span>Jaki był Twój koszt w czasie obserwacji?</span>
            <textarea value={protocolForm.userCost} onChange={(e) => setProtocolForm({ ...protocolForm, userCost: e.target.value })} rows={4} />
          </label>
          <label>
            <span>Czy wydarzyło się coś nietypowego, co osłabia wartość testu?</span>
            <textarea value={protocolForm.unusualCircumstances} onChange={(e) => setProtocolForm({ ...protocolForm, unusualCircumstances: e.target.value })} rows={3} />
          </label>
          <div className="ctms-form-actions">
            <PrimaryButton
              disabled={loading || protocolForm.whatHappened.trim().length < 20 || !protocolForm.initiative || !protocolForm.repeatedPattern}
              onClick={async () => {
                await onProtocolCheckin(protocolForm);
                setMode("overview");
              }}
            >
              {loading ? "Aktualizujemy model sprawy…" : "Zapisz wynik i zaktualizuj ocenę"}
            </PrimaryButton>
            <SecondaryButton onClick={() => setMode("overview")}>Anuluj</SecondaryButton>
          </div>
        </Surface>
      )}

      {mode === "weekly" && (
        <Surface className="ctms-checkin-form">
          <Kicker>COTYGODNIOWY CHECK-IN</Kicker>
          <h1>Krótki zapis faktów, nie codzienny monitoring.</h1>
          <p>System wyda ostrzeżenie dopiero wtedy, gdy podobny mechanizm powtórzy się w kilku zapisach.</p>
          <label>
            <span>Co konkretnie wydarzyło się w tym tygodniu?</span>
            <textarea value={weeklyForm.concreteEvent} onChange={(e) => setWeeklyForm({ ...weeklyForm, concreteEvent: e.target.value })} rows={5} />
          </label>
          <label>
            <span>Co się powtórzyło?</span>
            <textarea value={weeklyForm.repeatedPattern} onChange={(e) => setWeeklyForm({ ...weeklyForm, repeatedPattern: e.target.value })} rows={4} />
          </label>
          <label>
            <span>Co realnie zmieniło się w zachowaniu?</span>
            <textarea value={weeklyForm.realChange} onChange={(e) => setWeeklyForm({ ...weeklyForm, realChange: e.target.value })} rows={4} />
          </label>
          <label>
            <span>Ile energii zajęło analizowanie, przewidywanie lub uspokajanie sytuacji?</span>
            <select value={weeklyForm.energyCost} onChange={(e) => setWeeklyForm({ ...weeklyForm, energyCost: e.target.value })}>
              <option value="">Wybierz</option>
              <option value="low">Niewiele — relacja nie dominowała tygodnia</option>
              <option value="moderate">Umiarkowanie — temat regularnie wracał</option>
              <option value="high">Dużo — wpływał na koncentrację i decyzje</option>
              <option value="overloading">Bardzo dużo — trudno było funkcjonować poza nim</option>
            </select>
          </label>
          <div className="ctms-form-actions">
            <PrimaryButton
              disabled={loading || weeklyForm.concreteEvent.trim().length < 20 || !weeklyForm.energyCost}
              onClick={async () => {
                await onWeeklyCheckin(weeklyForm);
                setMode("overview");
              }}
            >
              {loading ? "Porównujemy z historią…" : "Zapisz tygodniowy check-in"}
            </PrimaryButton>
            <SecondaryButton onClick={() => setMode("overview")}>Anuluj</SecondaryButton>
          </div>
        </Surface>
      )}
    </div>
  );
}
