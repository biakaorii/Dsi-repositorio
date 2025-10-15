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
    borderRadius: 15, // igual ao seu cadastro
    marginBottom: 15,
    alignItems: 'center',
  },
  profileButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2E8B57', // borda verde
  },
  profileButtonText: {
    color: '#2E8B57', // texto verde
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#2E8B57', // fundo verde
    borderColor: 'transparent',
  },
  buttonText: {
    color: '#fff', // texto branco para o botão verde
    fontSize: 18,
    fontWeight: 'bold',
  },
});