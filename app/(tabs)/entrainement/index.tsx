import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import {
  getAllPrograms,
  clearDraft,
  getActiveProgram,
  deleteProgram,
  saveDraft,
} from '../../../utils/storage/programs';
import type { Program } from '../../../types/program';

function countWeeklySessions(days: Program['days']): number {
  return Object.values(days).filter((sessions) => sessions.length > 0).length;
}

export default function EntrainementScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [menuProgramId, setMenuProgramId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setPrograms(getAllPrograms());
      setActiveProgramId(getActiveProgram());
    }, [])
  );

  const handleNewProgram = () => {
    clearDraft();
    router.push('/entrainement/program/new');
  };

  const handleEditProgram = (program: Program) => {
    saveDraft(program);
    setMenuProgramId(null);
    router.push('/entrainement/program/new');
  };

  const handleDeleteProgram = (id: string) => {
    deleteProgram(id);
    setPrograms(getAllPrograms());
    setActiveProgramId(getActiveProgram());
    setMenuProgramId(null);
  };

  const menuProgram = programs.find((p) => p.id === menuProgramId) ?? null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Entraînement</Text>

        <TouchableOpacity
          style={styles.newProgramButton}
          onPress={handleNewProgram}
          activeOpacity={0.7}
          testID="new-program-button"
        >
          <View style={styles.newProgramIconWrapper}>
            <Ionicons name="add" size={20} color="#0070D4" />
          </View>
          <Text style={styles.newProgramText}>Nouveau Programme</Text>
        </TouchableOpacity>

        <View style={styles.programsSection}>
          <Text style={styles.sectionHeader}>MES PROGRAMMES</Text>
          {programs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun programme créé</Text>
            </View>
          ) : (
            <View>
              {programs.map((program) => {
                const isActive = program.id === activeProgramId;
                const sessionCount = countWeeklySessions(program.days);
                return (
                  <View
                    key={program.id}
                    style={[styles.programCard, isActive && styles.programCardActive]}
                    testID={`program-card-${program.id}`}
                  >
                    <View style={styles.programCardContent}>
                      <View style={styles.programInfo}>
                        <Text style={styles.programTitle}>{program.title}</Text>
                        <Text style={styles.programMeta}>
                          {sessionCount} séance{sessionCount !== 1 ? 's' : ''} / semaine
                        </Text>
                      </View>
                      <View style={styles.programCardRight}>
                        {isActive && (
                          <View style={styles.activeBadge} testID={`active-badge-${program.id}`}>
                            <Text style={styles.activeBadgeText}>ACTIF</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.menuButton}
                          testID={`program-menu-${program.id}`}
                          activeOpacity={0.7}
                          onPress={() => setMenuProgramId(program.id)}
                        >
                          <Ionicons name="ellipsis-horizontal" size={18} color="#8E8E93" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
      <Modal
        visible={!!menuProgram}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuProgramId(null)}
        testID="program-menu-modal"
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuProgramId(null)}
          testID="program-menu-backdrop"
        >
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle} numberOfLines={1}>
              {menuProgram?.title}
            </Text>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              testID="menu-edit-button"
              onPress={() => menuProgram && handleEditProgram(menuProgram)}
            >
              <Ionicons name="pencil-outline" size={20} color="#ffffff" />
              <Text style={styles.menuItemText}>Modifier le programme</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDestructive]}
              activeOpacity={0.7}
              testID="menu-delete-button"
              onPress={() => menuProgram && handleDeleteProgram(menuProgram.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.menuItemTextDestructive}>Supprimer le programme</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 24,
  },
  newProgramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#0070D4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  newProgramIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 112, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newProgramText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0070D4',
  },
  programsSection: {
    marginTop: 28,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6C6C70',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  programCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#3C3C3E',
    marginBottom: 12,
    padding: 16,
  },
  programCardActive: {
    borderColor: '#0070D4',
  },
  programCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  programMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  programCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeBadge: {
    backgroundColor: '#0070D4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuButton: {
    padding: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  menuCard: {
    backgroundColor: '#2C2C2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 4,
  },
  menuTitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  menuItemDestructive: {
    marginTop: 4,
  },
  menuItemText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  menuItemTextDestructive: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
});
