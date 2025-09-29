import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

type VerseGlyphProps = {
  size?: number;
  color?: string;
};

export const VerseGlyph: React.FC<VerseGlyphProps> = ({ size = 100, color = '#FFD700' }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <G fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 10 L50 90 L80 10" />
      <Path d="M35 40 L65 40" />
    </G>
  </Svg>
);
