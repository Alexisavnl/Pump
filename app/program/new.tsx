import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'] as const;

export default function NewProgramScreen() {
  const [title, setTitle] = useState('Push Pull Legs');
  const [description, setDescription] = useState('');

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
        <Text style={styles.headerTitle}>Nouveau Programme</Text>
        <TouchableOpacity
          style={styles.modifierButton}
          activeOpacity={0.7}
          testID="modifier-button"
        >
          <Text style={styles.modifierText}>Modifier</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Nom du programme"
          placeholderTextColor="#6C6C70"
          testID="program-title-input"
        />

        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Organise ta semaine d'entraînement"
          placeholderTextColor="#6C6C70"
          multiline
          testID="program-description-input"
        />

        <View style={styles.daysContainer}>
          {DAYS.map((day) => (
            <View key={day} style={styles.dayBlock} testID={`day-block-${day}`}>
              <Text style={styles.dayLabel}>{day}</Text>
              <TouchableOpacity
                style={styles.addSessionButton}
                activeOpacity={0.7}
                testID={`add-session-${day}`}
              >
                <Ionicons name="add" size={20} color="#0070D4" />
                <Text style={styles.addSessionText}>Ajouter une séance</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.7}
          testID="save-program-button"
        >
          <Text style={styles.saveButtonText}>Enregistrer le programme</Text>
        </TouchableOpacity>
      </ScrollView>
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
  modifierButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modifierText: {
    fontSize: 16,
    color: '#0070D4',
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    marginTop: 8,
  },
  descriptionInput: {
    fontSize: 15,
    color: '#8E8E93',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    marginBottom: 24,
    minHeight: 40,
  },
  daysContainer: {
    gap: 12,
  },
  dayBlock: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6C6C70',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  addSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#0070D4',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 4,
  },
  addSessionText: {
    fontSize: 14,
    color: '#0070D4',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#0070D4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
