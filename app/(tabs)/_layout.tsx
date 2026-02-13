import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
