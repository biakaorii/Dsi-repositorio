import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EditarPerfilScreen() {
  const router = useRouter();
  
  // Estados para os campos do perfil
  const [nome, setNome] = useState("Rhuan Victor");
  const [email, setEmail] = useState("rhuan.victor@email.com");
  const [bio, setBio] = useState("Leitor ávido de ficção");
  const [generosFavoritos, setGenerosFavoritos] = useState("Fantasia, Romance, Suspense");

  const salvarPerfil = () => {
    // Aqui você pode implementar a lógica para salvar no banco de dados
    Alert.alert(
      "Perfil Atualizado",
      "Suas informações foram salvas com sucesso!",
      [
        {
          text: "OK",
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={salvarPerfil}>
          <Text style={styles.saveButton}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Campo Nome */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            placeholderTextColor="#999"
          />
        </View>

        {/* Campo Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>



        {/* Campo Bio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio / Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Conte um pouco sobre você e seus gostos literários"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        {/* Campo Gêneros Favoritos */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gêneros Favoritos</Text>
          <TextInput
            style={styles.input}
            value={generosFavoritos}
            onChangeText={setGenerosFavoritos}
            placeholder="Ex: Fantasia, Romance, Ficção Científica"
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>Separe os gêneros por vírgula</Text>
        </View>

        {/* Seção de Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações da Conta</Text>
          
          <TouchableOpacity style={styles.configOption}>
            <View style={styles.configOptionLeft}>
              <Ionicons name="lock-closed-outline" size={20} color="#333" />
              <Text style={styles.configText}>Alterar Senha</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Botão de Salvar Principal */}
        <TouchableOpacity style={styles.saveButtonMain} onPress={salvarPerfil}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#2E7D32" 
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },

  content: {
    flex: 1,
    padding: 20,
  },

  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    color: "#333",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },

  section: {
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },

  configOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 10,
  },
  configOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  configText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },

  saveButtonMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },

  bottomSpacing: {
    height: 20,
  },
});
