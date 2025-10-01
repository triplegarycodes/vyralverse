import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SparkScreen } from '../screens/SparkScreen';
import { CoreScreen } from '../screens/CoreScreen';
import { TreeScreen } from '../screens/TreeScreen';
import { BoardScreen } from '../screens/BoardScreen';
import { ZoneScreen } from '../screens/ZoneScreen';
import { OathScreen } from '../screens/OathScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { DailyOpsScreen } from '../screens/DailyOpsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Spark"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Spark" component={SparkScreen} />
      <Stack.Screen name="Core" component={CoreScreen} />
      <Stack.Screen name="Tree" component={TreeScreen} />
      <Stack.Screen name="Board" component={BoardScreen} />
      <Stack.Screen name="Zone" component={ZoneScreen} />
      <Stack.Screen name="Oath" component={OathScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="DailyOps" component={DailyOpsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
