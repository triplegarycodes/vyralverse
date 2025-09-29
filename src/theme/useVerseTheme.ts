import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import chroma from 'chroma-js';
import { EMBER_ORANGE, RADIANT_GOLD, VOID_BLACK } from './colors';

export type VersePalette = {
  primary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  outline: string;
};

const STORAGE_KEY = 'use-verse-theme/palette';

const generatePalette = (seed: string): VersePalette => {
  const baseScale = chroma
    .scale([EMBER_ORANGE, RADIANT_GOLD])
    .mode('lab')
    .colors(5);

  const seedValue = seed
    .split('')
    .map((char, index) => char.charCodeAt(0) * (index + 1))
    .reduce((acc, value) => acc + value, 0);

  const rotation = seedValue % baseScale.length;
  const rotated = baseScale
    .slice(rotation)
    .concat(baseScale.slice(0, rotation));

  return {
    primary: rotated[0] ?? EMBER_ORANGE,
    accent: rotated[1] ?? RADIANT_GOLD,
    background: chroma.mix(VOID_BLACK, rotated[2] ?? EMBER_ORANGE, 0.15, 'lab').hex(),
    card: chroma.mix(VOID_BLACK, rotated[3] ?? RADIANT_GOLD, 0.35, 'lab').hex(),
    text: rotated[4] ?? RADIANT_GOLD,
    outline: chroma(rotated[0] ?? EMBER_ORANGE).brighten(1).hex(),
  };
};

export const useVerseTheme = (seed: string) => {
  const [palette, setPalette] = useState<VersePalette>(() => generatePalette(seed || 'verse'));

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: VersePalette = JSON.parse(stored);
          if (isMounted) {
            setPalette(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load palette', error);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPalette(generatePalette(seed || 'verse'));
  }, [seed]);

  const updateSeed = useCallback(
    async (nextSeed: string) => {
      const nextPalette = generatePalette(nextSeed || 'verse');
      setPalette(nextPalette);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextPalette));
      } catch (error) {
        console.warn('Failed to persist palette', error);
      }
    },
    [setPalette]
  );

  return useMemo(
    () => ({
      palette,
      updateSeed,
    }),
    [palette, updateSeed]
  );
};
