// app/entrepreneur-form.tsx
import React, { useState } from 'react';
import { router, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';


const EntrepreneurFormScreen = () => {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!businessName || !cnpj || !address) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Preencha todos os campos!',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    setLoading(true);

    // Salvar as informações do negócio no perfil do usuário
    const result = await updateUser({
      businessName,
      cnpj,
      address,
      profileType: 'empreendedor',
    });

    setLoading(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Informações do negócio salvas!',
        visibilityTime: 2500,
        autoHide: true,
        topOffset: 50,
      });
      
      setTimeout(() => {
        router.replace('/home');
      }, 1000);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: result.error || 'Não foi possível salvar',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações adicionais</Text>

      <Text style={styles.sectionTitle}>Dados do seu negócio</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do estabelecimento"
        value={businessName}
        onChangeText={setBusinessName}
      />
      <TextInput
        style={styles.input}
        placeholder="CNPJ"
        value={cnpj}
        onChangeText={setCnpj}
      />
      <TextInput
        style={styles.input}
        placeholder="Endereço"
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Continuar</Text>
        )}
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EntrepreneurFormScreen;