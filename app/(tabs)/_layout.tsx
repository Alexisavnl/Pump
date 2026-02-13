import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#1A1A1A',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint="dark"
              intensity={100}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
              }}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="accueil"
        options={{
          title: 'Accueil',
        }}
      />
      <Tabs.Screen
        name="entrainement"
        options={{
          title: 'Entraînement',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
