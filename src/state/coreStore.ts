// Step 11: Core chat store orchestrating messages with optimistic updates
import { create } from 'zustand';
import { CoreMessagesRepo, CoreMessage } from '../data/repos/coreMessagesRepo';
import { sanitizeMessage, isMessageAllowed } from '../util/filters';
import { useNeoStore } from './neoStore';

export type CoreStore = {
  channel: string;
  messages: CoreMessage[];
  loading: boolean;
  load: (channel?: string) => Promise<void>;
  sendMessage: (content: string, author?: string) => Promise<boolean>;
};

export const useCoreStore = create<CoreStore>((set, get) => ({
  channel: 'core',
  messages: [],
  loading: false,
  load: async (channel = 'core') => {
    set({ loading: true, channel });
    const records = await CoreMessagesRepo.list(channel);
    set({ messages: records, loading: false });
  },
  sendMessage: async (content: string, author = 'You') => {
    if (!isMessageAllowed(content)) {
      useNeoStore.getState().trigger('alert', 'Message flagged — keep it neon-positive.');
      return false;
    }
    const sanitized = sanitizeMessage(content);
    const optimistic: CoreMessage = {
      id: Date.now(),
      channel: get().channel,
      author,
      content: sanitized,
      avatar: 'user',
      created_at: Date.now()
    };
    set(state => ({ messages: [...state.messages, optimistic] }));
    try {
      await CoreMessagesRepo.add({ ...optimistic, id: undefined });
      useNeoStore.getState().trigger('celebrate', 'Neo logged the pulse.');
      return true;
    } catch (error) {
      set(state => ({ messages: state.messages.filter(msg => msg.id !== optimistic.id) }));
      useNeoStore.getState().trigger('alert', 'Signal lost — retry that drop.');
      return false;
    }
  }
}));
