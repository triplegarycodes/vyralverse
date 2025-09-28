// Step 14: Stryke branching scenario UI with animated options
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { NeonBackground } from '../../components/NeonBackground';
import { NeonCard } from '../../components/NeonCard';
import { NeonButton } from '../../components/NeonButton';
import { useNeonTheme } from '../../theme/ThemeProvider';
import { useStrykeStore } from '../../state/strykeStore';

export const StrykeScreen: React.FC = () => {
  const { theme } = useNeonTheme();
  const { currentScenario, choose, hydrate, history } = useStrykeStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <NeonBackground>
      <View style={[styles.container, { padding: theme.spacing.lg }]}
 accessibilityRole="main">
        <Text style={[styles.heading, { color: theme.colors.text }]}>Stryke Protocol</Text>
        <NeonCard>
          <Text style={[styles.title, { color: theme.colors.accent }]}>{currentScenario.title}</Text>
          <Text style={{ color: theme.colors.text, marginBottom: theme.spacing.md }}>
            {currentScenario.description}
          </Text>
          {currentScenario.options.map(option => (
            <Animated.View key={option.id} entering={FadeIn} exiting={FadeOut} style={{ marginBottom: 12 }}>
              <NeonButton label={option.label} onPress={() => choose(option)} />
            </Animated.View>
          ))}
        </NeonCard>
        <NeonCard style={{ marginTop: theme.spacing.lg }}>
          <Text style={[styles.subheading, { color: theme.colors.text }]}>Recent Outcomes</Text>
          {history.map(choice => (
            <Text key={choice.id} style={{ color: theme.colors.textMuted, marginTop: 8 }}>
              {choice.option_id}: {choice.effect}
            </Text>
          ))}
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600'
  }
});
