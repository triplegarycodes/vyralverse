import AsyncStorage from '@react-native-async-storage/async-storage';

export type VerseProject = {
  id: string;
  title: string;
  description: string;
  createdAt: number;
};

export type VerseSeed = {
  id: string;
  label: string;
  createdAt: number;
};

export type VerseGoal = {
  id: string;
  label: string;
  createdAt: number;
};

export type ZoneMessage = {
  id: string;
  content: string;
  lyfe: string;
  createdAt: number;
};

export type VerseLesson = {
  id: string;
  title: string;
  xp: number;
  completedAt: number;
};

export type VersePurchase = {
  id: string;
  item: string;
  price: string;
  purchasedAt: number;
};

export type VerseStoreState = {
  user?: {
    name?: string;
    oathSigned?: boolean;
    settings?: {
      haptics: boolean;
      themeSeed: string;
    };
  };
  projects: VerseProject[];
  seeds: VerseSeed[];
  goals: VerseGoal[];
  zoneMessages: ZoneMessage[];
  lessons: VerseLesson[];
  purchases: VersePurchase[];
};

const STORAGE_KEY = 'v-verse/datastore';

const listeners = new Set<(state: VerseStoreState) => void>();

const defaultState: VerseStoreState = {
  projects: [],
  seeds: [],
  goals: [],
  zoneMessages: [],
  lessons: [],
  purchases: [],
};

const loadState = async (): Promise<VerseStoreState> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return defaultState;
  }
  try {
    return { ...defaultState, ...JSON.parse(stored) } as VerseStoreState;
  } catch (error) {
    console.warn('Failed to parse store', error);
    return defaultState;
  }
};

const saveState = async (state: VerseStoreState) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((listener) => listener(state));
};

const generateId = () => `${Date.now()}-${Math.round(Math.random() * 10_000)}`;

export const subscribeToStore = (callback: (state: VerseStoreState) => void) => {
  listeners.add(callback);
  loadState().then(callback).catch((error) => console.warn('subscribe load', error));
  return () => listeners.delete(callback);
};

export const saveUserName = async (name: string) => {
  const state = await loadState();
  const next: VerseStoreState = {
    ...state,
    user: {
      ...state.user,
      name,
      settings: {
        haptics: state.user?.settings?.haptics ?? true,
        themeSeed: state.user?.settings?.themeSeed ?? name,
      },
    },
  };
  await saveState(next);
  return next.user;
};

export const updateThemeSeed = async (seed: string) => {
  const state = await loadState();
  const next: VerseStoreState = {
    ...state,
    user: {
      ...state.user,
      settings: {
        haptics: state.user?.settings?.haptics ?? true,
        themeSeed: seed,
      },
      name: state.user?.name,
      oathSigned: state.user?.oathSigned,
    },
  };
  await saveState(next);
  return seed;
};

export const toggleHaptics = async (enabled: boolean) => {
  const state = await loadState();
  const next: VerseStoreState = {
    ...state,
    user: {
      ...state.user,
      settings: {
        themeSeed: state.user?.settings?.themeSeed ?? state.user?.name ?? 'verse',
        haptics: enabled,
      },
      name: state.user?.name,
      oathSigned: state.user?.oathSigned,
    },
  };
  await saveState(next);
  return enabled;
};

export const createProject = async (title: string, description: string) => {
  const state = await loadState();
  const project: VerseProject = { id: generateId(), title, description, createdAt: Date.now() };
  const next: VerseStoreState = {
    ...state,
    projects: [project, ...state.projects],
  };
  await saveState(next);
  return project;
};

export const addSeed = async (label: string) => {
  const state = await loadState();
  const seed: VerseSeed = { id: generateId(), label, createdAt: Date.now() };
  const next: VerseStoreState = {
    ...state,
    seeds: [seed, ...state.seeds],
  };
  await saveState(next);
  return seed;
};

export const addGoal = async (label: string) => {
  const state = await loadState();
  const goal: VerseGoal = { id: generateId(), label, createdAt: Date.now() };
  const next: VerseStoreState = {
    ...state,
    goals: [goal, ...state.goals],
  };
  await saveState(next);
  return goal;
};

export const addZoneMessage = async (content: string, lyfe: string) => {
  const state = await loadState();
  const message: ZoneMessage = { id: generateId(), content, lyfe, createdAt: Date.now() };
  const next: VerseStoreState = {
    ...state,
    zoneMessages: [message, ...state.zoneMessages].slice(0, 100),
  };
  await saveState(next);
  return message;
};

export const signOath = async () => {
  const state = await loadState();
  const next: VerseStoreState = {
    ...state,
    user: {
      ...state.user,
      oathSigned: true,
      name: state.user?.name,
      settings: state.user?.settings,
    },
  };
  await saveState(next);
  return next.user;
};

export const completeLesson = async (title: string, xp: number) => {
  const state = await loadState();
  const lesson: VerseLesson = { id: generateId(), title, xp, completedAt: Date.now() };
  const next: VerseStoreState = {
    ...state,
    lessons: [lesson, ...state.lessons],
  };
  await saveState(next);
  return lesson;
};

export const purchaseItem = async (item: string, price: string) => {
  const state = await loadState();
  const purchase: VersePurchase = { id: generateId(), item, price, purchasedAt: Date.now() };
  const next: VerseStoreState = {
    ...state,
    purchases: [purchase, ...state.purchases],
  };
  await saveState(next);
  return purchase;
};

export const getState = async () => loadState();
