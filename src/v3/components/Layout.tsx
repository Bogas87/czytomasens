import React from "react";

export function Shell({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="ctms-shell">
      <div className="ctms-ambient" aria-hidden="true" />
      <header className="ctms-header">
        <a className="ctms-brand" href="/" aria-label="CzyToMaSens — strona główna">
          CzyToMaSens<span>.</span>
        </a>

        {onBack ? (
          <button className="ctms-back" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> Wróć
          </button>
        ) : (
          <div className="ctms-header-right">
            <nav className="ctms-header-nav" aria-label="Nawigacja główna">
              <a href="/#jak-dziala">Jak działa</a>
              <a href="/#raport">Raport</a>
              <a href="/artykuly">Poradniki</a>
            </nav>
            <span className="ctms-header-trust">Prywatnie · bez konta</span>
          </div>
        )}
      </header>

      <main className="ctms-main">{children}</main>

      <footer className="ctms-footer">
        <div className="ctms-footer-brand">
          <a className="ctms-brand ctms-brand-footer" href="/">CzyToMaSens<span>.</span></a>
          <p>Narzędzie do porządkowania własnej perspektywy. Nie zastępuje terapii, diagnozy ani pomocy kryzysowej.</p>
        </div>
        <nav aria-label="Dokumenty i informacje">
          <a href="/artykuly">Poradniki</a>
          <a href="/regulamin">Regulamin</a>
          <a href="/polityka-prywatnosci">Prywatność</a>
          <a href="/kontakt">Kontakt</a>
        </nav>
        <span className="ctms-footer-copy">© {new Date().getFullYear()} CzyToMaSens</span>
      </footer>
    </div>
  );
}

export function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`ctms-surface ${className}`.trim()}>{children}</section>;
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="ctms-kicker">{children}</div>;
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button className="ctms-button ctms-button-primary" type={type} onClick={onClick} disabled={disabled}>
      <span>{children}</span>
      <span className="ctms-button-arrow" aria-hidden="true">→</span>
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button className="ctms-button ctms-button-secondary" type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Progress({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  const safeTotal = Math.max(total, 1);
  const value = Math.max(0, Math.min(current, safeTotal));
  return (
    <div className="ctms-progress" aria-label={`${label}: ${value} z ${safeTotal}`}>
      <div className="ctms-progress-copy">
        <span>{label}</span>
        <strong>{String(value).padStart(2, "0")} / {String(safeTotal).padStart(2, "0")}</strong>
      </div>
      <div className="ctms-progress-track" aria-hidden="true">
        <span style={{ width: `${(value / safeTotal) * 100}%` }} />
      </div>
    </div>
  );
}

export function LoadingPanel({
  title,
  lines,
  expectedText = "Porządkujemy odpowiedzi. Ten etap zwykle kończy się po kilku sekundach.",
}: {
  title: string;
  lines: string[];
  expectedText?: string;
}) {
  const [index, setIndex] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const lineTimer = window.setInterval(
      () => setIndex((value) => (value + 1) % Math.max(lines.length, 1)),
      1800,
    );
    const seconds = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => {
      window.clearInterval(lineTimer);
      window.clearInterval(seconds);
    };
  }, [lines.length]);

  return (
    <Surface className="ctms-loading">
      <div className="ctms-loader" aria-hidden="true"><span /><span /><span /></div>
      <Kicker>PRZYGOTOWANIE ODCZYTU</Kicker>
      <h1>{title}</h1>
      <p className="ctms-loading-line" aria-live="polite">{lines[index] || "Porządkujemy materiał."}</p>
      <div className="ctms-loading-meta">
        <span>{expectedText}</span>
        <strong>{elapsed} s</strong>
      </div>
    </Surface>
  );
}
