export type OptionBase = {
  label: string;
};

export type QuestionBase = {
  id: number;
  phase: string;
  lead: string;
  text: string;
};

export const options: OptionBase[] = [
  { label: "Tak, wyraźnie" },
  { label: "Momentami tak" },
  { label: "Raczej nie" },
  { label: "Nie, wcale" },
];

export const questions: QuestionBase[] = [
  {
    id: 1,
    phase: "obraz relacji",
    lead: "Na start nie interesuje mnie ładna wersja tej historii. Interesuje mnie to, jak to naprawdę działa na Ciebie.",
    text: "Czy przy tej osobie częściej czujesz spokój niż napięcie?",
  },
  {
    id: 2,
    phase: "obraz relacji",
    lead: "Ludzie często mylą intensywność z bliskością, a chaos z chemią.",
    text: "Czy ta relacja daje Ci poczucie bezpieczeństwa, a nie tylko emocjonalny rollercoaster?",
  },
  {
    id: 3,
    phase: "obraz relacji",
    lead: "Deklaracje są tanie. To, co zostaje po kontakcie, zwykle mówi więcej.",
    text: "Czy słowa tej osoby zwykle pokrywają się z jej zachowaniem?",
  },
  {
    id: 4,
    phase: "granice",
    lead: "Tu często wychodzi, czy relacja ma kręgosłup, czy tylko chwilowe wzloty.",
    text: "Czy możesz powiedzieć, że coś Ci nie pasuje, bez lęku o karę, chłód albo odcięcie?",
  },
  {
    id: 5,
    phase: "granice",
    lead: "Granice nie są agresją. Są testem dojrzałości drugiej strony.",
    text: "Czy Twoje granice są szanowane, nawet gdy są niewygodne?",
  },
  {
    id: 6,
    phase: "granice",
    lead: "W zdrowym układzie nie trzeba stale zasługiwać na podstawy.",
    text: "Czy masz poczucie, że nie musisz zasługiwać na uwagę, czułość albo zwykły szacunek?",
  },
  {
    id: 7,
    phase: "zaufanie",
    lead: "Bez zaufania nawet piękne momenty mają rysę pod spodem.",
    text: "Czy czujesz, że możesz wierzyć tej osobie także wtedy, gdy jej nie kontrolujesz?",
  },
  {
    id: 8,
    phase: "zaufanie",
    lead: "Nie chodzi tylko o zdradę. Chodzi też o lojalność emocjonalną i kierunek, w którym ta osoba stoi.",
    text: "Czy masz poczucie, że ta osoba naprawdę stoi po Waszej stronie, a nie głównie po swojej?",
  },
  {
    id: 9,
    phase: "zaufanie",
    lead: "Niepewność czasem krzyczy ciszej niż konflikt, ale zjada dokładnie tak samo.",
    text: "Czy ta relacja daje Ci jasność zamiast ciągłego domyślania się, co naprawdę znaczysz?",
  },
  {
    id: 10,
    phase: "przyszłość",
    lead: "Tu kończy się chemia, a zaczyna realność i rachunek kosztów.",
    text: "Czy patrząc chłodno, widzisz tu sensowną przyszłość, a nie tylko nadzieję?",
  },
  {
    id: 11,
    phase: "przyszłość",
    lead: "Nie wszystko, co da się ciągnąć, warto ciągnąć.",
    text: "Czy ta relacja rozwija Cię częściej niż osłabia?",
  },
  {
    id: 12,
    phase: "przyszłość",
    lead: "Ostatnie pytanie zwykle odcina złudzenia najczyściej.",
    text: "Gdyby ktoś bliski był dokładnie w takiej relacji jak Ty, uznałbyś to za dobry układ dla niego?",
  },
];
