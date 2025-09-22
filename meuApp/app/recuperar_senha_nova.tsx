import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import {Link } from "expo-router";

export default function RecuperarSenhaNova() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Recuperar senha</Text>
      <Text style={styles.subtitle}>Redefina sua senha</Text>

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#8a8a8a"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirme a senha"
        placeholderTextColor="#8a8a8a"
        secureTextEntry
      />

      <View style={styles.rules}>
        <Text style={styles.rulesText}>A senha deve conter:</Text>
        <Text style={styles.rulesText}>• Letras maiúsculas</Text>
        <Text style={styles.rulesText}>• Números</Text>
        <Text style={styles.rulesText}>• Letras minúsculas</Text>
        <Text style={styles.rulesText}>• Um caracter especial</Text>
      </View>
    <Link href={'/login'} asChild>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Definir senha</Text>
      </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', padding: 28,
  },

  logo: { width: 120, height: 120, marginBottom: 40 },

  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },

  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20 },


  rules: { alignSelf: 'flex-start', marginBottom: 15 },

  rulesText: { fontSize: 13, color: '#333', paddingLeft: 30, fontWeight: 'bold'},

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
});
