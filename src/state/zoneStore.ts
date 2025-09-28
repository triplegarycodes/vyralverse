// Step 11 & 16: Zone feed store handling community posts
import { create } from 'zustand';
import { ZonePostsRepo, ZonePost } from '../data/repos/zonePostsRepo';
import { sanitizeMessage, isMessageAllowed } from '../util/filters';
import { useNeoStore } from './neoStore';

export type ZoneState = {
  posts: ZonePost[];
  loading: boolean;
  hydrate: () => Promise<void>;
  createPost: (author: string, body: string) => Promise<boolean>;
  deletePost: (id: number) => Promise<void>;
  togglePin: (id: number, pinned: boolean) => Promise<void>;
};

export const useZoneStore = create<ZoneState>((set, get) => ({
  posts: [],
  loading: false,
  hydrate: async () => {
    set({ loading: true });
    const posts = await ZonePostsRepo.list();
    set({ posts, loading: false });
  },
  createPost: async (author, body) => {
    if (!isMessageAllowed(body)) {
      useNeoStore.getState().trigger('alert', 'Zone post blocked — elevate the signal.');
      return false;
    }
    const sanitized = sanitizeMessage(body);
    await ZonePostsRepo.add({
      author,
      body: sanitized,
      pinned: 0,
      reactions: 0,
      created_at: Date.now()
    });
    await get().hydrate();
    useNeoStore.getState().trigger('celebrate', 'First Zone transmission locked.');
    return true;
  },
  deletePost: async id => {
    await ZonePostsRepo.delete(id);
    await get().hydrate();
  },
  togglePin: async (id, pinned) => {
    await ZonePostsRepo.updatePinned(id, pinned);
    await get().hydrate();
  }
}));
