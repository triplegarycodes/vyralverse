import 'react-native-gesture-handler';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, OpenSans_400Regular } from '@expo-google-fonts/open-sans';
import { AppNavigator } from './src/navigation/AppNavigator';
import { VOID_BLACK, EMBER_ORANGE } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({ OpenSans_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: VOID_BLACK, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={EMBER_ORANGE} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
