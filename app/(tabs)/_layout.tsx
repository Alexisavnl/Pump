import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS } from 'react-native';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';

export default function TabsLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <NativeTabs
        tintColor={DynamicColorIOS({
          dark: '#0070D4',
          light: '#0070D4',
        })}
        labelStyle={{
          default: {
            color: DynamicColorIOS({
              dark: '#FFFFFF',
              light: '#FFFFFF',
            }),
          },
          selected: {
            color: DynamicColorIOS({
              dark: '#0070D4',
              light: '#0070D4',
            }),
          },
        }}
      >
        <NativeTabs.Trigger name="accueil">
          <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="home" />
          <Label>Accueil</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="entrainement">
          <Icon
            sf={{
              default: 'figure.strengthtraining.traditional',
              selected: 'figure.strengthtraining.traditional',
            }}
            drawable="fitness_center"
          />
          <Label>Entraînement</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Icon sf={{ default: 'person', selected: 'person.fill' }} drawable="person" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
