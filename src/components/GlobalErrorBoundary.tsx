// Step 22: Global error boundary to guard the neon OS shell
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NeonButton } from './NeonButton';
import { NeonBackground } from './NeonBackground';

export class GlobalErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean }> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Vyral Verse crash captured', error, info);
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <NeonBackground>
          <View style={styles.container}>
            <Text style={styles.title}>Signal Lost</Text>
            <Text style={styles.body}>We caught a glitch. Reset to dive back in.</Text>
            <NeonButton label="Reset" onPress={this.reset} />
          </View>
        </NeonBackground>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16
  },
  body: {
    fontSize: 16,
    color: '#D0CCFF',
    marginBottom: 24,
    textAlign: 'center'
  }
});
