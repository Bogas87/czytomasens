import React from "react";
import { Kicker } from "./Layout";
import "../../shared/product-consolidation.css";

const articles = [
  {
    href: "/artykuly/czy-ten-zwiazek-ma-sens",
    tag: "RELACJE",
    title: "Czy ten związek ma jeszcze sens?",
    text: "Jak odróżnić chwilowy kryzys od wzorca, który naprawdę wymaga uwagi.",
  },
  {
    href: "/artykuly/czy-warto-ratowac-zwiazek",
    tag: "DECYZJE",
    title: "Kiedy warto próbować dalej?",
    text: "Co powinno być widoczne w zachowaniu, a nie tylko w deklaracjach.",
  },
  {
    href: "/artykuly/czy-ona-on-sie-mna-bawi",
    tag: "SYGNAŁY",
    title: "Bliskość, dystans i mieszane sygnały",
    text: "Jak nie dopowiadać historii tam, gdzie nadal brakuje danych.",
  },
];

const faqs = [
  {
    question: "Czy dostanę prostą odpowiedź: zostać czy odejść?",
    answer: "Nie. Dostajesz uporządkowany materiał, główne hipotezy, niewiadome i kryteria, które można sprawdzić w zachowaniu. Decyzja pozostaje po Twojej stronie.",
  },
  {
    question: "Czy analiza diagnozuje drugą osobę?",
    answer: "Nie. Pracuje na zdarzeniach, zachowaniach, znaczeniach i niewiadomych. Nie przypisuje drugiej osobie diagnozy ani intencji jako faktu.",
  },
  {
    question: "Czym różnią się dwie ścieżki?",
    answer: "W jednej pracujesz nad własnym materiałem. W drugiej dwie osoby odpowiadają osobno, a później zestawiane są punkty wspólne, różnice i rzeczy nadal nierozstrzygnięte.",
  },
  {
    question: "Czy surowe odpowiedzi są pokazywane drugiej osobie?",
    answer: "Nie. W ścieżce dla dwojga surowe odpowiedzi pozostają prywatne. Do części wspólnej trafia dopiero uporządkowany materiał przeznaczony do pokazania.",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="ctms-landing ctms-prestige-home">
      <section className="ctms-prestige-hero" aria-labelledby="ctms-hero-title">
        <div className="ctms-prestige-hero-copy">
          <Kicker>ZRÓB MIEJSCE NA JAŚNIEJSZY OBRAZ</Kicker>
          <h1 id="ctms-hero-title">
            Zrozum swoją sytuację.<br />
            <em>Zobacz więcej.</em> Podejmuj spokojniej.
          </h1>
          <p>
            Uporządkuj fakty, znaczenia i niewiadome. Bez etykiet, bez zgadywania cudzych intencji
            i bez udawania pewności tam, gdzie jej nie ma.
          </p>

          <div className="ctms-path-gallery" aria-label="Wybierz sposób analizy">
            <button type="button" className="ctms-path-panel ctms-path-panel-solo" onClick={onStart}>
              <span className="ctms-path-symbol" aria-hidden="true">01</span>
              <span className="ctms-path-label">DLA MNIE</span>
              <strong>Chcę uporządkować własny obraz sytuacji.</strong>
              <p>Przejdź przez pytania, zobacz najważniejsze sygnały i sprawdź, czego nadal nie wiadomo.</p>
              <span className="ctms-path-cta">Rozpocznij tę ścieżkę <i aria-hidden="true">→</i></span>
            </button>

            <a className="ctms-path-panel ctms-path-panel-pair" href="/dla-par">
              <span className="ctms-path-symbol" aria-hidden="true">02</span>
              <span className="ctms-path-label">DLA NAS</span>
              <strong>Chcemy zestawić dwie perspektywy.</strong>
              <p>Każda osoba odpowiada osobno. Później widać to, co wspólne, różne i nadal nierozstrzygnięte.</p>
              <span className="ctms-path-cta">Rozpocznij tę ścieżkę <i aria-hidden="true">→</i></span>
            </a>
          </div>

          <div className="ctms-prestige-trustline">
            <span>bez rejestracji</span>
            <span>prywatne surowe odpowiedzi</span>
            <span>pierwszy odczyt bezpłatny</span>
          </div>
        </div>

        <figure className="ctms-prestige-hero-visual">
          <img
            src="/v3-assets/couple-editorial-premium.webp"
            alt="Dwie osoby w spokojnym, wieczornym wnętrzu"
            loading="eager"
            decoding="async"
          />
          <div className="ctms-prestige-hero-shade" aria-hidden="true" />
          <figcaption>
            <span>RELACJA RZADKO MA TYLKO JEDNĄ WERSJĘ</span>
            <strong>Nie szukamy winnego. Szukamy materiału, który można zobaczyć wyraźniej.</strong>
          </figcaption>
        </figure>
      </section>

      <section className="ctms-prestige-method" id="jak-dziala" aria-labelledby="ctms-method-title">
        <div className="ctms-prestige-method-intro">
          <Kicker>NASZE PODEJŚCIE</Kicker>
          <h2 id="ctms-method-title">Nie zaczynamy od oceny. Zaczynamy od porządku.</h2>
          <p>Każdy etap ma jeden cel: oddzielić to, co się wydarzyło, od tego, co temu przypisujesz i czego jeszcze nie można rozstrzygnąć.</p>
        </div>

        <div className="ctms-prestige-method-flow">
          <article>
            <span>01</span>
            <h3>Opowiadasz</h3>
            <p>Wybierasz odpowiedzi i opisujesz konkretne sytuacje własnymi słowami.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Porządkujemy</h3>
            <p>Oddzielamy zdarzenia, znaczenia, emocje, sprzeczności i brakujące dane.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Otrzymujesz odczyt</h3>
            <p>Widzisz, co dziś wynika z materiału i które wnioski nadal wymagają ostrożności.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Sprawdzasz w życiu</h3>
            <p>Najważniejsze hipotezy dostają konkretne kryteria weryfikacji w zachowaniu.</p>
          </article>
        </div>
      </section>

      <section className="ctms-prestige-dossier" aria-labelledby="ctms-dossier-title">
        <div className="ctms-prestige-dossier-copy">
          <Kicker>PRZYKŁAD ODCZYTU</Kicker>
          <h2 id="ctms-dossier-title">Zamiast „on mnie ignoruje” — najpierw zobacz, co naprawdę się wydarzyło.</h2>
          <p>Jedno zdanie może mieszać obserwację, interpretację i przewidywanie. Rozdzielenie ich często zmienia obraz całej sytuacji.</p>
        </div>
        <div className="ctms-prestige-dossier-sheet">
          <div><span>ZDARZENIE</span><p>Kontakt wrócił dopiero po kolejnej wiadomości.</p></div>
          <div><span>INTERPRETACJA</span><p>„Relacja utrzymuje się głównie dzięki mojej inicjatywie”.</p></div>
          <div><span>NAJWIĘKSZA NIEWIADOMA</span><p>Czy to stały brak inicjatywy, czy reakcja na konkretny konflikt?</p></div>
          <div><span>CO SPRAWDZIĆ DALEJ</span><p>Czy własny ruch pojawi się bez kolejnego impulsu z drugiej strony.</p></div>
        </div>
      </section>

      <section className="ctms-prestige-value" id="raport" aria-labelledby="ctms-value-title">
        <div className="ctms-prestige-value-head">
          <Kicker>NAJPIERW WARTOŚĆ</Kicker>
          <h2 id="ctms-value-title">Pierwszy odczyt ma już coś wyjaśnić. Pełny raport ma wejść głębiej.</h2>
        </div>
        <div className="ctms-prestige-value-grid">
          <article>
            <span>PIERWSZY ODCZYT</span>
            <h3>Krótki, ale konkretny.</h3>
            <ul>
              <li>główny sygnał i sedno sytuacji;</li>
              <li>najważniejsza niewiadoma;</li>
              <li>co może zmienić ocenę;</li>
              <li>pierwszy fragment uporządkowanej mapy.</li>
            </ul>
          </article>
          <article>
            <span>PEŁNY ODCZYT</span>
            <h3>Głębia, która ma dać jasność.</h3>
            <ul>
              <li>pełny obraz materiału i rozbieżności;</li>
              <li>hipoteza główna oraz kontrhipoteza;</li>
              <li>możliwy ślepy punkt i warunki zmiany;</li>
              <li>konkretne kryteria dalszego sprawdzenia.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="ctms-prestige-guides" aria-labelledby="ctms-guides-title">
        <div className="ctms-prestige-guides-head">
          <div>
            <Kicker>ARTYKUŁY I PORADNIKI</Kicker>
            <h2 id="ctms-guides-title">Wiedza, która pomaga lepiej rozumieć.</h2>
          </div>
          <a href="/artykuly">Zobacz wszystkie <span aria-hidden="true">→</span></a>
        </div>
        <div className="ctms-prestige-guides-grid">
          {articles.map((article) => (
            <a key={article.href} href={article.href}>
              <span>{article.tag}</span>
              <h3>{article.title}</h3>
              <p>{article.text}</p>
              <b>Czytaj <i aria-hidden="true">→</i></b>
            </a>
          ))}
        </div>
      </section>

      <section className="ctms-prestige-privacy" aria-labelledby="ctms-privacy-title">
        <div>
          <Kicker>PRYWATNOŚĆ</Kicker>
          <h2 id="ctms-privacy-title">To jest miejsce do szczerego opisu, nie do wystawiania historii na widok.</h2>
        </div>
        <div className="ctms-prestige-privacy-points">
          <p><strong>Surowe odpowiedzi pozostają prywatne.</strong><span>W ścieżce dla dwojga druga osoba nie dostaje Twojego tekstu pytanie po pytaniu.</span></p>
          <p><strong>Nie wpisuj danych identyfikujących.</strong><span>Do analizy wystarcza opis zdarzeń, zachowań i własnego doświadczenia.</span></p>
          <p><strong>Nie diagnozujemy ludzi.</strong><span>Opisujemy materiał, różnice znaczeń, niewiadome i możliwe kryteria sprawdzenia.</span></p>
        </div>
      </section>

      <section className="ctms-prestige-faq" aria-labelledby="ctms-faq-title">
        <div>
          <Kicker>NAJCZĘSTSZE PYTANIA</Kicker>
          <h2 id="ctms-faq-title">Zanim zaczniesz.</h2>
        </div>
        <div className="ctms-prestige-faq-list">
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
