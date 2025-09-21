import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from "react-native";
import { StatusBar } from "expo-status-bar";
 import { useRouter, Link } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleLogin = (): void => {
    console.log("Email:", email);
    console.log("Senha:", password);

    // depois tu pode trocar por validação de login
    router.push("/home"); 
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
      />

      <TextInput
        style={styles.input}
        placeholder="Insira a sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
 

            
      
      <Link href="/recuperar_senha" style={styles.forgotPasswordLink}>
        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
      </Link>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.cadastro}>Não tem uma conta?</Text>

      <TouchableOpacity onPress={() => router.push("/cadastro")}>
        <Text style={styles.cadastrolink}>Cadastre-se</Text>
      </TouchableOpacity>

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
    backgroundColor: "#EDF5C4",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#000",
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
  buttonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold",
  },
  link: { 
    color: "#727272", 
    textAlign: "center",
    textDecorationLine: "underline",
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
