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
import { useTheme } from "../contexts/ThemeContext";
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors } = useTheme();

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image style={styles.icon} source={require("../assets/images/icon.png")} />

      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
        placeholder="Insira o seu e-mail"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
        placeholder="Insira a sua senha"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <Link href="/recuperar_senha" style={styles.forgotPasswordLink}>
        <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Esqueceu a senha?</Text>
      </Link>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.success }, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.card} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.card }]}>Entrar</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.cadastro, { color: colors.textSecondary }]}>Não tem uma conta?</Text>

      <TouchableOpacity onPress={() => router.push("/cadastro")} disabled={loading}>
        <Text style={[styles.cadastrolink, { color: colors.primary }]}>Cadastre-se</Text>
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    width: 312,
    height: 45,
    alignSelf: 'center',
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: { 
    fontSize: 18, 
    fontWeight: "bold",
  },
  cadastro: {
    alignSelf:'center',
    marginTop: 20,
  },
  cadastrolink: {
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
    fontWeight: '600',
    textAlign: 'center',
  },
});