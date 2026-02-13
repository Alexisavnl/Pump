import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Template data structure
interface Template {
  id: string;
  acronym: string;
  name: string;
  daysPerWeek: number | null;
}

const TEMPLATES: Template[] = [
  { id: 'ppl', acronym: 'PPL', name: 'Push Pull Legs', daysPerWeek: 6 },
  { id: 'fb1', acronym: 'FB', name: 'Full Body', daysPerWeek: 3 },
  { id: 'fb2', acronym: 'FB', name: 'Full Body', daysPerWeek: 3 },
  { id: 'bs', acronym: 'BS', name: 'Bro Split', daysPerWeek: 5 },
  { id: 'vierge', acronym: '', name: 'Vierge', daysPerWeek: null },
];

export default function NouveauProgrammeScreen() {
  const handleBack = () => {
    router.back();
  };

  const handleTemplateSelect = (template: Template) => {
    console.log('Template selected:', template);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header with back button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color="#0070D4" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.header}>NOUVEAU PROGRAMME</Text>
            <Text style={styles.subtitle}>Choisis une template</Text>
          </View>
        </View>

        {/* Template grid - 2 columns */}
        <View style={styles.templateGrid}>
          {TEMPLATES.map((template, index) => (
            <Pressable
              key={template.id}
              style={({ pressed }) => [
                styles.templateCard,
                index % 2 === 0 ? styles.templateCardLeft : styles.templateCardRight,
                pressed && styles.templateCardPressed,
              ]}
              onPress={() => handleTemplateSelect(template)}
            >
              {template.acronym ? (
                <>
                  <Text style={styles.templateAcronym}>{template.acronym}</Text>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDays}>{template.daysPerWeek} jours / semaine</Text>
                </>
              ) : (
                <Text style={styles.templateName}>{template.name}</Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 32,
  },
  backButton: {
    marginRight: 8,
    marginTop: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    marginTop: 4,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    flex: 1,
    minWidth: '47%',
    maxWidth: '48%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0070D4',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  templateCardLeft: {
    marginRight: 6,
  },
  templateCardRight: {
    marginLeft: 6,
  },
  templateCardPressed: {
    opacity: 0.7,
  },
  templateAcronym: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0070D4',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  templateDays: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
});
