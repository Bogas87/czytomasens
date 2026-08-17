import React from "react";
import { Kicker } from "./Layout";
import "../../shared/product-consolidation.css";

const guides = [
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
    href: "/artykuly/mieszane-sygnaly-w-relacji-co-robic-gdy-raz-jest-blisko-a-raz-sie-mna-bawi",
    tag: "SYGNAŁY",
    title: "Bliskość, dystans i mieszane sygnały",
    text: "Jak nie dopowiadać historii tam, gdzie nadal brakuje danych.",
  },
];

const faqs = [
  {
    question: "Czy dostanę prostą odpowiedź: zostać czy odejść?",
    answer: "Nie. Dostajesz uporządkowany materiał, alternatywne wyjaśnienia, niewiadome i kryteria, które można sprawdzić w zachowaniu.",
  },
  {
    question: "Czy analiza diagnozuje drugą osobę?",
    answer: "Nie. Pracujemy na zdarzeniach, zachowaniach, znaczeniach i niewiadomych. Nie przypisujemy diagnoz ani cudzych intencji jako faktu.",
  },
  {
    question: "Czym różnią się dwie ścieżki?",
    answer: "W jednej pracujesz nad własnym materiałem. W drugiej dwie osoby odpowiadają osobno, a później zestawiane są punkty wspólne, różnice i rzeczy nadal nierozstrzygnięte.",
  },
  {
    question: "Czy druga osoba zobaczy mój surowy tekst?",
    answer: "Nie. W ścieżce dla dwojga surowe odpowiedzi pozostają prywatne. Do części wspólnej trafia dopiero uporządkowany materiał.",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="ctms-landing ctms-v6-home">
      <section className="ctms-v6-hero" aria-labelledby="ctms-v6-title">
        <div className="ctms-v6-hero-copy">
          <Kicker>ZROZUM · UPORZĄDKUJ · ZDECYDUJ</Kicker>
          <h1 id="ctms-v6-title">
            Zrozum swoją sytuację.<br />
            Zobacz więcej. <em>Podejmuj spokojniej.</em>
          </h1>
          <p>
            Spójrz na to, co się dzieje z większym dystansem. Uporządkuj fakty, znaczenia i niewiadome —
            bez etykiet i bez udawania pewności.
          </p>

          <div className="ctms-v6-paths">
            <button type="button" className="ctms-v6-path ctms-v6-path-solo" onClick={onStart}>
              <span className="ctms-v6-path-round">◉</span>
              <span className="ctms-v6-path-label">DLA MNIE</span>
              <strong>Chcę uporządkować własny obraz sytuacji.</strong>
              <p>Zobacz, co wynika z materiału, gdzie zaczyna się interpretacja i czego nadal nie wiadomo.</p>
              <div className="ctms-v6-path-meta">
                <span>moja perspektywa</span><span>ważne sygnały</span><span>kierunek sprawdzenia</span>
              </div>
              <b>Rozpocznij tę ścieżkę <i>→</i></b>
            </button>

            <a className="ctms-v6-path ctms-v6-path-pair" href="/dla-par">
              <span className="ctms-v6-path-round">◎</span>
              <span className="ctms-v6-path-label">DLA NAS</span>
              <strong>Chcemy zestawić dwie perspektywy.</strong>
              <p>Każda osoba odpowiada osobno. Później widać to, co wspólne, różne i nadal nierozstrzygnięte.</p>
              <div className="ctms-v6-path-meta">
                <span>dwie perspektywy</span><span>punkty wspólne</span><span>różnice znaczeń</span>
              </div>
              <b>Rozpocznij tę ścieżkę <i>→</i></b>
            </a>
          </div>

          <div className="ctms-v6-trustline">
            <span>bez rejestracji</span><span>surowe odpowiedzi prywatne</span><span>pierwszy odczyt bezpłatny</span>
          </div>
        </div>

        <figure className="ctms-v6-hero-visual">
          <img src="/v3-assets/ctms-approved-couple.webp" alt="" aria-hidden="true" />
          <div className="ctms-v6-photo-shade" />
          <figcaption>
            <span>RELACJA RZADKO MA TYLKO JEDNĄ WERSJĘ</span>
            <strong>Nie szukamy winnego. Szukamy tego, co można zobaczyć wyraźniej.</strong>
          </figcaption>
        </figure>
      </section>

      <section className="ctms-v6-method" id="jak-dziala">
        <div className="ctms-v6-method-title">
          <Kicker>NASZE PODEJŚCIE</Kicker>
          <h2>Jak pracujemy nad zrozumieniem sytuacji.</h2>
          <p>Nie zaczynamy od werdyktu. Najpierw porządkujemy materiał, później sprawdzamy, co z niego naprawdę wynika.</p>
        </div>

        <div className="ctms-v6-method-step">
          <div className="ctms-v6-step-image is-one" />
          <span>01</span><h3>Opowiadasz</h3>
          <p>Wybierasz odpowiedzi i opisujesz konkretne zdarzenia własnymi słowami.</p>
        </div>
        <div className="ctms-v6-method-step">
          <div className="ctms-v6-step-image is-two" />
          <span>02</span><h3>Porządkujemy</h3>
          <p>Oddzielamy fakty, znaczenia, emocje, sprzeczności i brakujące dane.</p>
        </div>
        <div className="ctms-v6-method-step">
          <div className="ctms-v6-step-image is-three" />
          <span>03</span><h3>Otrzymujesz odczyt</h3>
          <p>Widzisz główne wnioski, alternatywy i rzeczy nadal nierozstrzygnięte.</p>
        </div>
        <div className="ctms-v6-method-step">
          <div className="ctms-v6-step-image is-four" />
          <span>04</span><h3>Sprawdzasz</h3>
          <p>Najważniejsze hipotezy dostają konkretne kryteria weryfikacji w zachowaniu.</p>
        </div>
      </section>

      <section className="ctms-v6-depth">
        <div className="ctms-v6-depth-image" aria-hidden="true" />
        <div className="ctms-v6-depth-copy">
          <Kicker>PEŁNY ODCZYT</Kicker>
          <h2>Głębia, która ma dać jasność.</h2>
          <p>Nie kolekcjonujemy kart. Budujemy jeden spójny obraz: co wiemy, co interpretujemy, czego nadal nie wiadomo i co może zmienić ocenę.</p>
          <div className="ctms-v6-depth-list">
            <span>pełny obraz materiału</span><span>hipoteza i kontrhipoteza</span>
            <span>możliwy ślepy punkt</span><span>warunki zmiany oceny</span>
            <span>granice i kryteria</span><span>protokół sprawdzenia</span>
          </div>
        </div>
        <aside className="ctms-v6-depth-logic">
          <Kicker>DLACZEGO TO DZIAŁA</Kicker>
          <h3>Oddzielamy fakt od interpretacji.</h3>
          <div><b>ZDARZENIE</b><p>Co zostało opisane.</p></div>
          <div><b>ZNACZENIE</b><p>Jakie znaczenie temu nadajesz.</p></div>
          <div><b>NIEWIADOMA</b><p>Czego materiał jeszcze nie rozstrzyga.</p></div>
        </aside>
      </section>

      <section className="ctms-v6-guides">
        <div className="ctms-v6-section-head">
          <div><Kicker>ARTYKUŁY I PORADNIKI</Kicker><h2>Wiedza, która pomaga lepiej rozumieć.</h2></div>
          <a href="/artykuly">Zobacz wszystkie <span>→</span></a>
        </div>
        <div className="ctms-v6-guide-grid">
          {guides.map((guide) => (
            <a key={guide.href} href={guide.href}>
              <span>{guide.tag}</span><h3>{guide.title}</h3><p>{guide.text}</p><b>Czytaj <i>→</i></b>
            </a>
          ))}
        </div>
      </section>

      <section className="ctms-v6-privacy">
        <div>
          <Kicker>PRYWATNOŚĆ I DYSKRECJA</Kicker>
          <h2>Szczerość wymaga poczucia bezpieczeństwa.</h2>
        </div>
        <div>
          <p><strong>Surowe odpowiedzi pozostają prywatne.</strong><span>W ścieżce dla dwojga druga osoba nie widzi Twojego tekstu pytanie po pytaniu.</span></p>
          <p><strong>Nie potrzebujemy danych identyfikujących.</strong><span>Do analizy wystarcza opis zdarzeń, zachowań i własnego doświadczenia.</span></p>
          <p><strong>Nie diagnozujemy ludzi.</strong><span>Opisujemy materiał, różnice znaczeń, niewiadome i kryteria sprawdzenia.</span></p>
        </div>
      </section>

      <section className="ctms-v6-faq">
        <div><Kicker>NAJCZĘSTSZE PYTANIA</Kicker><h2>Zanim zaczniesz.</h2></div>
        <div>
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span>+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
