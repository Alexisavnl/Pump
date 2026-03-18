import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NewSessionScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          testID="back-button"
        >
          <Ionicons name="chevron-back" size={28} color="#0070D4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier la séance</Text>
        {day ? (
          <Text style={styles.dayLabel} testID="day-label">
            {day}
          </Text>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0070D4',
  },
  headerSpacer: {
    width: 40,
  },
});
