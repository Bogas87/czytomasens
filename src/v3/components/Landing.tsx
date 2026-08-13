import React from "react";
import { Kicker, Surface } from "./Layout";
import "../../shared/product-consolidation.css";

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
    href: "/artykuly/czy-ona-on-sie-mna-bawi",
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
    answer: "Nie. System pracuje na tym, co opisujesz, i oddziela zdarzenia od interpretacji, emocji oraz informacji, których nadal brakuje. Nie przypisuje partnerowi diagnozy ani ukrytych intencji jako faktu.",
  },
  {
    question: "Czym różni się analiza prywatna od Dwóch Spojrzeń?",
    answer: "W analizie prywatnej porządkujesz własną sytuację bez udziału drugiej osoby. W Dwóch Spojrzeniach każde z Was odpowiada osobno, a dopiero później system zestawia punkty wspólne, różnice i niewiadome. Surowe odpowiedzi nie są automatycznie pokazywane partnerowi.",
  },
  {
    question: "Czy muszę podawać dane drugiej osoby?",
    answer: "Nie. Nie wpisuj nazwisk, adresów, numerów telefonu ani innych danych pozwalających zidentyfikować drugą osobę. Do analizy wystarcza opis sytuacji własnymi słowami.",
  },
  {
    question: "Co jest bezpłatne?",
    answer: "W obu trybach najpierw otrzymujesz krótki odczyt, który pozwala ocenić, czy ten sposób porządkowania sytuacji jest dla Ciebie użyteczny. Pełne raporty są opcjonalne.",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="ctms-landing">
      <section className="ctms-hero" aria-labelledby="ctms-hero-title">
        <div className="ctms-hero-vase" aria-hidden="true" />

        <div className="ctms-hero-copy">
          <Kicker>DWA SPOSOBY · JEDEN CEL: WIĘCEJ JASNOŚCI</Kicker>
          <h1 id="ctms-hero-title">
            Zobacz, co <em>naprawdę</em><br />dzieje się między Wami.
          </h1>
          <p>
            Czasem potrzebujesz najpierw uporządkować własną perspektywę. Czasem warto zobaczyć,
            jak tę samą relację opisuje druga osoba. Wybierz sposób, który odpowiada temu,
            czego potrzebujesz dzisiaj.
          </p>

          <div className="ctms-mode-choice" aria-label="Wybierz rodzaj analizy">
            <button className="ctms-mode-card ctms-mode-card-private" type="button" onClick={onStart}>
              <span className="ctms-mode-mark" aria-hidden="true">1</span>
              <span className="ctms-mode-eyebrow">TYLKO DLA CIEBIE</span>
              <strong>Prywatna analiza relacji</strong>
              <p>Uporządkuj własną sytuację, oddziel fakty od dopowiedzeń i zobacz, czego nadal nie wiesz.</p>
              <span className="ctms-mode-link">Rozpocznij prywatnie <i aria-hidden="true">→</i></span>
            </button>

            <a className="ctms-mode-card ctms-mode-card-couple" href="/dla-par">
              <span className="ctms-mode-mark" aria-hidden="true">A ↔ B</span>
              <span className="ctms-mode-eyebrow">DWA SPOJRZENIA</span>
              <strong>Wspólna analiza dla dwojga</strong>
              <p>Każde z Was odpowiada osobno. Dopiero później zestawiacie to, co widzicie podobnie i inaczej.</p>
              <span className="ctms-mode-link">Rozpocznij dla dwojga <i aria-hidden="true">→</i></span>
            </a>
          </div>

          <div className="ctms-hero-proof" aria-label="Informacje o analizie">
            <div><span className="ctms-proof-icon">⌑</span><strong>Bez publicznego profilu</strong><span>Twoja historia nie jest publikowana</span></div>
            <div><span className="ctms-proof-icon">◇</span><strong>Bez rejestracji</strong><span>zaczynasz bez tworzenia konta</span></div>
            <div><span className="ctms-proof-icon">✦</span><strong>Pierwszy odczyt bezpłatny</strong><span>najpierw oceniasz wartość analizy</span></div>
          </div>
        </div>

        <div className="ctms-hero-visual" aria-label="Przykładowy fragment analizy">
          <div className="ctms-report-peek">
            <div className="ctms-report-peek-content">
              <div className="ctms-report-peek-head">
                <div>
                  <span>PRZYKŁADOWY SPOSÓB MYŚLENIA</span>
                  <strong>Nie etykieta. Najpierw to, co da się sprawdzić.</strong>
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
            <div><h3>Więcej niż jedna wersja</h3><p>Sprawdzamy nie tylko pierwszy wniosek, ale również to, co może go osłabiać albo zmieniać.</p></div>
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
          <h2>Najpierw zobacz, czy to wnosi coś do Twojego myślenia.</h2>
          <p>Krótki raport ma dać realną wartość, nie tylko zachęcić do zakupu. Dopiero później decydujesz, czy potrzebujesz pełniejszego obrazu.</p>
          <ul className="ctms-offer-list">
            <li>sedno sytuacji i główny sygnał;</li>
            <li>najważniejsza niewiadoma;</li>
            <li>jedno kryterium sprawdzenia;</li>
            <li>pierwszy fragment uporządkowanej mapy.</li>
          </ul>
        </div>

        <div className="ctms-offer-vs" aria-hidden="true">VS</div>

        <div className="ctms-offer-premium">
          <div className="ctms-offer-emblem ctms-offer-emblem-premium" aria-hidden="true">✦</div>
          <div className="ctms-offer-price"><span>PEŁNY RAPORT</span></div>
          <h2>Pełniejszy obraz wtedy, kiedy chcesz wejść głębiej.</h2>
          <p>Więcej kontekstu, kontrhipotezy, granice, obszary niepewności i dalszy sposób sprawdzania sytuacji w zachowaniu.</p>
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
