// Steps 3-12: App entry hooking gesture handler, theme provider, navigation shell
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useNeonTheme } from './src/theme/ThemeProvider';
import { RootDrawer } from './src/navigation/RootDrawer';
import { initDatabase } from './src/data/db';
import { seed } from './src/data/seed';
import { GlobalErrorBoundary } from './src/components/GlobalErrorBoundary';
import { ToastProvider } from './src/components/ToastProvider';

const linking: LinkingOptions<Record<string, object | undefined>> = {
  prefixes: ['vyral://', 'https://vyralverse.app'],
  config: {
    screens: {
      Modules: {
        screens: {
          Core: 'core',
          Lyfe: 'lyfe',
          Stryke: 'stryke'
        }
      },
      Tree: 'tree',
      Zone: 'zone',
      Skrybe: 'skrybe',
      Settings: 'settings'
    }
  }
};

const NavigationHost: React.FC = () => {
  const { theme } = useNeonTheme();
  const navTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
  navTheme.colors.background = theme.colors.background;
  navTheme.colors.card = theme.colors.surface;
  navTheme.colors.primary = theme.colors.accent;
  navTheme.colors.text = theme.colors.text;

  return (
    <NavigationContainer linking={linking} theme={navTheme}>
      <RootDrawer />
    </NavigationContainer>
  );
};

const BootstrappedApp: React.FC = () => {
  useEffect(() => {
    const bootstrap = async () => {
      await initDatabase();
      await seed();
    };
    bootstrap().catch(error => {
      console.error('Failed to bootstrap database', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <GlobalErrorBoundary>
        <ToastProvider>
          <NavigationHost />
          <StatusBar style="light" />
        </ToastProvider>
      </GlobalErrorBoundary>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <BootstrappedApp />
    </ThemeProvider>
  );
}
