import React from "react";
import { Kicker, PrimaryButton, Surface } from "./Layout";

const articleLinks = [
  {
    href: "/artykuly/czy-ten-zwiazek-ma-sens",
    title: "Czy ten związek ma jeszcze sens?",
    description: "Jak odróżnić przejściowy kryzys od relacji, która od dawna nie ma kierunku.",
  },
  {
    href: "/artykuly/czy-warto-ratowac-zwiazek",
    title: "Czy warto ratować związek?",
    description: "Kiedy wysiłek jest odbudową, a kiedy tylko odwlekaniem decyzji.",
  },
  {
    href: "/artykuly/czy-ona-on-sie-mna-bawi",
    title: "Mieszane sygnały w relacji",
    description: "Co naprawdę wynika z kontaktu, w którym bliskość przeplata się z dystansem.",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="ctms-landing">
      <Surface className="ctms-hero">
        <div className="ctms-hero-copy">
          <Kicker>PRYWATNA ANALIZA RELACJI</Kicker>
          <h1>Oddziel fakty od interpretacji i sprawdź, co naprawdę wraca między Wami.</h1>
          <p>
            CzyToMaSens porządkuje konkretne zdarzenia, rozkład odpowiedzialności, koszt emocjonalny
            oraz informacje, których nadal brakuje. Bez diagnozowania drugiej osoby i bez prostych werdyktów.
          </p>
          <div className="ctms-hero-actions">
            <PrimaryButton onClick={onStart}>Rozpocznij analizę</PrimaryButton>
            <span>Bez konta. Pierwszy odczyt jest bezpłatny.</span>
          </div>
          <div className="ctms-trust-row" aria-label="Najważniejsze informacje">
            <span>około 8–12 minut</span>
            <span>anonimowy zapis</span>
            <span>telefon i komputer</span>
          </div>
        </div>

        <div className="ctms-hero-sample" aria-label="Przykład sposobu analizy">
          <Kicker>PRZYKŁAD ODCZYTU</Kicker>
          <article>
            <span>Zdarzenie</span>
            <p>Po trudnej rozmowie kontakt wrócił dopiero po Twojej kolejnej wiadomości.</p>
          </article>
          <article>
            <span>Znaczenie, które temu nadajesz</span>
            <p>„Gdybym się nie odezwał lub nie odezwała, relacja by się rozpadła”.</p>
          </article>
          <article>
            <span>Niewiadoma</span>
            <p>Czy to stały brak inicjatywy, czy pojedyncza reakcja na konkretny konflikt?</p>
          </article>
          <div className="ctms-sample-conclusion">
            Raport nie rozstrzyga za Ciebie. Pokazuje, co jest materiałem, a co nadal wymaga sprawdzenia.
          </div>
        </div>
      </Surface>

      <section className="ctms-value-grid" aria-label="Jak działa analiza">
        <article>
          <strong>01</strong>
          <h2>Konkretny materiał</h2>
          <p>Najpierw zbieramy zachowania, słowa, kolejność i częstotliwość — nie etykiety.</p>
        </article>
        <article>
          <strong>02</strong>
          <h2>Dwie możliwe wersje</h2>
          <p>Każdy odczyt zawiera hipotezę główną oraz najmocniejszą kontrhipotezę.</p>
        </article>
        <article>
          <strong>03</strong>
          <h2>Kryterium sprawdzenia</h2>
          <p>Dowiesz się, jakie zachowanie może potwierdzić zmianę, a jakie osłabić obecną ocenę.</p>
        </article>
      </section>

      <Surface className="ctms-offer-split">
        <div>
          <Kicker>BEZPŁATNY PIERWSZY ODCZYT</Kicker>
          <h2>Otrzymasz sedno, główny sygnał, najważniejszą niewiadomą i jedno kryterium sprawdzenia.</h2>
        </div>
        <div>
          <Kicker>PEŁNY RAPORT</Kicker>
          <p>
            Rozszerza wynik o Mapę Rozbieżności, Profil Obciążenia, hipotezę i kontrhipotezę,
            Rejestr Granic oraz bezpieczny protokół obserwacji. Dostępny dopiero po świadomej decyzji o zakupie.
          </p>
        </div>
      </Surface>

      <section className="ctms-guides" aria-labelledby="ctms-guides-title">
        <div className="ctms-section-head">
          <Kicker>PORADNIKI</Kicker>
          <h2 id="ctms-guides-title">Zanim zaczniesz analizę, możesz uporządkować temat samodzielnie.</h2>
        </div>
        <div className="ctms-guides-grid">
          {articleLinks.map((article) => (
            <a key={article.href} href={article.href}>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <span>Czytaj dalej →</span>
            </a>
          ))}
        </div>
        <a className="ctms-all-guides" href="/artykuly">Zobacz wszystkie poradniki</a>
      </section>
    </div>
  );
}
