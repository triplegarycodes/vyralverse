// Step 14: Stryke decision engine with persistent log
import { create } from 'zustand';
import { StrykeChoicesRepo, StrykeChoice } from '../data/repos/strykeChoicesRepo';

export type ScenarioOption = {
  id: string;
  label: string;
  effect: string;
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  options: ScenarioOption[];
};

const scenarios: Scenario[] = [
  {
    id: 'ignition',
    title: 'Ignition Point',
    description: 'Your squad hits a midnight creative sprint. Choose the boost.',
    options: [
      { id: 'pulse', label: 'Deploy Pulse Playlist', effect: '+5 focus' },
      { id: 'silence', label: 'Initiate Silent Sync', effect: '+3 calm' }
    ]
  },
  {
    id: 'momentum',
    title: 'Momentum Fork',
    description: 'Momentum dips post-launch. How do you rally?',
    options: [
      { id: 'retrospective', label: 'Run a flash retro', effect: 'Clarity restored' },
      { id: 'celebrate', label: 'Micro celebrate win', effect: 'Morale boost' }
    ]
  }
];

export type StrykeState = {
  history: StrykeChoice[];
  currentScenarioIndex: number;
  loading: boolean;
  currentScenario: Scenario;
  choose: (option: ScenarioOption) => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useStrykeStore = create<StrykeState>((set, get) => ({
  history: [],
  currentScenarioIndex: 0,
  loading: false,
  currentScenario: scenarios[0],
  hydrate: async () => {
    set({ loading: true });
    const scenario = scenarios[get().currentScenarioIndex];
    const choices = await StrykeChoicesRepo.listByScenario(scenario.id);
    set({ history: choices, loading: false });
  },
  choose: async option => {
    const scenario = scenarios[get().currentScenarioIndex];
    await StrykeChoicesRepo.add({
      scenario_id: scenario.id,
      option_id: option.id,
      effect: option.effect,
      created_at: Date.now()
    });
    const nextIndex = (get().currentScenarioIndex + 1) % scenarios.length;
    set({ currentScenarioIndex: nextIndex, currentScenario: scenarios[nextIndex] });
    await get().hydrate();
  }
}));
