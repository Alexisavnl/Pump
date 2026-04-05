import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout } from '../../src/context/WorkoutContext';
import WorkoutScreen from '../workout/index';

function WorkoutBanner() {
  const { bottom } = useSafeAreaInsets();
  const { state, showWorkout, discardWorkout } = useWorkout();
  const { active } = state;

  if (!active || state.isWorkoutVisible) return null;

  const elapsedSeconds = Math.round((Date.now() - active.startedAt) / 1000);
  const currentExercise =
    active.exercises.find((ex) => ex.sets.some((s) => !s.completed)) ?? active.exercises[0];

  function formatElapsed(s: number): string {
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}min` : `${s}s`;
  }

  return (
    <TouchableOpacity
      style={[styles.banner, { bottom: bottom + 56 }]}
      onPress={showWorkout}
      activeOpacity={0.95}
      testID="workout-banner"
    >
      <TouchableOpacity style={styles.bannerChevron} onPress={showWorkout}>
        <Ionicons name="chevron-up" size={18} color="#ffffff" />
      </TouchableOpacity>

      <View style={styles.bannerCenter}>
        <View style={styles.bannerTitleRow}>
          <View style={styles.greenDot} />
          <Text style={styles.bannerTitle}>Entraînement · {formatElapsed(elapsedSeconds)}</Text>
        </View>
        {currentExercise && (
          <Text style={styles.bannerSubtitle} numberOfLines={1}>
            {currentExercise.exerciseName}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.bannerTrash}
        onPress={discardWorkout}
        testID="banner-discard-button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color="#FF453A" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

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

      <WorkoutBanner />
      <WorkoutScreen />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerChevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3C3C3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCenter: {
    flex: 1,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#30D158',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  bannerTrash: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3C3C3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
