import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import exercisesData from '../../../data/exercises.json';
import exerciseImages from '../../../data/exerciseImages';
import type { Exercise } from '../../../types/exercise';

const exercises = exercisesData as Exercise[];

export default function AddExercisesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    router.back();
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
        <Text style={styles.headerTitle}>Ajouter des exercices</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Chercher un exercice..."
          placeholderTextColor="#888"
          testID="search-input"
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        initialNumToRender={exercises.length}
        renderItem={({ item }) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
              onPress={() => toggleSelection(item.id)}
              activeOpacity={0.7}
              testID={`exercise-item-${item.id}`}
            >
              {isSelected && (
                <View style={styles.selectionBorder} testID={`selection-border-${item.id}`} />
              )}
              <Image
                source={exerciseImages[item.imagePath]}
                style={styles.exerciseImage}
                testID={`exercise-image-${item.id}`}
              />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName} testID={`exercise-name-${item.id}`}>
                  {item.name}
                </Text>
                <Text style={styles.exerciseMuscle} testID={`exercise-muscle-${item.id}`}>
                  {item.muscleGroup}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        testID="exercise-list"
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  exerciseItemSelected: {
    backgroundColor: 'rgba(0, 112, 212, 0.08)',
  },
  selectionBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#0070D4',
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  exerciseImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseMuscle: {
    fontSize: 13,
    color: '#888',
  },
});
