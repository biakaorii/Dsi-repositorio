import React, { JSX, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  TextStyle, 
  ViewStyle,
  Image 
} from "react-native";

import { StatusBar } from "expo-status-bar";

export default function App(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  

  const handleLogin = (): void => {
    console.log("Email:", email);
    console.log("Senha:", password);
    
  };

  return (
    <View style={styles.container}>
      <Image style={styles.icon} source={require('./assets/icone.png')} />

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
      
      <TouchableOpacity>
        <Text style={styles.link}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>


      <Text style={styles.cadastro}>Não tem uma conta?</Text>

      <TouchableOpacity>
        <Text style={styles.cadastrolink}>Cadastre-se</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

type Styles = {
  container: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  input: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  link: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20, 
    backgroundColor: "#fbfbf9f9" 
  },
  
  icon: {
  width: 148,
  height: 98,
  marginLeft: 20,
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
});
