// Step 19: Neo assistant finite-state machine
import { create } from 'zustand';

export type NeoState = 'idle' | 'hint' | 'celebrate' | 'alert';

type NeoStore = {
  state: NeoState;
  message: string | null;
  lastTriggeredAt?: number;
  trigger: (state: NeoState, message: string) => void;
  acknowledge: () => void;
};

const COOLDOWN_MS = 60 * 1000;

export const useNeoStore = create<NeoStore>(set => ({
  state: 'idle',
  message: null,
  lastTriggeredAt: undefined,
  trigger: (state, message) =>
    set(current => {
      const now = Date.now();
      if (current.lastTriggeredAt && now - current.lastTriggeredAt < COOLDOWN_MS) {
        return current;
      }
      return { state, message, lastTriggeredAt: now };
    }),
  acknowledge: () => set({ state: 'idle', message: null })
}));
