// app/recuperar_senha.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebaseConfig'; // ✅ Ajuste o caminho se necessário

const RecuperarSenha = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const showError = (message: string) => {
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
      bottomOffset: 40,
    });
  };

  const handleSendResetEmail = async () => {
    if (!email.includes('@')) {
      showError('Por favor, insira um e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      // ✅ Envia e-mail de redefinição diretamente ao Firebase
      await sendPasswordResetEmail(auth, email);

      Toast.show({
        type: 'success',
        text1: 'E-mail enviado!',
        text2: 'Verifique sua caixa de entrada (e spam) para redefinir sua senha.',
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 50,
        bottomOffset: 40,
        onHide: () => {
          router.replace('/login');
        },
      });
    } catch (error: any) {
      console.error('Erro ao enviar e-mail:', error);
      let message = 'Não foi possível enviar o e-mail.';
      if (error.code === 'auth/user-not-found') {
        message = 'Nenhum usuário cadastrado com este e-mail.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'E-mail inválido.';
      } else if (error.code === 'auth/missing-email') {
        message = 'Por favor, digite um e-mail.';
      }
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Esqueceu sua senha?</Text>
      <Text style={styles.subtitle}>
        Digite seu e-mail e enviaremos um link seguro para redefinir sua senha.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSendResetEmail}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Enviar link de redefinição</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 20 }}
        onPress={() => router.push('/login')}
        disabled={loading}
      >
        <Text style={styles.backLink}>Voltar para o login</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fbfbf9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    paddingHorizontal: 20,
  },
  input: {
    width: 312,
    height: 45,
    alignSelf: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: 312,
    height: 45,
    alignSelf: 'center',
    backgroundColor: '#2E8B57',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backLink: {
    color: '#2E8B57',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default RecuperarSenha;