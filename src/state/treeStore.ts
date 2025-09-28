// Step 15: Tree goal graph store with expand/collapse persistence
import { create } from 'zustand';
import { TreeNodesRepo, TreeNodeRecord } from '../data/repos/treeNodesRepo';

type TreeState = {
  nodes: TreeNodeRecord[];
  expanded: Record<number, boolean>;
  loading: boolean;
  hydrate: () => Promise<void>;
  toggleNode: (id: number) => void;
  addNode: (payload: Omit<TreeNodeRecord, 'id'>) => Promise<void>;
};

export const useTreeStore = create<TreeState>((set, get) => ({
  nodes: [],
  expanded: {},
  loading: false,
  hydrate: async () => {
    set({ loading: true });
    const roots = await TreeNodesRepo.listChildren(null);
    const childrenPromises = roots.map(root => TreeNodesRepo.listChildren(root.id ?? 0));
    const children = await Promise.all(childrenPromises);
    set({ nodes: [...roots, ...children.flat()], loading: false });
  },
  toggleNode: id =>
    set(state => ({ expanded: { ...state.expanded, [id]: !state.expanded[id] } })),
  addNode: async payload => {
    await TreeNodesRepo.add(payload);
    await get().hydrate();
  }
}));
