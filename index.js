import 'react-native-gesture-handler';
import React from 'react';
import { Platform, LogBox } from 'react-native';
import { registerRootComponent } from 'expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens, enableFreeze } from 'react-native-screens';
import App from './App';

// Optimize navigation performance by enabling screen primitives.
enableScreens(true);
if (typeof enableFreeze === 'function') {
  enableFreeze(true);
}

// Silence noisy but harmless warnings that clutter the neon debug console.
if (__DEV__) {
  LogBox.ignoreLogs([
    'AsyncStorage has been extracted from react-native',
    'ViewPropTypes will be removed',
  ]);

  if (Platform.OS === 'android') {
    LogBox.ignoreLogs([
      'Native splash screen is already hidden',
    ]);
  }
}

const Root = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <App />
  </GestureHandlerRootView>
);

registerRootComponent(Root);

export default Root;
