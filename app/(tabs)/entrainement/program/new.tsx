import {
  PanResponder,
  ScrollView as RNScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  saveDraft,
  getDraft,
  clearDraft,
  saveProgram,
  setActiveProgram,
} from '../../../../utils/storage/programs';
import type { Session, DayKey, Program } from '../../../../types/program';

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'] as const;

const EMPTY_DAYS: Record<DayKey, Session[]> = {
  LUN: [],
  MAR: [],
  MER: [],
  JEU: [],
  VEN: [],
  SAM: [],
  DIM: [],
};

export default function NewProgramScreen() {
  const { bottom } = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<Record<DayKey, Session[]>>({ ...EMPTY_DAYS });
  const [isEditing, setIsEditing] = useState(false);
  const editingProgramIdRef = useRef<string | null>(null);
  const editingCreatedAtRef = useRef<number | null>(null);
  const [activeDragDay, setActiveDragDay] = useState<DayKey | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountRef = useRef(true);

  const dragRef = useRef<{ fromDay: DayKey | null; hoveredDay: DayKey | null }>({
    fromDay: null,
    hoveredDay: null,
  });
  const listPageYRef = useRef(0);
  const rowLayoutsRef = useRef<Record<string, { y: number; height: number }>>({});
  const listRef = useRef<RNScrollView>(null);

  useEffect(() => {
    const draft = getDraft();
    if (draft) {
      if (draft.title) setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
      if (draft.days) setDays(draft.days);
      if (draft.id) editingProgramIdRef.current = draft.id;
      if (draft.createdAt) editingCreatedAtRef.current = draft.createdAt;
    }
    isMountRef.current = false;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const draft = getDraft();
      if (draft?.days) {
        setDays(draft.days);
      }
    }, [])
  );

  useEffect(() => {
    if (isMountRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft({ title, description });
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, description]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = (activate: boolean) => {
    const now = Date.now();
    const program: Program = {
      id: editingProgramIdRef.current ?? now.toString(),
      title: title.trim() || 'Programme sans nom',
      description,
      createdAt: editingCreatedAtRef.current ?? now,
      updatedAt: now,
      days,
    };
    saveProgram(program);
    if (activate) {
      setActiveProgram(program.id);
    }
    clearDraft();
    setShowSaveModal(false);
    router.back();
  };

  const handleDeleteSession = (day: DayKey) => {
    setDays((prev) => {
      const next = { ...prev };
      next[day] = [];
      return next;
    });
  };

  const getHoveredDay = (screenMoveY: number): DayKey | null => {
    for (const day of DAYS) {
      const layout = rowLayoutsRef.current[day];
      if (!layout) continue;
      const rowTop = listPageYRef.current + layout.y;
      const rowBottom = rowTop + layout.height;
      if (screenMoveY >= rowTop && screenMoveY < rowBottom) {
        return day;
      }
    }
    return null;
  };

  const panResponders = useMemo(() => {
    const result: Record<string, ReturnType<typeof PanResponder.create>> = {};
    for (const day of DAYS) {
      result[day] = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragRef.current.fromDay = day;
          dragRef.current.hoveredDay = day;
          setActiveDragDay(day);
          // @ts-expect-error - measure exists on ScrollView native ref
          listRef.current?.measure(
            (_x: number, _y: number, _w: number, _h: number, _px: number, pageY: number) => {
              listPageYRef.current = pageY;
            }
          );
        },
        onPanResponderMove: (_evt, gestureState) => {
          const screenMoveY = gestureState.moveY;
          const hovered = getHoveredDay(screenMoveY);
          if (hovered) {
            dragRef.current.hoveredDay = hovered;
          }
        },
        onPanResponderRelease: () => {
          const { fromDay, hoveredDay } = dragRef.current;
          if (fromDay && hoveredDay && fromDay !== hoveredDay) {
            setDays((prev) => {
              const next = { ...prev };
              const session = next[fromDay][0];
              if (session) {
                next[fromDay] = [];
                next[hoveredDay] = [session];
              }
              return next;
            });
          }
          dragRef.current.fromDay = null;
          dragRef.current.hoveredDay = null;
          setActiveDragDay(null);
        },
        onPanResponderTerminate: () => {
          dragRef.current.fromDay = null;
          dragRef.current.hoveredDay = null;
          setActiveDragDay(null);
        },
      });
    }
    return result;
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <BlurView tint="systemMaterial" intensity={80} style={styles.backButton}>
          <Pressable onPress={handleBack} style={styles.backButtonInner} testID="back-button">
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
        </BlurView>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          style={styles.modifierButton}
          activeOpacity={0.7}
          testID="modifier-button"
          onPress={() => setIsEditing((prev) => !prev)}
        >
          <Text style={styles.modifierText}>{isEditing ? 'Terminé' : 'Modifier'}</Text>
        </TouchableOpacity>
      </View>

      <RNScrollView
        ref={listRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!activeDragDay}
        onLayout={() => {
          // @ts-expect-error - measure exists on ScrollView native ref
          listRef.current?.measure(
            (_x: number, _y: number, _w: number, _h: number, _px: number, pageY: number) => {
              listPageYRef.current = pageY;
            }
          );
        }}
        testID="days-list"
      >
        <View style={styles.inputsContainer}>
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
        </View>

        <View style={styles.daysContainer}>
          {DAYS.map((day) => {
            const session = days[day][0] ?? null;
            return (
              <View
                key={day}
                testID={`day-block-${day}`}
                style={[styles.dayRow, activeDragDay === day && styles.dayBlockDragging]}
                onLayout={(e) => {
                  rowLayoutsRef.current[day] = {
                    y: e.nativeEvent.layout.y,
                    height: e.nativeEvent.layout.height,
                  };
                }}
              >
                <Text style={styles.dayLabel}>{day}</Text>

                {session ? (
                  <TouchableOpacity
                    style={styles.sessionCard}
                    activeOpacity={0.7}
                    testID={`session-card-${session.id}`}
                    onPress={() =>
                      router.push({
                        pathname: '/entrainement/program/session/new',
                        params: { day, sessionId: session.id },
                      })
                    }
                  >
                    <View {...panResponders[day].panHandlers} style={styles.dragHandle}>
                      <MaterialCommunityIcons name="drag-vertical" size={20} color="#4C4C4E" />
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.sessionExerciseCount}>
                        {session.exercises.length} exercice
                        {session.exercises.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    {isEditing && (
                      <TouchableOpacity
                        onPress={() => handleDeleteSession(day)}
                        testID={`delete-session-${day}`}
                        activeOpacity={0.7}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.addSessionCard}
                    activeOpacity={0.7}
                    testID={`add-session-${day}`}
                    onPress={() =>
                      router.push({
                        pathname: '/entrainement/program/session/new',
                        params: { day },
                      })
                    }
                  >
                    <Ionicons name="add" size={16} color="#5A5A5E" />
                    <Text style={styles.addSessionText}>Ajouter une séance</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </RNScrollView>

      <View style={[styles.saveContainer, { paddingBottom: bottom + 60 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.7}
          testID="save-program-button"
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Enregistrer le programme</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
        testID="save-modal"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>UTILISER CE PROGRAMME ?</Text>
            <Text style={styles.modalSubtitle}>
              Veux-tu utiliser ce programme comme ton programme actif ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonLater}
                activeOpacity={0.8}
                testID="save-modal-later"
                onPress={() => handleConfirmSave(false)}
              >
                <Text style={styles.modalButtonLaterText}>Plus tard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonActivate}
                activeOpacity={0.8}
                testID="save-modal-activate"
                onPress={() => handleConfirmSave(true)}
              >
                <Text style={styles.modalButtonActivateText}>Oui, activer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerSpacer: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  inputsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingVertical: 6,
  },
  descriptionInput: {
    color: '#8E8E93',
    fontSize: 14,
    paddingVertical: 4,
    marginBottom: 12,
  },
  daysContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayBlockDragging: {
    opacity: 0.4,
  },
  dayLabel: {
    width: 36,
    fontSize: 12,
    fontWeight: '700',
    color: '#6C6C70',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  sessionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
    minHeight: 62,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  sessionExerciseCount: {
    color: '#6C6C70',
    fontSize: 12,
    marginTop: 2,
  },
  addSessionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 6,
    minHeight: 62,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#3A3A3C',
  },
  addSessionText: {
    color: '#5A5A5E',
    fontSize: 14,
  },
  deleteButton: {
    padding: 2,
  },
  dragHandle: {
    paddingHorizontal: 2,
  },
  saveContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: '#0070D4',
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonLater: {
    flex: 1,
    backgroundColor: '#3C3C3E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonLaterText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonActivate: {
    flex: 1,
    backgroundColor: '#0070D4',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonActivateText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
