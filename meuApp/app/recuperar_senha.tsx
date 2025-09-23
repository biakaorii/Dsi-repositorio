import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,} from 'react-native';
import { useRouter } from 'expo-router';

const RecuperarSenha = () => {
  const [step, setStep] = useState(1); // 1: email, 2: código, 3: nova senha
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();

  // Validação de senha
  const isValidPassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return false;
    }
    if (newPassword.length < 8) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 8 caracteres.');
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      Alert.alert('Erro', 'A senha deve conter pelo menos uma letra maiúscula.');
      return false;
    }
    if (!/[a-z]/.test(newPassword)) {
      Alert.alert('Erro', 'A senha deve conter pelo menos uma letra minúscula.');
      return false;
    }
    if (!/\d/.test(newPassword)) {
      Alert.alert('Erro', 'A senha deve conter pelo menos um número.');
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      Alert.alert('Erro', 'A senha deve conter pelo menos um caractere especial.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    switch (step) {
      case 1:
        if (!email.includes('@')) {
          Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
          return;
        }
        Alert.alert('Sucesso', 'Código enviado para seu e-mail!');
        setStep(2);
        break;
      case 2:
        if (code.length !== 4 || !/^\d+$/.test(code)) {
          Alert.alert('Erro', 'Código inválido.');
          return;
        }
        Alert.alert('Sucesso', 'Código verificado!');
        setStep(3);
        break;
      case 3:
        if (!isValidPassword()) return;
        Alert.alert('Sucesso', 'Senha redefinida com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              setEmail('');
              setCode('');
              setNewPassword('');
              setConfirmPassword('');
              router.push('/login'); // redirecionamento para login
            },
          },
        ]);
        break;
    }
  };

  const renderStep1 = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar senha</Text>
      <Text style={styles.subtitle}>
        Digite seu e-mail para receber o código de redefinição de senha
      </Text>
      <TextInput
        style={styles.input}
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleNextStep}>
        <Text style={styles.buttonText}>Enviar código</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar senha</Text>
      <Text style={styles.subtitle}>
        Digite o código de recuperação de senha
      </Text>
      <TextInput
        style={styles.input}
        placeholder="1234"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={4}
      />
      <TouchableOpacity style={styles.button} onPress={handleNextStep}>
        <Text style={styles.buttonText}>Confirmar Código</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar senha</Text>
      <Text style={styles.subtitle}>
        Redefina sua senha
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nova senha"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Text style={styles.passwordRules}>
        A senha deve conter:
        <Text style={styles.ruleItem}> • Letras maiúsculas</Text>
        <Text style={styles.ruleItem}> • Números</Text>
        <Text style={styles.ruleItem}> • Letras minúsculas</Text>
        <Text style={styles.ruleItem}> • Um caractere especial</Text>
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleNextStep}>
        <Text style={styles.buttonText}>Definir senha</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
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
    backgroundColor: '#EDF5C4',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#000',
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  passwordRules: {
    fontSize: 12,
    textAlign: 'left',
    marginTop: 10,
    color: '#666',
    width: 312,
    paddingHorizontal: 15,
    alignSelf: 'center',
  },
  ruleItem: {
    fontSize: 12,
    color: '#666',
  },
});

export default RecuperarSenha;