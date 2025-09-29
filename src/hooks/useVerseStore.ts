import { useEffect, useState } from 'react';
import { VerseStoreState, subscribeToStore } from '../services/dataStore';

const initialState: VerseStoreState = {
  user: undefined,
  projects: [],
  seeds: [],
  goals: [],
  zoneMessages: [],
  lessons: [],
  purchases: [],
};

export const useVerseStore = () => {
  const [state, setState] = useState<VerseStoreState>(initialState);

  useEffect(() => {
    const unsubscribe = subscribeToStore(setState);
    return () => unsubscribe();
  }, []);

  return state;
};
