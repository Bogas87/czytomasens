import React from "react";
import { Kicker } from "./Layout";
import "../../shared/product-consolidation.css";

const articles = [
  {
    href: "/artykuly/jak-mowic-zeby-byc-naprawde-sluchanym",
    title: "Jak mówić, żeby być naprawdę słuchanym",
    fallback: "/artykuly/czy-ten-zwiazek-ma-sens",
  },
  {
    href: "/artykuly/granice-w-relacji-z-miloscia-do-siebie-i-do-nas",
    title: "Granice w relacji — z miłością do siebie i do nas",
    fallback: "/artykuly/czy-warto-ratowac-zwiazek",
  },
  {
    href: "/artykuly/mieszane-sygnaly-w-relacji-co-robic-gdy-raz-jest-blisko-a-raz-sie-mna-bawi",
    title: "Cisza, dystans, chłód — co naprawdę znaczą?",
    fallback: "/artykuly/mieszane-sygnaly-w-relacji-co-robic-gdy-raz-jest-blisko-a-raz-sie-mna-bawi",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="ctms-v7-page">
      <section className="ctms-v7-hero" aria-labelledby="ctms-v7-title">
        <div className="ctms-v7-copy">
          <Kicker>ZROZUM. UPORZĄDKUJ. ZDECYDUJ.</Kicker>
          <h1 id="ctms-v7-title">
            Zrozum swoją relację.<br />
            Zobacz więcej. <em>Podejmuj spokojniej.</em>
          </h1>
          <p>
            Spójrz na swoją sytuację z dystansu, nazwij to, co ważne
            i zobacz dynamikę wyraźniej — bez oceniania, w pełnej dyskrecji.
          </p>

          <div className="ctms-v7-route-grid">
            <button type="button" className="ctms-v7-route ctms-v7-route-self" onClick={onStart}>
              <div className="ctms-v7-route-icon" aria-hidden="true">◯</div>
              <span className="ctms-v7-route-label">DLA MNIE</span>
              <strong>Zbadaj swoją sytuację, uporządkuj fakty i zobacz, co naprawdę się dzieje.</strong>
              <div className="ctms-v7-route-features">
                <div><b>◉</b><span>Twoja perspektywa<br/>w centrum</span></div>
                <div><b>◇</b><span>Jasność w emocjach<br/>i myślach</span></div>
                <div><b>⌁</b><span>Kierunek dopasowany<br/>do Ciebie</span></div>
              </div>
              <span className="ctms-v7-route-action">Zacznij analizę dla siebie <i>→</i></span>
            </button>

            <a className="ctms-v7-route ctms-v7-route-pair" href="/dla-par">
              <div className="ctms-v7-route-icon" aria-hidden="true">◎</div>
              <span className="ctms-v7-route-label">DLA NAS</span>
              <strong>Zrozumcie dynamikę relacji, dostrzeżcie wzorce i odbudujcie porozumienie.</strong>
              <div className="ctms-v7-route-features">
                <div><b>∞</b><span>Dynamika relacji<br/>w pełnym obrazie</span></div>
                <div><b>♡</b><span>Lepsza komunikacja<br/>i zrozumienie</span></div>
                <div><b>⌘</b><span>Świadome decyzje<br/>na przyszłość</span></div>
              </div>
              <span className="ctms-v7-route-action">Zacznij analizę dla nas <i>→</i></span>
            </a>
          </div>
        </div>

        <figure className="ctms-v7-hero-image">
          <img src="/v3-assets/v7-home-couple.webp" alt="" aria-hidden="true" />
          <div className="ctms-v7-image-shade" />
        </figure>
      </section>

      <section className="ctms-v7-approach" id="jak-dziala">
        <div className="ctms-v7-approach-intro">
          <Kicker>NASZE PODEJŚCIE</Kicker>
          <h2>Jak pracujemy nad zrozumieniem relacji</h2>
          <p>Metoda oparta na doświadczeniu, uważności i psychologicznej precyzji.</p>
          <a href="#pelny-odczyt">Poznaj całe podejście <span>→</span></a>
        </div>

        <article className="ctms-v7-step">
          <div className="ctms-v7-step-art art-1" />
          <div><span>01</span><h3>Ty opowiadasz</h3><p>Dzielisz się swoją historią w bezpiecznej przestrzeni.</p></div>
        </article>
        <article className="ctms-v7-step">
          <div className="ctms-v7-step-art art-2" />
          <div><span>02</span><h3>My analizujemy</h3><p>Porządkujemy fakty, wyłapujemy wzorce i kluczowe punkty relacji.</p></div>
        </article>
        <article className="ctms-v7-step">
          <div className="ctms-v7-step-art art-3" />
          <div><span>03</span><h3>Otrzymujesz wgląd</h3><p>Dostajesz klarowny obraz sytuacji, interpretację i rekomendacje.</p></div>
        </article>
        <article className="ctms-v7-step">
          <div className="ctms-v7-step-art art-4" />
          <div><span>04</span><h3>Działasz świadomie</h3><p>Masz wiedzę, by podejmować decyzje w zgodzie ze sobą.</p></div>
        </article>
      </section>

      <section className="ctms-v7-depth" id="pelny-odczyt">
        <div className="ctms-v7-depth-art art-left" />
        <div className="ctms-v7-depth-main">
          <Kicker>PEŁNY ODCZYT</Kicker>
          <h2>Głębia, która daje jasność</h2>
          <p>Każdy raport to starannie opracowany wgląd w Twoją relację.</p>
          <div className="ctms-v7-checks">
            <span>Pełny obraz sytuacji</span>
            <span>Rekomendacje dopasowane do Was</span>
            <span>Fakty i interpretacje</span>
            <span>Praktyczne kroki naprawcze</span>
            <span>Kluczowe wnioski</span>
            <span>Poukładana ścieżka dalszych działań</span>
          </div>
        </div>
        <aside className="ctms-v7-depth-side">
          <Kicker>DLACZEGO TO DZIAŁA</Kicker>
          <h3>Oddzielamy fakty od interpretacji</h3>
          <p>Nie pracujemy na domysłach. Porządkujemy fakty, rozpoznajemy wzorce i dopiero wtedy formułujemy interpretacje.</p>
          <div className="ctms-v7-three">
            <span><b>◉</b>Fakty i historia<br/>bez zniekształceń</span>
            <span><b>✣</b>Interpretacje oparte<br/>na psychologii relacji</span>
            <span><b>⌁</b>Wnioski, które<br/>naprawdę pomagają</span>
          </div>
        </aside>
      </section>

      <section className="ctms-v7-knowledge">
        <div className="ctms-v7-knowledge-lead">
          <Kicker>ARTYKUŁY I PORADNIKI</Kicker>
          <h2>Wiedza, która pomaga lepiej rozumieć</h2>
          <a href="/artykuly">Zobacz wszystkie artykuły <span>→</span></a>
        </div>
        {articles.map((item, index) => (
          <a key={item.title} className={`ctms-v7-article article-${index + 1}`} href={item.fallback}>
            <h3>{item.title}</h3>
            <span>Czytaj artykuł <i>→</i></span>
          </a>
        ))}
        <a className="ctms-v7-faq-card" href="#faq">
          <Kicker>NAJCZĘSTSZE PYTANIA</Kicker>
          <h3>Masz pytania?<br/>Jesteśmy tu.</h3>
          <span>Zobacz odpowiedzi <i>→</i></span>
        </a>
      </section>

      <footer className="ctms-v7-footer" id="faq">
        <div className="ctms-v7-footer-brand">
          <strong>CzyToMaSens</strong>
          <span>SPOKOJNA ANALIZA RELACJI</span>
        </div>
        <div>
          <b>◈</b>
          <p><strong>Prywatność i dyskrecja</strong><br/>Twoje dane są chronione.<br/>Pracujemy z pełną dyskrecją.</p>
        </div>
        <div>
          <b>✉</b>
          <p><strong>Kontakt</strong><br/>Napisz do nas — odpowiemy<br/>na każde pytanie.</p>
        </div>
        <div>
          <p><strong>Najczęstsze pytania</strong><br/><a href="/polityka-prywatnosci">Prywatność</a> · <a href="/regulamin">Regulamin</a></p>
        </div>
        <small>© CzyToMaSens. Wszelkie prawa zastrzeżone.</small>
      </footer>
    </div>
  );
}
