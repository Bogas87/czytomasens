import React, { useState } from "react";

type Screen = "landing" | "consent" | "questions" | "preview";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [consent, setConsent] = useState(false);
  const [sessionError, setSessionError] = useState("");

  const startSession = async () => {
    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
      });

      if (!res.ok) throw new Error("fail");

      setScreen("questions");
    } catch (e) {
      setSessionError("Nie udało się rozpocząć sesji.");
    }
  };

  return (
    <div style={styles.wrapper}>
      {screen === "landing" && (
        <div style={styles.hero}>
          <div style={styles.logo}>CzyToMaSens</div>

          <h1 style={styles.title}>
            Coś Ci tu nie gra.
            <br />
            Tylko jeszcze nie wiesz co.
          </h1>

          <p style={styles.subtitle}>
            To nie jest test.
            <br />
            To jest moment, w którym przestajesz się oszukiwać.
          </p>

          <button
            style={styles.button}
            onClick={() => setScreen("consent")}
          >
            Sprawdź to
          </button>
        </div>
      )}

      {screen === "consent" && (
        <div style={styles.card}>
          <h2 style={styles.titleSmall}>Zanim wejdziesz dalej</h2>

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            To narzędzie analizuje mechanizmy, nie daje wyroków
          </label>

          <button
            style={styles.button}
            disabled={!consent}
            onClick={startSession}
          >
            Wchodzę dalej
          </button>

          {sessionError && (
            <p style={{ color: "red" }}>{sessionError}</p>
          )}
        </div>
      )}

      {screen === "questions" && (
        <div style={styles.card}>
          <h2>Na początek...</h2>

          <p>
            Dlaczego w ogóle się nad tym zastanawiasz?
          </p>

          <textarea style={styles.textarea} />

          <button
            style={styles.button}
            onClick={() => setScreen("preview")}
          >
            Analizuj
          </button>
        </div>
      )}

      {screen === "preview" && (
        <div style={styles.card}>
          <h2>Fragment analizy</h2>

          <p>
            W Twoim opisie pojawia się napięcie między tym,
            co czujesz, a tym, co próbujesz sobie tłumaczyć.
          </p>

          <p>
            To często oznacza, że widzisz więcej niż chcesz przyznać.
          </p>

          <div style={styles.paywall}>
            <p>
              Pełna analiza pokaże:
              <br />
              – gdzie się oszukujesz
              <br />
              – co naprawdę się dzieje
              <br />
              – dokąd to zmierza
            </p>

            <button style={styles.buttonGold}>
              Odblokuj raport – 15 zł
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: any = {
  wrapper: {
    minHeight: "100vh",
    background: "#050505",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  hero: {
    maxWidth: 800,
    textAlign: "center",
  },
  logo: {
    fontSize: 28,
    color: "#C5A059",
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 800,
  },
  subtitle: {
    marginTop: 20,
    opacity: 0.7,
  },
  button: {
    marginTop: 30,
    padding: "14px 28px",
    background: "#C5A059",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
  },
  buttonGold: {
    marginTop: 20,
    padding: "16px 30px",
    background: "#C5A059",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  card: {
    maxWidth: 600,
  },
  checkbox: {
    display: "block",
    marginTop: 20,
  },
  textarea: {
    width: "100%",
    height: 120,
    marginTop: 20,
  },
  titleSmall: {
    fontSize: 28,
  },
  paywall: {
    marginTop: 30,
    borderTop: "1px solid #333",
    paddingTop: 20,
  },
};