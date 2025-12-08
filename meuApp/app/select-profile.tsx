// app/select-profile.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStyles, Colors } from '../styles/theme';

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
        // rota opcional para formulário de crítico — usar cast para evitar tipos gerados do router
        router.push('/critic-form' as any); // opcional
        break;
      default:
        break;
    }
  };

  return (
    <View style={[GlobalStyles.screenContainer, styles.container]}>
      <Text style={[GlobalStyles.heading, styles.title]}>Selecione seu perfil</Text>

      <TouchableOpacity
        style={[styles.button, styles.profileButton]}
        onPress={() => handleSelect('leitor')}
      >
        <Text style={[styles.buttonText, styles.profileButtonText]}>Leitor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.profileButton]}
        onPress={() => handleSelect('empreendedor')}
      >
        <Text style={[styles.buttonText, styles.profileButtonText]}>Empreendedor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.profileButton]}
        onPress={() => handleSelect('critico')}
      >
        <Text style={[styles.buttonText, styles.profileButtonText]}>Crítico</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.continueButton]}
        onPress={() => { 
          router.push('/home')
        }}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
  },
  title: {
    marginBottom: 40,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  profileButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#2E8B57',
  },
  profileButtonText: {
    color: '#2E8B57',
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#2E8B57',
    borderColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});