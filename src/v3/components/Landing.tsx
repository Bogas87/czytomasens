import React from "react";
import { Kicker, PrimaryButton, Surface } from "./Layout";

const articleLinks = [
  {
    href: "/artykuly/czy-ten-zwiazek-ma-sens",
    title: "Czy ten związek ma jeszcze sens?",
    description: "Jak oddzielić pojedynczy kryzys od relacji, która od dawna nie daje Ci bezpieczeństwa.",
    imageClass: "ctms-guide-image-couple",
  },
  {
    href: "/artykuly/czy-warto-ratowac-zwiazek",
    title: "Czy warto ratować związek?",
    description: "Kiedy wysiłek jest wspólną pracą, a kiedy próbą utrzymania relacji w pojedynkę.",
    imageClass: "ctms-guide-image-two",
  },
  {
    href: "/artykuly/mieszane-sygnaly-w-relacji-co-robic-gdy-raz-jest-blisko-a-raz-sie-mna-bawi",
    title: "Mieszane sygnały w relacji",
    description: "Co naprawdę wynika z kontaktu, w którym bliskość przeplata się z dystansem.",
    imageClass: "ctms-guide-image-three",
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
    question: "Czy muszę podawać dane drugiej osoby?",
    answer: "Nie. Nie wpisuj nazwisk, adresów, numerów telefonu ani innych danych pozwalających zidentyfikować drugą osobę. Do analizy wystarcza opis sytuacji własnymi słowami.",
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
        <div className="ctms-hero-vase" aria-hidden="true" />
        <div className="ctms-hero-copy">
          <Kicker>ZROZUM RELACJĘ · ODDZIEL FAKTY OD INTERPRETACJI</Kicker>
          <h1 id="ctms-hero-title">
            Zobacz, co <em>naprawdę</em><br />dzieje się między Wami.
          </h1>
          <p>
            CzyToMaSens porządkuje konkretne zdarzenia, oddziela fakty od domysłów i pokazuje
            wzorce, które wracają w relacji. Dostajesz spokojny, estetyczny i konkretny odczyt:
            co wynika z Twojego opisu, czego nadal nie wiadomo i co warto sprawdzić dalej.
          </p>
          <div className="ctms-hero-actions">
            <PrimaryButton onClick={onStart}>Rozpocznij analizę</PrimaryButton>
          </div>
          <div className="ctms-hero-proof" aria-label="Informacje o analizie">
            <div><span className="ctms-proof-icon">⌑</span><strong>Bez publicznego profilu</strong><span>Twoja historia nie jest publikowana</span></div>
            <div><span className="ctms-proof-icon">◇</span><strong>Bez rejestracji</strong><span>zaczynasz bez tworzenia konta</span></div>
            <div><span className="ctms-proof-icon">✦</span><strong>Pierwszy odczyt bezpłatny</strong><span>najpierw oceniasz wartość analizy</span></div>
          </div>
        </div>

        <div className="ctms-hero-visual" aria-label="Przykładowy fragment raportu">
          <div className="ctms-report-peek">
            <div className="ctms-report-peek-content">
              <div className="ctms-report-peek-head">
                <div>
                  <span>PODGLĄD RAPORTU</span>
                  <strong>Przykładowy fragment odczytu</strong>
                </div>
                <i aria-hidden="true">01</i>
              </div>
              <div className="ctms-peek-row ctms-peek-row-icon">
                <b aria-hidden="true">Z</b>
                <div><span>ZDARZENIE</span><p>Kontakt wrócił dopiero po Twojej kolejnej wiadomości.</p></div>
              </div>
              <div className="ctms-peek-row ctms-peek-row-icon">
                <b aria-hidden="true">I</b>
                <div><span>INTERPRETACJA</span><p>„Relacja utrzymuje się głównie dzięki mojej inicjatywie”.</p></div>
              </div>
              <div className="ctms-peek-row ctms-peek-row-icon">
                <b aria-hidden="true">N</b>
                <div><span>NAJWIĘKSZA NIEWIADOMA</span><p>Czy to stały brak inicjatywy, czy reakcja na konkretny konflikt?</p></div>
              </div>
              <div className="ctms-peek-verdict">
                <b aria-hidden="true">?</b>
                <div><span>CO SPRAWDZIĆ DALEJ</span><strong>Czy własny ruch pojawi się bez kolejnego impulsu z Twojej strony.</strong></div>
              </div>
            </div>
            <div className="ctms-report-peek-image" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="ctms-method" id="jak-dziala" aria-labelledby="ctms-method-title">
        <div className="ctms-method-heading">
          <Kicker>JAK TO DZIAŁA</Kicker>
          <h2 id="ctms-method-title">Od emocjonalnego chaosu do rzeczy, które można sprawdzić w realnym życiu.</h2>
        </div>
        <div className="ctms-method-steps">
          <article className="ctms-method-step">
            <span className="ctms-method-number">01</span>
            <i aria-hidden="true">≋</i>
            <div><h3>Konkretny materiał</h3><p>Zachowania, słowa, kolejność zdarzeń i częstotliwość — bez etykiet.</p></div>
          </article>
          <article className="ctms-method-step">
            <span className="ctms-method-number">02</span>
            <i aria-hidden="true">⇄</i>
            <div><h3>Dwie możliwe wersje</h3><p>Hipoteza główna i najmocniejsza alternatywa, która może ją osłabić.</p></div>
          </article>
          <article className="ctms-method-step">
            <span className="ctms-method-number">03</span>
            <i aria-hidden="true">◎</i>
            <div><h3>Kryterium sprawdzenia</h3><p>Konkretne zachowanie, które potwierdzi zmianę albo pokaże powrót wzorca.</p></div>
          </article>
        </div>
      </section>

      <Surface className="ctms-offer" id="raport">
        <div className="ctms-offer-free">
          <div className="ctms-offer-emblem" aria-hidden="true">◒</div>
          <Kicker>BEZPŁATNY PIERWSZY ODCZYT</Kicker>
          <h2>Zobacz pierwsze wnioski. Bez zobowiązań.</h2>
          <p>Najpierw dostajesz konkretny fragment własnej analizy, żeby ocenić, czy ten sposób myślenia jest dla Ciebie użyteczny.</p>
          <ul className="ctms-offer-list">
            <li>sedno sytuacji i główny sygnał;</li>
            <li>najważniejsza niewiadoma;</li>
            <li>jedno kryterium sprawdzenia;</li>
            <li>fragment Mapy Rozbieżności.</li>
          </ul>
        </div>

        <div className="ctms-offer-vs" aria-hidden="true">VS</div>

        <div className="ctms-offer-premium">
          <div className="ctms-offer-emblem ctms-offer-emblem-premium" aria-hidden="true">✦</div>
          <div className="ctms-offer-price"><span>PEŁNY RAPORT</span></div>
          <h2>Pełniejszy obraz. Więcej struktury do świadomej decyzji.</h2>
          <p>Mapa Rozbieżności, Profil Obciążenia, hipoteza i kontrhipoteza, Rejestr Granic oraz bezpieczny protokół obserwacji.</p>
          <ul className="ctms-offer-list ctms-offer-list-premium">
            <li>co wspiera Twój obecny odczyt;</li>
            <li>co może go osłabić;</li>
            <li>gdzie kończy się fakt, a zaczyna dopowiedzenie;</li>
            <li>co sprawdzić w zachowaniu, nie w deklaracjach.</li>
          </ul>
        </div>
      </Surface>

      <section className="ctms-guides" aria-labelledby="ctms-guides-title">
        <div className="ctms-section-head">
          <Kicker>PORADNIKI</Kicker>
          <h2 id="ctms-guides-title">Materiały do spokojnego uporządkowania najczęstszych dylematów.</h2>
        </div>
        <div className="ctms-guides-grid">
          {articleLinks.map((article, index) => (
            <a key={article.href} href={article.href}>
              <span className={`ctms-guide-image ${article.imageClass}`} aria-hidden="true" />
              <div className="ctms-guide-body">
                <span className="ctms-guide-index">0{index + 1}</span>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <span className="ctms-guide-link">Czytaj artykuł <i aria-hidden="true">→</i></span>
              </div>
            </a>
          ))}
        </div>
        <a className="ctms-all-guides" href="/artykuly">Zobacz wszystkie poradniki <span aria-hidden="true">→</span></a>
      </section>

      <section className="ctms-faq" aria-labelledby="ctms-faq-title">
        <div className="ctms-section-head">
          <Kicker>PRZED ANALIZĄ</Kicker>
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
