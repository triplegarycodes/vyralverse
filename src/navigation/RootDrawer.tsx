// Step 6: Navigation shell — drawer + nested tabs with neon header
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNeonTheme } from '../theme/ThemeProvider';
import { CoreScreen } from '../screens/Core';
import { LyfeScreen } from '../screens/Lyfe';
import { StrykeScreen } from '../screens/Stryke';
import { TreeScreen } from '../screens/Tree';
import { ZoneScreen } from '../screens/Zone';
import { SkrybeScreen } from '../screens/Skrybe';
import { SettingsScreen } from '../screens/Settings';
import { NeonGlyph } from '../components/NeonGlyph';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { theme } = useNeonTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surfaceAlt,
          borderTopColor: theme.colors.border
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarIcon: () => <NeonGlyph label={getGlyphForRoute(route.name)} size={16} />
      })}
    >
      <Tab.Screen name="Core" component={CoreScreen} />
      <Tab.Screen name="Lyfe" component={LyfeScreen} />
      <Tab.Screen name="Stryke" component={StrykeScreen} />
    </Tab.Navigator>
  );
};

const GradientHeader: React.FC<{ title: string }> = ({ title }) => {
  const { top } = useSafeAreaInsets();
  const { theme } = useNeonTheme();
  return (
    <LinearGradient
      colors={[theme.colors.surfaceAlt, 'transparent']}
      style={[styles.header, { paddingTop: top + 16 }]}
    >
      <Text style={[styles.headerText, { color: theme.colors.text }]}>{title}</Text>
    </LinearGradient>
  );
};

const CustomDrawerContent = (props: any) => {
  const { theme } = useNeonTheme();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <LinearGradient colors={[theme.colors.surfaceAlt, 'transparent']} style={{ padding: 24 }}>
        <View style={styles.drawerIcon}>
          <NeonGlyph label="V" size={22} />
        </View>
        <Text style={[styles.drawerTitle, { color: theme.colors.text }]}>Vyral Verse</Text>
        <Text style={{ color: theme.colors.textMuted }}>Neon OS shell</Text>
      </LinearGradient>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const glyphMap: Record<string, string> = {
  Core: 'C',
  Lyfe: 'L',
  Stryke: '⚔',
  Tree: 'T',
  Zone: 'Z',
  Skrybe: 'S',
  Settings: '⚙',
  Modules: 'M'
};

const getGlyphForRoute = (name: string) => glyphMap[name] ?? '◎';

export const RootDrawer: React.FC = () => {
  const { theme } = useNeonTheme();
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: ({ route }) => <GradientHeader title={route.name} />,
        drawerActiveTintColor: theme.colors.accent,
        drawerInactiveTintColor: theme.colors.textMuted,
        drawerStyle: { backgroundColor: theme.colors.surface }
      }}
    >
      <Drawer.Screen
        name="Modules"
        component={TabNavigator}
        options={{ drawerIcon: () => <NeonGlyph label={getGlyphForRoute('Modules')} size={16} /> }}
      />
      <Drawer.Screen
        name="Tree"
        component={TreeScreen}
        options={{ drawerIcon: () => <NeonGlyph label={getGlyphForRoute('Tree')} size={16} /> }}
      />
      <Drawer.Screen
        name="Zone"
        component={ZoneScreen}
        options={{ drawerIcon: () => <NeonGlyph label={getGlyphForRoute('Zone')} size={16} /> }}
      />
      <Drawer.Screen
        name="Skrybe"
        component={SkrybeScreen}
        options={{ drawerIcon: () => <NeonGlyph label={getGlyphForRoute('Skrybe')} size={16} /> }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ drawerIcon: () => <NeonGlyph label={getGlyphForRoute('Settings')} size={16} /> }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700'
  },
  drawerIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700'
  }
});
