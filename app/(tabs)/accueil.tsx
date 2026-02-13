import { View, Text, StyleSheet } from 'react-native';

export default function AccueilScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Accueil</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
  },
});
