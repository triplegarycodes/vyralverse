import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { VersePalette } from '../theme';
import { NeonSphere } from './three/NeonSphere';

type NeoMood =
  | 'chill'
  | 'triumph'
  | 'hype'
  | 'savage'
  | 'prayer'
  | 'loyal'
  | 'spark'
  | 'zeal';

type NeoMascotProps = {
  mood: NeoMood;
  palette: VersePalette;
};

const moodSourceMap: Record<NeoMood, any> = {
  chill: require('../../assets/lottie/lottie_chill.json'),
  triumph: require('../../assets/lottie/lottie_triumph.json'),
  hype: require('../../assets/lottie/lottie_hype.json'),
  savage: require('../../assets/lottie/lottie_savage.json'),
  prayer: require('../../assets/lottie/lottie_prayer.json'),
  loyal: require('../../assets/lottie/lottie_loyal.json'),
  spark: require('../../assets/lottie/lottie_spark.json'),
  zeal: require('../../assets/lottie/lottie_zeal.json'),
};

export const NeoMascot: React.FC<NeoMascotProps> = ({ mood, palette }) => {
  const animationSource = useMemo(() => moodSourceMap[mood], [mood]);
  return (
    <View style={styles.container} accessibilityLabel={`Neo mascot mood ${mood}`}>
      <NeonSphere size={50} color={palette.primary} accent={palette.accent} />
      <LottieView source={animationSource} autoPlay loop style={styles.lottie} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  lottie: {
    position: 'absolute',
    width: 70,
    height: 70,
  },
});
