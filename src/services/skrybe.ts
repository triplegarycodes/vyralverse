const captions = [
  'gritty hustle relic with shadowed verse edge',
  'rune-scarred notebook blazing with neon zeal',
  'locker chaos pulsing with embers of purpose',
];

const quests = [
  'Epic faith code sprint: duo horde, Eph 6:12',
  'Chaos tech art vow: squad collab, badge reward',
  'Mythic prayer remix: solo grind, Gal 6:9',
];

const devotionals = [
  'Crush doubt—hustle’s a blade, Eph 6:12',
  'Speak your verse—bold, no fear, 2 Tim 1:7',
  'Faith forged in neon sparks conquers the grind',
];

const reactions = [
  'primal neon zeal',
  'serene neon hype',
  'intense void savage',
];

const randomFrom = (items: string[]) => items[Math.floor(Math.random() * items.length)];

const wait = (delay = 850) => new Promise((resolve) => setTimeout(resolve, delay));

export type SkrybeEcho = {
  caption: string;
  quest: string;
  reaction: string;
};

export const processEchoScan = async (): Promise<SkrybeEcho> => {
  await wait();
  return {
    caption: randomFrom(captions),
    quest: randomFrom(quests),
    reaction: randomFrom(reactions),
  };
};

export const generateDevotional = async (): Promise<string> => {
  await wait(600);
  return randomFrom(devotionals);
};

export const generateQuest = async (seed: string): Promise<string> => {
  await wait(700);
  return `${randomFrom(quests)} • keyed to ${seed}`;
};
