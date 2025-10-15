// app/entrepreneur-form.tsx
import React, { useState } from 'react';
import { router, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';


const EntrepreneurFormScreen = () => {
    const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = () => {
    if (!businessName || !cnpj || !address) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    console.log({
      businessName,
      cnpj,
      address,
      profileType: 'empreendedor',
    });

    Alert.alert('Sucesso!', 'Cadastro finalizado com sucesso!');
    router.replace('/home');
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

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Continuar</Text>
      </TouchableOpacity>
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
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EntrepreneurFormScreen;