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
    answer: "Nie. Dostaniesz uporządkowany obraz sytuacji, możliwe wyjaśnienia i konkretne rzeczy, które warto jeszcze sprawdzić. Decyzja pozostaje po Twojej stronie.",
  },
  {
    question: "Czy analiza ocenia albo diagnozuje drugą osobę?",
    answer: "Nie. Pracujemy na tym, co opisujesz: zdarzeniach, zachowaniach, interpretacjach, emocjach i niewiadomych. Nie przypisujemy drugiej osobie diagnozy ani intencji jako faktu.",
  },
  {
    question: "Czym różni się analiza prywatna od Dwóch Spojrzeń?",
    answer: "W analizie prywatnej porządkujesz własną perspektywę. W Dwóch Spojrzeniach każde z Was odpowiada osobno, a później zestawiane są punkty wspólne, różnice i rzeczy nadal nierozstrzygnięte. Surowe odpowiedzi pozostają prywatne.",
  },
  {
    question: "Czy muszę podawać dane drugiej osoby?",
    answer: "Nie. Nie wpisuj nazwisk, adresów, numerów telefonu ani innych danych identyfikujących. Do analizy wystarcza opis sytuacji własnymi słowami.",
  },
  {
    question: "Co jest bezpłatne?",
    answer: "Najpierw dostajesz krótki odczyt, który ma już uporządkować sytuację. Pełny raport jest opcjonalny i pojawia się dopiero później.",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="ctms-landing ctms-landing-signature">
      <section className="ctms-hero ctms-hero-signature" aria-labelledby="ctms-hero-title">
        <div className="ctms-hero-copy">
          <Kicker>PRYWATNA PRZESTRZEŃ DO MYŚLENIA</Kicker>
          <h1 id="ctms-hero-title">Co chcesz dziś <em>zrozumieć?</em></h1>
          <p className="ctms-hero-lead">
            Kiedy emocje mieszają fakty z domysłami, trudno zobaczyć własną sytuację wyraźnie.
            Tutaj porządkujesz to spokojnie — bez oceniania i bez udawania pewności.
          </p>

          <div className="ctms-mode-choice" aria-label="Wybierz rodzaj analizy">
            <button className="ctms-mode-card ctms-mode-card-private" type="button" onClick={onStart}>
              <span className="ctms-mode-mark">DLA MNIE</span>
              <strong>Chcę najpierw zrozumieć własną perspektywę.</strong>
              <p>Przechodzisz przez analizę samodzielnie i sprawdzasz, co naprawdę dzieje się w relacji.</p>
              <span className="ctms-mode-link">Rozpocznij prywatnie <i aria-hidden="true">→</i></span>
            </button>

            <a className="ctms-mode-card ctms-mode-card-couple" href="/dla-par">
              <span className="ctms-mode-mark">DLA NAS</span>
              <strong>Chcemy zobaczyć tę samą relację z dwóch stron.</strong>
              <p>Każde z Was odpowiada osobno. Dopiero później spotykają się obie perspektywy.</p>
              <span className="ctms-mode-link">Rozpocznij dla dwojga <i aria-hidden="true">→</i></span>
            </a>
          </div>

          <div className="ctms-trustline" aria-label="Najważniejsze zasady">
            <span>bez publicznego profilu</span>
            <span>bez rejestracji</span>
            <span>pierwszy odczyt bezpłatny</span>
          </div>
        </div>

        <figure className="ctms-hero-human">
          <img
            src="/v3-assets/couple-editorial-premium.webp"
            alt="Dwie osoby stojące naprzeciw siebie w spokojnym, ciemnym wnętrzu"
            loading="eager"
            decoding="async"
          />
          <figcaption>
            <span>RELACJA RZADKO MA TYLKO JEDNĄ WERSJĘ</span>
            <strong>Nie szukamy winnego. Szukamy tego, co można zobaczyć wyraźniej.</strong>
            <p>Fakt, interpretacja, emocja i niewiadoma nie muszą znaczyć tego samego.</p>
          </figcaption>
        </figure>
      </section>

      <section className="ctms-method" id="jak-dziala" aria-labelledby="ctms-method-title">
        <div className="ctms-method-heading">
          <Kicker>JAK PRACUJEMY</Kicker>
          <h2 id="ctms-method-title">Mniej etykiet. Więcej rzeczy, które można sprawdzić w realnym życiu.</h2>
          <p>Nie próbujemy opisać całej relacji jednym słowem. Rozkładamy konkretną sytuację na części, które da się odróżnić.</p>
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
        <div className="ctms-reading-room-copy">
          <div className="ctms-reading-room-title">
            <Kicker>NA KONKRECIE</Kicker>
            <h2 id="ctms-reading-room-title">Zamiast „on mnie ignoruje” — najpierw zobacz, co naprawdę się wydarzyło.</h2>
            <p>Jedno zdanie potrafi mieszać obserwację, znaczenie i przewidywanie. Rozdzielenie ich często zmienia sposób patrzenia na całą sytuację.</p>
          </div>
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
          <Kicker>NAJPIERW WARTOŚĆ</Kicker>
          <h2>Najpierw sprawdź, czy ten sposób myślenia naprawdę Ci pomaga.</h2>
          <p>Bezpłatny odczyt ma już uporządkować sytuację. Pełny raport jest kolejnym poziomem pracy, nie opłatą za dokończenie zdania.</p>
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
          <Kicker>PORADNIKI</Kicker>
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
