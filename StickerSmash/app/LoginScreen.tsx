import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenProps = {
  onLogin: () => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (email === '' || password === '') {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    onLogin();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <Pressable
          style={styles.icon}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#666"
          />
        </Pressable>
      </View>
      <TouchableOpacity>
        <Text style={styles.forgot}>Esqueceu a senha?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>
      <Text style={styles.or}>ou</Text>
      <TouchableOpacity style={styles.googleButton}>
        <Image
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
          }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleButtonText}>continue com o google</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.register}>
          Novo usuário? <Text style={styles.registerLink}>Cadastrar</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  icon: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  forgot: {
    alignSelf: 'flex-start',
    color: '#6b7280',
    marginBottom: 24,
    textDecorationLine: 'underline',
    fontSize: 15,
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#6b2328',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  or: {
    marginVertical: 8,
    color: '#6b7280',
    fontSize: 15,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#6b2328',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#6b2328',
    fontWeight: '500',
    fontSize: 16,
    textTransform: 'lowercase',
  },
  register: {
    color: '#6b2328',
    fontSize: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  registerLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
