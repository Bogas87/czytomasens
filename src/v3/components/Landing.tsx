import React from "react";
import { Kicker, Surface } from "./Layout";
import "../../shared/product-consolidation.css";

const articleLinks = [
  {
    href: "/artykuly/czy-ten-zwiazek-ma-sens",
    title: "Czy ten związek ma jeszcze sens?",
    description: "Jak oddzielić pojedynczy kryzys od relacji, która od dawna nie daje Ci bezpieczeństwa.",
  },
  {
    href: "/artykuly/czy-warto-ratowac-zwiazek",
    title: "Czy warto ratować związek?",
    description: "Kiedy wysiłek jest wspólną pracą, a kiedy próbą utrzymania relacji w pojedynkę.",
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
      <section className="ctms-hero ctms-hero-2031" aria-labelledby="ctms-hero-title">
        <div className="ctms-hero-copy">
          <Kicker>PRYWATNA PRZESTRZEŃ DO MYŚLENIA</Kicker>
          <h1 id="ctms-hero-title">Co chcesz dziś <em>zrozumieć?</em></h1>
          <p>
            Nie szukamy winnego i nie stawiamy diagnoz. Porządkujemy to, co się wydarzyło,
            co z tego wynika i czego nadal nie da się uczciwie rozstrzygnąć.
          </p>

          <div className="ctms-mode-choice" aria-label="Wybierz rodzaj analizy">
            <button className="ctms-mode-card ctms-mode-card-private" type="button" onClick={onStart}>
              <span className="ctms-mode-mark">DLA MNIE</span>
              <span className="ctms-mode-eyebrow">PRYWATNA ANALIZA</span>
              <strong>Najpierw zobacz własną sytuację wyraźniej.</strong>
              <p>Pracujesz samodzielnie. Oddzielasz zdarzenia od interpretacji i sprawdzasz, co naprawdę powtarza się w relacji.</p>
              <span className="ctms-mode-link">Rozpocznij prywatnie <i aria-hidden="true">→</i></span>
            </button>

            <a className="ctms-mode-card ctms-mode-card-couple" href="/dla-par">
              <span className="ctms-mode-mark">DLA DWOJGA</span>
              <span className="ctms-mode-eyebrow">DWA SPOJRZENIA</span>
              <strong>Zobaczcie tę samą relację z dwóch stron.</strong>
              <p>Każde z Was odpowiada osobno. Dopiero później spotykają się punkty wspólne, różnice i rzeczy nadal nierozstrzygnięte.</p>
              <span className="ctms-mode-link">Rozpocznij dla dwojga <i aria-hidden="true">→</i></span>
            </a>
          </div>

          <div className="ctms-hero-proof" aria-label="Najważniejsze zasady">
            <div><strong>Bez publicznego profilu</strong><span>Twoja historia nie jest publikowana.</span></div>
            <div><strong>Bez rejestracji</strong><span>Zaczynasz bez tworzenia konta.</span></div>
            <div><strong>Najpierw wartość</strong><span>Pierwszy odczyt jest bezpłatny.</span></div>
          </div>
        </div>

        <aside className="ctms-hero-editorial" aria-label="O czym jest CzyToMaSens">
          <div className="ctms-hero-editorial-image" aria-hidden="true" />
          <div className="ctms-hero-editorial-copy">
            <span>JEDNA RELACJA · WIELE ZNACZEŃ</span>
            <blockquote>Nie chodzi o to, kto ma rację. Chodzi o to, co naprawdę dzieje się między ludźmi.</blockquote>
            <p>CzyToMaSens pomaga oddzielić zachowanie od dopowiedzenia i emocję od faktu — bez odbierania znaczenia żadnej z tych rzeczy.</p>
          </div>
        </aside>
      </section>

      <section className="ctms-method" id="jak-dziala" aria-labelledby="ctms-method-title">
        <div className="ctms-method-heading">
          <Kicker>JAK PRACUJEMY</Kicker>
          <h2 id="ctms-method-title">Mniej etykiet. Więcej rzeczy, które można sprawdzić w realnym życiu.</h2>
        </div>
        <div className="ctms-method-steps">
          <article className="ctms-method-step">
            <span className="ctms-method-number">01</span>
            <div><h3>Zdarzenie</h3><p>Co dokładnie się wydarzyło, w jakiej kolejności i jak często wraca.</p></div>
          </article>
          <article className="ctms-method-step">
            <span className="ctms-method-number">02</span>
            <div><h3>Znaczenie</h3><p>Co temu nadajesz, co temu przeczy i czego nadal zwyczajnie nie wiadomo.</p></div>
          </article>
          <article className="ctms-method-step">
            <span className="ctms-method-number">03</span>
            <div><h3>Sprawdzenie</h3><p>Jakie konkretne zachowanie pokaże zmianę albo powrót starego wzorca.</p></div>
          </article>
        </div>
      </section>

      <section className="ctms-reading-room" aria-labelledby="ctms-reading-room-title">
        <div className="ctms-reading-room-visual" aria-hidden="true" />
        <div className="ctms-reading-room-copy">
          <Kicker>PRZYKŁADOWY SPOSÓB MYŚLENIA</Kicker>
          <h2 id="ctms-reading-room-title">Nie „on mnie ignoruje”. Najpierw: co naprawdę się wydarzyło?</h2>
          <dl>
            <div><dt>Zdarzenie</dt><dd>Kontakt wrócił dopiero po Twojej kolejnej wiadomości.</dd></div>
            <div><dt>Interpretacja</dt><dd>„Relacja utrzymuje się głównie dzięki mojej inicjatywie”.</dd></div>
            <div><dt>Niewiadoma</dt><dd>Czy to stały brak inicjatywy, czy reakcja na konkretny konflikt?</dd></div>
            <div><dt>Co sprawdzić</dt><dd>Czy własny ruch pojawi się bez kolejnego impulsu z Twojej strony.</dd></div>
          </dl>
        </div>
      </section>

      <Surface className="ctms-offer" id="raport">
        <div className="ctms-offer-intro">
          <Kicker>NAJPIERW SPRAWDŹ, CZY TO CI POMAGA</Kicker>
          <h2>Bez sztucznego niedosytu.</h2>
          <p>Bezpłatny odczyt ma już porządkować sytuację. Pełny raport jest kolejnym poziomem pracy, nie opłatą za zakończenie zdania.</p>
        </div>
        <div className="ctms-offer-columns">
          <div className="ctms-offer-free">
            <span className="ctms-offer-label">PIERWSZY ODCZYT</span>
            <h3>Krótko, ale konkretnie.</h3>
            <ul className="ctms-offer-list">
              <li>sedno sytuacji i główny sygnał;</li>
              <li>najważniejsza niewiadoma;</li>
              <li>jedno kryterium sprawdzenia;</li>
              <li>pierwszy fragment uporządkowanej mapy.</li>
            </ul>
          </div>
          <div className="ctms-offer-premium">
            <span className="ctms-offer-label">PEŁNY RAPORT</span>
            <h3>Głębiej, kiedy tego potrzebujesz.</h3>
            <ul className="ctms-offer-list ctms-offer-list-premium">
              <li>co wspiera Twój obecny odczyt;</li>
              <li>co może go osłabić;</li>
              <li>gdzie kończy się fakt, a zaczyna dopowiedzenie;</li>
              <li>co sprawdzić w zachowaniu, nie w deklaracjach.</li>
            </ul>
          </div>
        </div>
      </Surface>

      <section className="ctms-guides" aria-labelledby="ctms-guides-title">
        <div className="ctms-section-head">
          <Kicker>BIBLIOTEKA RELACJI</Kicker>
          <h2 id="ctms-guides-title">Teksty do spokojnego myślenia, nie gotowe recepty.</h2>
        </div>
        <div className="ctms-guides-grid ctms-guides-grid-editorial">
          {articleLinks.map((article, index) => (
            <a key={article.href} href={article.href}>
              <span className="ctms-guide-index">0{index + 1}</span>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <span className="ctms-guide-link">Czytaj <i aria-hidden="true">→</i></span>
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
