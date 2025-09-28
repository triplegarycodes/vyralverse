// Step 17: Skrybe notes store with live word count
import { create } from 'zustand';
import { SkrybeNotesRepo, SkrybeNote } from '../data/repos/skrybeNotesRepo';

export type SkrybeState = {
  notes: SkrybeNote[];
  loading: boolean;
  hydrate: () => Promise<void>;
  addNote: (title: string, body: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
};

export const useSkrybeStore = create<SkrybeState>((set, get) => ({
  notes: [],
  loading: false,
  hydrate: async () => {
    set({ loading: true });
    const notes = await SkrybeNotesRepo.list();
    set({ notes, loading: false });
  },
  addNote: async (title, body) => {
    const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
    await SkrybeNotesRepo.add({
      title,
      body,
      word_count: wordCount,
      updated_at: Date.now()
    });
    await get().hydrate();
  },
  deleteNote: async id => {
    await SkrybeNotesRepo.remove(id);
    await get().hydrate();
  }
}));
