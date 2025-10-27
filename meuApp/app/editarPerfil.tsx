// app/editarPerfil.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePhoto } from '@/utils/uploadProfilePhoto';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();

  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [generosFavoritos, setGenerosFavoritos] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Preencher os campos quando o usuário for carregado
  useEffect(() => {
    if (user) {
      setNome(user.name || "");
      setBio(user.bio || "");
      setGenerosFavoritos(user.genres?.join(", ") || "");
      setProfileImage(user.profilePhotoUrl || null);
    }
  }, [user]);

  // Solicitar permissões para a galeria
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'É necessário permitir o acesso à galeria para alterar a foto de perfil.');
      return false;
    }
    return true;
  };

  // Selecionar imagem da galeria
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const salvarPerfil = async () => {
    if (!user) return;

    setUploading(true);

    // Converter gêneros de string para array
    const genresArray = generosFavoritos
      .split(",")
      .map(g => g.trim())
      .filter(g => g.length > 0);

    try {
      let photoUrl = user.profilePhotoUrl;

      // Se há uma nova imagem, fazer upload
      if (profileImage && profileImage !== user.profilePhotoUrl) {
        const uploadedUrl = await uploadProfilePhoto(profileImage, user.uid);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        } else {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível fazer upload da foto.',
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
          });
        }
      }

      await updateUser({
        name: nome,
        bio: bio,
        genres: genresArray,
        profilePhotoUrl: photoUrl,
      });

      Toast.show({
        type: 'success',
        text1: 'Perfil Atualizado',
        text2: 'Suas informações foram salvas com sucesso!',
        visibilityTime: 2500,
        autoHide: true,
        topOffset: 50,
      });
      
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar as alterações.',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    } finally {
      setUploading(false);
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
        <TouchableOpacity onPress={salvarPerfil} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : (
            <Text style={styles.saveButton}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Foto de Perfil */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Foto de Perfil</Text>
          <View style={styles.photoContainer}>
            <Image
              source={{
                uri: profileImage || "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small/user-icon-on-transparent-background-free-png.png",
              }}
              style={styles.profilePhoto}
            />
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={pickImage}
              disabled={uploading}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.changePhotoText}>
                {uploading ? "Enviando..." : "Alterar Foto"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
        <TouchableOpacity 
          style={[styles.saveButtonMain, uploading && styles.saveButtonMainDisabled]} 
          onPress={salvarPerfil}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Toast />
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

  photoSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
  },
  photoContainer: {
    alignItems: "center",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#2E7D32",
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  changePhotoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
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
  saveButtonMainDisabled: {
    backgroundColor: "#A5D6A7",
    opacity: 0.6,
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
