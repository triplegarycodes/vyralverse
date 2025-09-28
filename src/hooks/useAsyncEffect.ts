// Utility hook to run async effects with cleanup (supports future steps)
import { useEffect, DependencyList } from 'react';

export const useAsyncEffect = (effect: () => Promise<void>, deps: DependencyList) => {
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      await effect();
    };
    run();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return null;
};
