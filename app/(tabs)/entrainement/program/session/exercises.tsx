import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import exercisesData from '../../../../../data/exercises.json';
import exerciseImages from '../../../../../data/exerciseImages';
import type { Exercise } from '../../../../../types/exercise';
import type { ExerciseConfig } from '../../../../../types/program';
import { saveTempExercises } from '../../../../../utils/storage/programs';

const exercises = exercisesData as Exercise[];

export default function AddExercisesScreen() {
  const { bottom } = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const addButtonAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef<Map<string, Animated.Value>>(new Map());

  const getItemAnim = (id: string) => {
    if (!itemAnims.current.has(id)) {
      itemAnims.current.set(id, new Animated.Value(0));
    }
    return itemAnims.current.get(id)!;
  };

  const filtered = exercises.filter((ex) => {
    const query = searchQuery.toLowerCase();
    return ex.nameEn.toLowerCase().includes(query) || ex.nameFr.toLowerCase().includes(query);
  });

  const handleBack = () => {
    router.back();
  };

  const toggleSelection = (id: string) => {
    const isCurrentlySelected = selectedIds.has(id);
    const anim = getItemAnim(id);

    Animated.spring(anim, {
      toValue: isCurrentlySelected ? 0 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySelected) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    Animated.spring(addButtonAnim, {
      toValue: selectedIds.size > 0 ? 1 : 0,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [selectedIds.size, addButtonAnim]);

  const selectedCount = selectedIds.size;
  const addButtonLabel =
    selectedCount === 1 ? 'Ajouter 1 exercice' : `Ajouter ${selectedCount} exercices`;

  const addButtonTranslateY = addButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BlurView tint="systemMaterial" intensity={80} style={styles.backButton}>
          <Pressable onPress={handleBack} style={styles.backButtonInner} testID="back-button">
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
        </BlurView>
        <Text style={styles.headerTitle}>Ajouter des exercices</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Chercher un exercice..."
            placeholderTextColor="#8E8E93"
            testID="search-input"
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        initialNumToRender={exercises.length}
        renderItem={({ item }) => {
          const isSelected = selectedIds.has(item.id);
          const anim = getItemAnim(item.id);
          const translateX = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          });

          return (
            <TouchableOpacity
              onPress={() => toggleSelection(item.id)}
              activeOpacity={0.7}
              testID={`exercise-item-${item.id}`}
            >
              <Animated.View
                style={[
                  styles.exerciseRow,
                  isSelected && styles.exerciseRowSelected,
                  { transform: [{ translateX }] },
                ]}
              >
                {isSelected && (
                  <View style={styles.selectionBorder} testID={`selection-border-${item.id}`} />
                )}
                <Image
                  source={exerciseImages[item.imageUrl]}
                  style={styles.exerciseImage}
                  testID={`exercise-image-${item.id}`}
                />
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName} testID={`exercise-name-${item.id}`}>
                    {item.nameEn}
                  </Text>
                  <Text style={styles.exerciseMuscle} testID={`exercise-muscle-${item.id}`}>
                    {item.primaryMuscleGroup}
                  </Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottom + 120 }]}
        testID="exercise-list"
      />

      <Animated.View
        style={[
          styles.addButtonContainer,
          {
            bottom: bottom + 60,
            opacity: addButtonAnim,
            transform: [{ translateY: addButtonTranslateY }],
          },
        ]}
        pointerEvents={selectedCount > 0 ? 'auto' : 'none'}
        testID="add-exercises-container"
      >
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          testID="add-exercises-button"
          onPress={() => {
            const configs: ExerciseConfig[] = exercises
              .filter((ex) => selectedIds.has(ex.id))
              .map((ex) => ({
                exerciseId: ex.id,
                exerciseName: ex.nameEn,
                imageUrl: ex.imageUrl,
                notes: '',
                restTime: null,
                repType: 'fixed',
                sets: [{ serieNumber: 1, kg: 0, reps: 0 }],
              }));
            saveTempExercises(configs);
            handleBack();
          }}
        >
          <Text style={styles.addButtonText}>{addButtonLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  backButtonInner: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerRight: {
    width: 36,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  exerciseRowSelected: {
    backgroundColor: 'rgba(0, 112, 212, 0.08)',
  },
  selectionBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#0070D4',
  },
  exerciseImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginRight: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 3,
  },
  exerciseMuscle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  listContent: {
    paddingTop: 4,
  },
  addButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
  },
  addButton: {
    backgroundColor: '#0070D4',
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
