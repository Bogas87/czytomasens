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

const faqs = [
  {
    question: "Czy dostanę prostą odpowiedź: zostać czy odejść?",
    answer: "Nie. Otrzymasz uporządkowany materiał, hipotezę i kontrhipotezę oraz kryterium, które pozwala sprawdzić sytuację w zachowaniu — bez udawania pewności, której nie ma.",
  },
  {
    question: "Czy analiza diagnozuje drugą osobę?",
    answer: "Nie. System pracuje wyłącznie na Twoim opisie zdarzeń i jasno oddziela fakty, interpretacje oraz informacje, których nadal brakuje.",
  },
  {
    question: "Co jest bezpłatne?",
    answer: "Pierwszy odczyt: sedno sytuacji, główny sygnał, najważniejsza niewiadoma i jedno kryterium sprawdzenia. Pełny raport jest opcjonalny.",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="ctms-landing">
      <section className="ctms-hero" aria-labelledby="ctms-hero-title">
        <div className="ctms-hero-copy">
          <Kicker>PRYWATNA ANALIZA RELACJI</Kicker>
          <h1 id="ctms-hero-title">
            Nie potrzebujesz kolejnej opinii.
            <span> Potrzebujesz zobaczyć, co naprawdę się powtarza.</span>
          </h1>
          <p>
            CzyToMaSens porządkuje konkretne zdarzenia, oddziela fakty od dopowiedzeń i pokazuje,
            czego nadal brakuje do uczciwego wniosku. Bez diagnozowania drugiej osoby i bez prostych werdyktów.
          </p>

          <div className="ctms-hero-actions">
            <PrimaryButton onClick={onStart}>Rozpocznij bezpłatny odczyt</PrimaryButton>
            <span>Bez konta. Bez publikowania historii. Pierwszy wynik otrzymasz od razu.</span>
          </div>

          <div className="ctms-hero-proof" aria-label="Informacje o analizie">
            <div><strong>8–12 min</strong><span>spokojne przejście przez pytania</span></div>
            <div><strong>1 perspektywa</strong><span>bez udawania, że znamy intencje drugiej strony</span></div>
            <div><strong>0 werdyktów</strong><span>wniosek oparty na materiale i niewiadomych</span></div>
          </div>
        </div>

        <div className="ctms-hero-visual" aria-label="Przykładowy fragment raportu">
          <div className="ctms-visual-orbit ctms-visual-orbit-one" aria-hidden="true" />
          <div className="ctms-visual-orbit ctms-visual-orbit-two" aria-hidden="true" />
          <div className="ctms-report-peek">
            <div className="ctms-report-peek-head">
              <div>
                <span>FRAGMENT ODCZYTU</span>
                <strong>Inicjatywa po trudnej rozmowie</strong>
              </div>
              <i aria-hidden="true">01</i>
            </div>

            <div className="ctms-peek-row">
              <span>ZDARZENIE</span>
              <p>Kontakt wrócił dopiero po Twojej kolejnej wiadomości.</p>
            </div>
            <div className="ctms-peek-row">
              <span>HIPOTEZA</span>
              <p>Relacja utrzymuje się głównie dzięki Twojej inicjatywie.</p>
            </div>
            <div className="ctms-peek-row">
              <span>KONTRHIPOTEZA</span>
              <p>To może być reakcja na jeden konflikt, a nie trwały wzorzec.</p>
            </div>

            <div className="ctms-peek-verdict">
              <span>CO ROZSTRZYGA</span>
              <strong>Czy własny ruch pojawi się bez kolejnego impulsu z Twojej strony.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="ctms-method" id="jak-dziala" aria-labelledby="ctms-method-title">
        <div className="ctms-method-intro">
          <Kicker>JAK TO DZIAŁA</Kicker>
          <h2 id="ctms-method-title">Z chaosu emocji do jednego kryterium, które można sprawdzić w realnym życiu.</h2>
          <p>Analiza nie ma Cię przekonać do gotowej tezy. Ma pokazać, na czym opiera się Twoja ocena i co może ją uczciwie zmienić.</p>
        </div>

        <div className="ctms-method-steps">
          <article className="ctms-method-step">
            <span className="ctms-method-number">01</span>
            <div><h3>Materiał</h3><p>Zachowania, słowa, kolejność zdarzeń i częstotliwość — bez etykiet.</p></div>
          </article>
          <article className="ctms-method-step">
            <span className="ctms-method-number">02</span>
            <div><h3>Dwie wersje</h3><p>Hipoteza główna oraz najmocniejsza alternatywa, która może ją osłabić.</p></div>
          </article>
          <article className="ctms-method-step">
            <span className="ctms-method-number">03</span>
            <div><h3>Próba rzeczywistości</h3><p>Konkretne zachowanie, które potwierdzi zmianę albo pokaże powrót wzorca.</p></div>
          </article>
        </div>
      </section>

      <Surface className="ctms-offer" id="raport">
        <div className="ctms-offer-free">
          <Kicker>BEZPŁATNY PIERWSZY ODCZYT</Kicker>
          <h2>Najpierw zobacz, czy sposób analizy jest dla Ciebie użyteczny.</h2>
          <ul className="ctms-offer-list">
            <li>sedno sytuacji i główny sygnał;</li>
            <li>najważniejsza niewiadoma;</li>
            <li>jedno kryterium sprawdzenia;</li>
            <li>fragment Mapy Rozbieżności.</li>
          </ul>
        </div>

        <div className="ctms-offer-premium">
          <div className="ctms-offer-price"><span>PEŁNY RAPORT</span><strong>19,99 zł</strong></div>
          <h2>Nie więcej tekstu. Więcej struktury do podjęcia decyzji.</h2>
          <p>Mapa Rozbieżności, Profil Obciążenia, hipoteza i kontrhipoteza, Rejestr Granic oraz bezpieczny protokół obserwacji.</p>
          <PrimaryButton onClick={onStart}>Zacznij od bezpłatnego odczytu</PrimaryButton>
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
              <span className="ctms-guide-index">PORADNIK</span>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <span className="ctms-guide-link">Czytaj dalej <i aria-hidden="true">→</i></span>
            </a>
          ))}
        </div>
        <a className="ctms-all-guides" href="/artykuly">Zobacz wszystkie poradniki</a>
      </section>

      <section className="ctms-faq" aria-labelledby="ctms-faq-title">
        <div className="ctms-section-head">
          <Kicker>NAJWAŻNIEJSZE PYTANIA</Kicker>
          <h2 id="ctms-faq-title">Jasne zasady przed wpisaniem osobistej historii.</h2>
        </div>
        <div className="ctms-faq-grid">
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
