import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router'; 

export default function RecuperarSenhaScreenVisual() {
  const [email, setEmail] = useState('');
  // NOVOS ESTADOS para as senhas
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const router = useRouter();

  const handleRedefinirSenha = () => {
    
    if (!novaSenha || !confirmarSenha) {
      Alert.alert('Atenção', 'Por favor, preencha os campos da nova senha.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    
    console.log('E-mail:', email);
    console.log('Nova Senha:', novaSenha);
    Alert.alert('Sucesso!', 'Sua senha foi redefinida.');
    router.push('/login'); 
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.screenLabel}>Redefinir Senha</Text>

        <Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>E-mail cadastrado</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#8a8a8a"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          
          <Text style={styles.fieldLabel}>Nova senha</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#8a8a8a"
            value={novaSenha}
            onChangeText={setNovaSenha}
            secureTextEntry 
          />

          
          <Text style={styles.fieldLabel}>Confirmar nova senha</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#8a8a8a"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry // Esconde a senha
          />

          
          <TouchableOpacity style={styles.button} onPress={handleRedefinirSenha}>
            <Text style={styles.buttonText}>REDEFINIR SENHA</Text>
          </TouchableOpacity>

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Voltar para o login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  screenLabel: {
    position: 'absolute',
    top: 40,
    left: 28,
    color: '#bfbfbf',
    fontSize: 13,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 10, 
    color: '#4b4b4b',
    fontSize: 13,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: '#f3f9ea',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e6d0',
    color: '#0b2f1a',
  },
  button: {
    width: '100%',
    height: 44,
    backgroundColor: '#2f7b45',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 14,
    padding: 5,
  },
  secondaryText: {
    color: '#2f7b45',
    fontWeight: '600',
  },
});