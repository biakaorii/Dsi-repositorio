// app/login.tsx
import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ActivityIndicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, Link } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha todos os campos',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    setLoading(true);
    
    const result = await signIn(email, password);
    
    setLoading(false);

    if (result.success) {
      router.replace("/home");
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: result.error || 'Erro ao fazer login',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.icon} source={require("../assets/images/icon.png")} />

      <TextInput
        style={styles.input}
        placeholder="Insira o seu e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Insira a sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <Link href="/recuperar_senha" style={styles.forgotPasswordLink}>
        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
      </Link>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.cadastro}>Não tem uma conta?</Text>

      <TouchableOpacity onPress={() => router.push("/cadastro")} disabled={loading}>
        <Text style={styles.cadastrolink}>Cadastre-se</Text>
      </TouchableOpacity>

      <Toast />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20, 
    backgroundColor: "#fbfbf9f9" 
  },
  icon: {
    width: 148,
    height: 98,
    alignSelf: 'center',
    marginBottom: 50 
  },
  input: {
    width: 312,
    height: 45,
    alignSelf: 'center',
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    fontSize: 16,
    color: "#333",
  },
  button: {
    width: 312,
    height: 45,
    alignSelf: 'center',
    backgroundColor: "#2E8B57",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold",
  },
  cadastro: {
    alignSelf:'center',
    marginTop: 20,
  },
  cadastrolink: {
    color: "#03168F", 
    textAlign: "center",
    textDecorationLine: "underline",
    fontWeight: 'bold', 
  },
  forgotPasswordLink: {
    marginTop: 15,
    padding: 5,
    textAlign :'center',
  },
  forgotPasswordText: {
    color: '#2f7b45',
    fontWeight: '600',
    textAlign: 'center',
  },
});