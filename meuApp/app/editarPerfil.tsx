// app/editarPerfil.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();

  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [generosFavoritos, setGenerosFavoritos] = useState("");

  // Preencher os campos quando o usuário for carregado
  useEffect(() => {
    if (user) {
      setNome(user.name || "");
      setBio(user.bio || "");
      setGenerosFavoritos(user.genres?.join(", ") || "");
    }
  }, [user]);

  const salvarPerfil = async () => {
    if (!user) return;

    // Converter gêneros de string para array
    const genresArray = generosFavoritos
      .split(",")
      .map(g => g.trim())
      .filter(g => g.length > 0);

    try {
      await updateUser({
        name: nome,
        bio: bio,
        genres: genresArray,
      });

      Alert.alert(
        "Perfil Atualizado",
        "Suas informações foram salvas com sucesso!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  // Mostrar loading enquanto carrega o usuário
  if (authLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

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

        {/* Campo Email (somente leitura) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={user.email}
            editable={false}
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
            placeholder="Conte um pouco sobre você..."
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
            placeholder="Ex: Fantasia, Romance"
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>Separe os gêneros por vírgula</Text>
        </View>

        {/* Botão Salvar Principal */}
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
  loadingContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#fff",
},

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
