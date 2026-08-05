
import React from "react";

export function Shell({
  children,
  onBack,
  backLabel = "Powrót",
}: {
  children: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <div className="v3-shell">
      <div className="v3-ambient" aria-hidden="true" />
      <header className="v3-topbar">
        <a className="v3-brand" href="/" aria-label="CzyToMaSens — strona główna">
          <span className="v3-brand-dot" />
          <span className="v3-brand-name">CzyToMaSens<span>.</span></span>
          <small>analiza rzeczywistości relacyjnej</small>
        </a>
        {onBack && (
          <button className="v3-back" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span>
            <span>{backLabel}</span>
          </button>
        )}
      </header>
      <main className="v3-main">{children}</main>
      <footer className="v3-footer">
        <span>CzyToMaSens nie diagnozuje drugiej osoby.</span>
        <nav>
          <a href="/regulamin">Regulamin</a>
          <a href="/polityka-prywatnosci">Prywatność</a>
          <a href="/kontakt">Kontakt</a>
        </nav>
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
  return <section className={`v3-surface ${className}`.trim()}>{children}</section>;
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="v3-kicker">{children}</div>;
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button className="v3-button v3-button-primary" type={type} onClick={onClick} disabled={disabled}>
      <span>{children}</span>
      <span aria-hidden="true">→</span>
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button className="v3-button v3-button-secondary" type={type} onClick={onClick} disabled={disabled}>
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
  const percent = total > 0 ? Math.max(0, Math.min(100, (current / total) * 100)) : 0;
  return (
    <div className="v3-progress" aria-label={`${label}: ${current} z ${total}`}>
      <div>
        <span>{label}</span>
        <strong>{current} / {total}</strong>
      </div>
      <div className="v3-progress-track"><div style={{ width: `${percent}%` }} /></div>
    </div>
  );
}

export function LoadingPanel({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % lines.length), 1800);
    return () => window.clearInterval(timer);
  }, [lines.length]);
  return (
    <Surface className="v3-loading">
      <div className="v3-loading-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <Kicker>PORZĄDKOWANIE MATERIAŁU</Kicker>
      <h1>{title}</h1>
      <p>{lines[index]}</p>
      <div className="v3-loading-line"><span /></div>
    </Surface>
  );
}
