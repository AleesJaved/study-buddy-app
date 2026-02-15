import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View, TouchableOpacity } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  leaderboard: { active: 'trophy', inactive: 'trophy-outline' },
  school: { active: 'school', inactive: 'school-outline' },
  index: { active: 'timer', inactive: 'timer-outline' },
  chat: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  notes: { active: 'document-text', inactive: 'document-text-outline' },
};

function FrostedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const barRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && barRef.current) {
      const node = barRef.current as any;
      if (node.style) {
        node.style.backdropFilter = 'blur(50px)';
        node.style.webkitBackdropFilter = 'blur(50px)';
      }
    }
  }, []);

  return (
    <View ref={barRef} style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const icons = TAB_ICONS[route.name];
        if (!icons) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={22}
              color={focused ? '#4a4a5e' : '#b0b0be'}
            />
            {focused && (
              <View style={[styles.activeDot, { backgroundColor: '#4a4a5e' }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FrostedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
      <Tabs.Screen name="school" options={{ title: 'School' }} />
      <Tabs.Screen name="index" options={{ title: 'Timer' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="notes" options={{ title: 'Notes' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
    height: Platform.OS === 'ios' ? 84 : 60,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
