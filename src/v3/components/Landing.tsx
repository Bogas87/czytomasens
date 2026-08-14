import React from "react";
import { Kicker } from "./Layout";
import "../../shared/product-consolidation.css";

const articles = [
  { href: "/artykuly/czy-ten-zwiazek-ma-sens", tag: "RELACJE", title: "Czy ten związek ma jeszcze sens?", text: "Jak odróżnić chwilowy kryzys od wzorca, który naprawdę wymaga uwagi." },
  { href: "/artykuly/czy-warto-ratowac-zwiazek", tag: "DECYZJE", title: "Kiedy warto próbować dalej?", text: "Co powinno być widoczne w zachowaniu, a nie tylko w deklaracjach." },
  { href: "/artykuly/mieszane-sygnaly-w-relacji-co-robic-gdy-raz-jest-blisko-a-raz-sie-mna-bawi", tag: "SYGNAŁY", title: "Bliskość, dystans i mieszane sygnały", text: "Jak nie dopowiadać historii tam, gdzie nadal brakuje danych." },
];

const faqs = [
  { question: "Czy dostanę prostą odpowiedź: zostać czy odejść?", answer: "Nie. Otrzymujesz uporządkowany materiał, możliwe wyjaśnienia, niewiadome i kryteria, które można sprawdzić w zachowaniu." },
  { question: "Czy analiza diagnozuje drugą osobę?", answer: "Nie. Pracujemy na zdarzeniach, zachowaniach, znaczeniach i niewiadomych. Nie przypisujemy diagnoz ani cudzych intencji jako faktu." },
  { question: "Czym różnią się dwie ścieżki?", answer: "W jednej pracujesz nad własnym materiałem. W drugiej dwie osoby odpowiadają osobno, a później zestawiane są punkty wspólne, różnice i rzeczy nadal nierozstrzygnięte." },
  { question: "Czy surowe odpowiedzi są pokazywane drugiej osobie?", answer: "Nie. W ścieżce dla dwojga surowe odpowiedzi pozostają prywatne. Do części wspólnej trafia dopiero uporządkowany materiał." },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="ctms-landing ctms-approved-home">
      <section className="ctms-approved-hero" aria-labelledby="ctms-hero-title">
        <div className="ctms-approved-hero-copy">
          <Kicker>ZROZUM · UPORZĄDKUJ · ZDECYDUJ</Kicker>
          <h1 id="ctms-hero-title">
            Zrozum swoją sytuację.<br />
            Zobacz więcej. <em>Podejmuj spokojniej.</em>
          </h1>
          <p>
            Spójrz na to, co się dzieje z większym dystansem. Uporządkuj fakty, znaczenia i niewiadome —
            bez etykiet i bez udawania pewności.
          </p>

          <div className="ctms-approved-paths" aria-label="Wybierz ścieżkę analizy">
            <button type="button" className="ctms-approved-path ctms-approved-path-solo" onClick={onStart}>
              <span className="ctms-approved-path-icon" aria-hidden="true">◉</span>
              <span className="ctms-approved-path-label">DLA MNIE</span>
              <strong>Chcę uporządkować własny obraz sytuacji.</strong>
              <p>Zobacz, co wynika z materiału, gdzie zaczyna się interpretacja i czego nadal nie wiadomo.</p>
              <div className="ctms-approved-path-points">
                <span>moja perspektywa</span><span>ważne sygnały</span><span>kierunek sprawdzenia</span>
              </div>
              <b>Rozpocznij tę ścieżkę <i aria-hidden="true">→</i></b>
            </button>

            <a className="ctms-approved-path ctms-approved-path-pair" href="/dla-par">
              <span className="ctms-approved-path-icon" aria-hidden="true">◎</span>
              <span className="ctms-approved-path-label">DLA NAS</span>
              <strong>Chcemy zestawić dwie perspektywy.</strong>
              <p>Każda osoba odpowiada osobno. Później widać to, co wspólne, różne i nadal nierozstrzygnięte.</p>
              <div className="ctms-approved-path-points">
                <span>dwie perspektywy</span><span>punkty wspólne</span><span>różnice znaczeń</span>
              </div>
              <b>Rozpocznij tę ścieżkę <i aria-hidden="true">→</i></b>
            </a>
          </div>

          <div className="ctms-approved-trust">
            <span>bez rejestracji</span>
            <span>surowe odpowiedzi prywatne</span>
            <span>pierwszy odczyt bezpłatny</span>
          </div>
        </div>

        <figure className="ctms-approved-hero-visual">
          <img src="/v3-assets/ctms-approved-couple.webp" alt="" aria-hidden="true" />
          <div className="ctms-approved-hero-overlay" />
          <figcaption>
            <span>RELACJA RZADKO MA TYLKO JEDNĄ WERSJĘ</span>
            <strong>Nie szukamy winnego. Szukamy tego, co można zobaczyć wyraźniej.</strong>
          </figcaption>
        </figure>
      </section>

      <section className="ctms-approved-process" id="jak-dziala" aria-labelledby="ctms-process-title">
        <div className="ctms-approved-process-intro">
          <Kicker>NASZE PODEJŚCIE</Kicker>
          <h2 id="ctms-process-title">Jak pracujemy nad zrozumieniem sytuacji.</h2>
          <p>Nie zaczynamy od werdyktu. Najpierw porządkujemy materiał, później sprawdzamy, co z niego naprawdę wynika.</p>
        </div>
        <div className="ctms-approved-process-flow">
          <article><span>01</span><h3>Opowiadasz</h3><p>Wybierasz odpowiedzi i opisujesz konkretne zdarzenia.</p></article>
          <article><span>02</span><h3>Porządkujemy</h3><p>Oddzielamy fakty, znaczenia, emocje i niewiadome.</p></article>
          <article><span>03</span><h3>Otrzymujesz odczyt</h3><p>Widzisz główne wnioski, alternatywy i brakujące dane.</p></article>
          <article><span>04</span><h3>Sprawdzasz</h3><p>Najważniejsze hipotezy dostają konkretne kryteria weryfikacji.</p></article>
        </div>
      </section>

      <section className="ctms-approved-readout" aria-labelledby="ctms-readout-title">
        <div className="ctms-approved-readout-visual" aria-hidden="true" />
        <div className="ctms-approved-readout-copy">
          <Kicker>PEŁNY ODCZYT</Kicker>
          <h2 id="ctms-readout-title">Głębia, która ma dać jasność.</h2>
          <p>Nie kolekcjonujemy kart. Budujemy spójny obraz: co wiemy, co interpretujemy, czego nadal nie wiadomo i co może zmienić ocenę.</p>
          <div className="ctms-approved-readout-list">
            <span>pełny obraz materiału</span>
            <span>hipoteza i kontrhipoteza</span>
            <span>możliwy ślepy punkt</span>
            <span>warunki zmiany oceny</span>
            <span>granice i kryteria</span>
            <span>protokół sprawdzenia</span>
          </div>
        </div>
        <div className="ctms-approved-readout-logic">
          <Kicker>DLACZEGO TO DZIAŁA</Kicker>
          <h3>Oddzielamy fakt od interpretacji.</h3>
          <div><b>ZDARZENIE</b><p>Co zostało opisane.</p></div>
          <div><b>ZNACZENIE</b><p>Jakie znaczenie temu nadajesz.</p></div>
          <div><b>NIEWIADOMA</b><p>Czego materiał jeszcze nie rozstrzyga.</p></div>
        </div>
      </section>

      <section className="ctms-approved-guides" aria-labelledby="ctms-guides-title">
        <div className="ctms-approved-section-head">
          <div><Kicker>ARTYKUŁY I PORADNIKI</Kicker><h2 id="ctms-guides-title">Wiedza, która pomaga lepiej rozumieć.</h2></div>
          <a href="/artykuly">Zobacz wszystkie <span aria-hidden="true">→</span></a>
        </div>
        <div className="ctms-approved-guides-grid">
          {articles.map((article) => (
            <a key={article.href} href={article.href}>
              <span>{article.tag}</span><h3>{article.title}</h3><p>{article.text}</p><b>Czytaj <i aria-hidden="true">→</i></b>
            </a>
          ))}
        </div>
      </section>

      <section className="ctms-approved-privacy" aria-labelledby="ctms-privacy-title">
        <div>
          <Kicker>PRYWATNOŚĆ I DYSKRECJA</Kicker>
          <h2 id="ctms-privacy-title">Szczerość wymaga poczucia bezpieczeństwa.</h2>
        </div>
        <div>
          <p><strong>Surowe odpowiedzi pozostają prywatne.</strong><span>W ścieżce dla dwojga druga osoba nie widzi Twojego tekstu pytanie po pytaniu.</span></p>
          <p><strong>Nie potrzebujemy danych identyfikujących.</strong><span>Do analizy wystarcza opis zdarzeń i zachowań.</span></p>
          <p><strong>Nie diagnozujemy ludzi.</strong><span>Opisujemy materiał, różnice znaczeń, niewiadome i kryteria sprawdzenia.</span></p>
        </div>
      </section>

      <section className="ctms-approved-faq" aria-labelledby="ctms-faq-title">
        <div><Kicker>NAJCZĘSTSZE PYTANIA</Kicker><h2 id="ctms-faq-title">Zanim zaczniesz.</h2></div>
        <div className="ctms-approved-faq-list">
          {faqs.map((item) => (
            <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>
          ))}
        </div>
      </section>
    </div>
  );
}
