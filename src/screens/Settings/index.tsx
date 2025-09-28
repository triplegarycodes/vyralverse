// Step 18: Settings control center for personalization + haptics scaffold
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { NeonBackground } from '../../components/NeonBackground';
import { NeonCard } from '../../components/NeonCard';
import { useNeonTheme } from '../../theme/ThemeProvider';
import { accentPalette, NeonAccent } from '../../theme/tokens';

const sliderWidth = 240;
const thumbSize = 28;

export const SettingsScreen: React.FC = () => {
  const { mode, toggleMode, setAccent, theme, setFontScale, fontScale } = useNeonTheme();
  const offset = useSharedValue((fontScale - 0.8) / (1.4 - 0.8) * (sliderWidth - thumbSize));
  React.useEffect(() => {
    offset.value = (fontScale - 0.8) / (1.4 - 0.8) * (sliderWidth - thumbSize);
  }, [fontScale, offset]);

  const onGesture = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.start = offset.value;
    },
    onActive: (event, ctx: any) => {
      const next = Math.min(Math.max(ctx.start + event.translationX, 0), sliderWidth - thumbSize);
      offset.value = next;
    },
    onEnd: () => {
      offset.value = withSpring(Math.round(offset.value));
    }
  });

  const animatedThumb = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }]
  }));

  const accentOptions = useMemo(() => Object.keys(accentPalette) as NeonAccent[], []);

  const handleCommitFontScale = () => {
    const ratio = offset.value / (sliderWidth - thumbSize);
    const nextScale = 0.8 + ratio * (1.4 - 0.8);
    setFontScale(parseFloat(nextScale.toFixed(2)));
    Haptics.selectionAsync();
  };

  return (
    <NeonBackground>
      <View style={[styles.container, { padding: theme.spacing.lg }]}
 accessibilityRole="main">
        <Text style={[styles.heading, { color: theme.colors.text }]}>Settings</Text>
        <NeonCard>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Dark Mode</Text>
            <Switch value={mode === 'dark'} onValueChange={toggleMode} />
          </View>
          <Text style={[styles.section, { color: theme.colors.text }]}>Accent</Text>
          <View style={styles.row}>
            {accentOptions.map(option => (
              <Pressable
                key={option}
                onPress={() => {
                  setAccent(option);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 12,
                  backgroundColor: accentPalette[option].primary,
                  borderWidth: theme.colors.accent === accentPalette[option].primary ? 2 : 0,
                  borderColor: theme.colors.text
                }}
              />
            ))}
          </View>
          <Text style={[styles.section, { color: theme.colors.text }]}>Font Scale</Text>
          <PanGestureHandler onHandlerStateChange={handleCommitFontScale} onGestureEvent={onGesture}>
            <Animated.View style={[styles.slider, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Animated.View style={[styles.thumb, animatedThumb, { backgroundColor: theme.colors.accent }]} />
            </Animated.View>
          </PanGestureHandler>
        </NeonCard>
      </View>
    </NeonBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    flex: 1,
    fontWeight: '600'
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12
  },
  slider: {
    width: sliderWidth,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  thumb: {
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbSize / 2
  }
});
