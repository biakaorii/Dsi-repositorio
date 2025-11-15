// app/critic-form.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CriticFormScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formulário de Crítico (em construção)</Text>
      <Text style={styles.subtitle}>Esta rota existe apenas como placeholder para evitar erros de tipagem.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { color: '#666', textAlign: 'center' },
});
