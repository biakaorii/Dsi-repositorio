// app/critic-form.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlobalStyles, Colors } from '../styles/theme';

export default function CriticFormScreen() {
  return (
    <View style={[GlobalStyles.screenContainer, styles.container]}>
      <Text style={[GlobalStyles.title, styles.title]}>Formulário de Crítico (em construção)</Text>
      <Text style={[GlobalStyles.subtitle, styles.subtitle]}>Esta rota existe apenas como placeholder para evitar erros de tipagem.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surface },
  title: { marginBottom: 8 },
  subtitle: { textAlign: 'center' },
});
