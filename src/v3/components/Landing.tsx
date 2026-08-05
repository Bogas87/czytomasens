
import React from "react";
import { motion } from "framer-motion";
import { Kicker, PrimaryButton, Surface } from "./Layout";
import { ArticlesSection } from "../../ArticlesSection";

const pillars = [
  {
    no: "01",
    title: "Empatia bez przytakiwania",
    text: "Najpierw porządkujemy Twój punkt widzenia. Potem sprawdzamy również to, co może mu przeczyć.",
  },
  {
    no: "02",
    title: "Fakty zamiast domysłów",
    text: "Oddzielamy zdarzenia, emocje, interpretacje i usprawiedliwienia. Nie mieszamy ich w jeden werdykt.",
  },
  {
    no: "03",
    title: "Ślepe punkty",
    text: "Pokazujemy miejsca, w których pojedynczy dobry moment może ważyć więcej niż powtarzający się wzór.",
  },
  {
    no: "04",
    title: "Sprawdzenie w rzeczywistości",
    text: "Pełny raport kończy się bezpiecznym testem hipotezy i terminem ponownej oceny.",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <>
      <div className="v3-hero">
        <Surface className="v3-hero-copy">
          <Kicker>PRYWATNA ANALIZA JEDNEJ RELACJI</Kicker>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            Możesz mieć rację.
            <span> Ale warto sprawdzić, na czym ta racja stoi.</span>
          </motion.h1>
          <p className="v3-hero-lead">
            CzyToMaSens nie ocenia drugiej osoby. Porządkuje to, co rzeczywiście się wydarzyło,
            oddziela to od interpretacji i pokazuje, czego nadal brakuje do uczciwego wniosku.
          </p>
          <div className="v3-hero-promise">
            <div>
              <strong>Nie dostaniesz</strong>
              <span>horoskopu, diagnozy partnera ani procentowej „szansy związku”.</span>
            </div>
            <div>
              <strong>Dostaniesz</strong>
              <span>hipotezę, kontrhipotezę, Mapę Rozbieżności i sposób sprawdzenia ich w praktyce.</span>
            </div>
          </div>
          <div className="v3-hero-actions">
            <PrimaryButton onClick={onStart}>Zobacz, co naprawdę wynika z mojej historii</PrimaryButton>
            <small>Bez konta. Jedna perspektywa. Bez publikowania Twoich odpowiedzi.</small>
          </div>
        </Surface>

        <Surface className="v3-hero-mirror" aria-label="Przykładowy fragment sposobu analizy">
          <div className="v3-mirror-head">
            <span>PRZYKŁADOWE LUSTRO</span>
            <strong>Nie chodzi o to, czy czekasz. Chodzi o to, co czekanie zastępuje.</strong>
          </div>
          <div className="v3-mirror-story">
            <div className="v3-mirror-source">
              <span>Twoje rozumienie</span>
              <blockquote>„Potrzebuje czasu, ale wiem, że mu zależy.”</blockquote>
            </div>
            <div className="v3-mirror-divider" aria-hidden="true"><span /></div>
            <div className="v3-mirror-reading">
              <article>
                <span>FAKT</span>
                <p>Od trzech tygodni kontakt inicjujesz głównie Ty.</p>
              </article>
              <article>
                <span>INTERPRETACJA</span>
                <p>Brak działania tłumaczysz przeciążeniem i lękiem przed zaangażowaniem.</p>
              </article>
              <article>
                <span>NIEWIADOMA</span>
                <p>Nie wiadomo, czy inicjatywa pojawi się bez Twojego kolejnego impulsu.</p>
              </article>
              <article className="v3-mirror-accent">
                <span>PRÓBA PRAWDY</span>
                <p>Nie musisz dziś rozstrzygać intencji. Wystarczy sprawdzić zachowanie, którego nie prowadzisz za rękę.</p>
              </article>
            </div>
          </div>
          <div className="v3-mirror-close">
            <strong>Pełna analiza robi jeszcze jedną rzecz:</strong>
            <p>buduje najlepszą kontrhipotezę, żeby nie zamienić Twojego bólu ani nadziei w automatyczny wyrok.</p>
          </div>
        </Surface>
      </div>

      <section className="v3-pillars" aria-label="Cztery filary analizy">
        {pillars.map((pillar, index) => (
          <motion.article
            key={pillar.no}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: index * 0.06 }}
          >
            <span>{pillar.no}</span>
            <h2>{pillar.title}</h2>
            <p>{pillar.text}</p>
          </motion.article>
        ))}
      </section>

      <Surface className="v3-loop-promise">
        <div>
          <Kicker>NIE KOŃCZYSZ Z KOLEJNĄ OPINIĄ</Kicker>
          <h2>Opisujesz sytuację. System buduje hipotezę. Ty sprawdzasz ją w rzeczywistości.</h2>
        </div>
        <ol>
          <li><span>1</span> Oddzielamy zdarzenia od znaczeń.</li>
          <li><span>2</span> Pokazujemy główną i alternatywną wersję.</li>
          <li><span>3</span> Ustalasz własne kryterium poprawy i granicę.</li>
          <li><span>4</span> Wracasz z wynikiem bezpiecznego mikro-testu.</li>
          <li><span>5</span> System porównuje zmianę zachowania z wcześniejszą narracją.</li>
        </ol>
        <p className="v3-loop-note">Pełny proces nie kończy się opinią — kończy się kryterium i sprawdzeniem go w rzeczywistości.</p>
      </Surface>

      <section className="v3-articles-home" aria-label="Poradniki o relacjach">
        <ArticlesSection
          onNavigateHome={() => { window.location.href = "/artykuly"; }}
          onNavigateArticle={(slug) => { window.location.href = `/artykuly/${slug}`; }}
          onStartAnalysis={onStart}
        />
      </section>
    </>
  );
}
