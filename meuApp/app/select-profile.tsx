// app/select-profile.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SelectProfileScreen() {
  const router = useRouter();

  const handleSelect = (profile: string) => {
    switch (profile) {
      case 'leitor':
        router.push('/reader-form');
        break;
      case 'empreendedor':
        router.push('/entrepreneur-form');
        break;
      case 'critico':
        // Se quiser implementar depois
        router.push('/critic-form'); // opcional
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione seu perfil</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSelect('leitor')}
      >
        <Text style={styles.buttonText}>Leitor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSelect('empreendedor')}
      >
        <Text style={styles.buttonText}>Empreendedor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSelect('critico')}
      >
        <Text style={styles.buttonText}>Crítico</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.continueButton]}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#4CAF50',
    fontSize: 18,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    borderColor: 'transparent',
  },
});