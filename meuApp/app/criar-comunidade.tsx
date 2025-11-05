import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useComunidades } from "../contexts/ComunidadesContext";
import Toast from "react-native-toast-message";
import * as ImagePicker from 'expo-image-picker';
import { uploadCommunityPhoto } from '@/utils/uploadCommunityPhoto';

export default function CriarComunidadeScreen() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [communityImage, setCommunityImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { createComunidade } = useComunidades();

  // Solicitar permissões para a galeria
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'É necessário permitir o acesso à galeria para selecionar uma foto.');
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
        aspect: [1, 1], // Formato quadrado/circular
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setCommunityImage(result.assets[0].uri);
        Toast.show({
          type: 'success',
          text1: 'Foto Selecionada! ✓',
          text2: 'A foto será adicionada à comunidade',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 50,
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleCriarComunidade = async () => {
    setLoading(true);

    let photoURL: string | undefined = undefined;

    // Se há uma imagem selecionada, fazer upload primeiro
    if (communityImage) {
      // Gera um ID temporário para usar no upload
      const tempId = `temp_${Date.now()}`;
      const uploadedUrl = await uploadCommunityPhoto(communityImage, tempId);
      
      if (uploadedUrl) {
        photoURL = uploadedUrl;
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível fazer upload da foto',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 50,
        });
        setLoading(false);
        return;
      }
    }

    const result = await createComunidade(nome, descricao, photoURL);

    setLoading(false);

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Comunidade criada com sucesso!",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });

      router.back();
    } else {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: result.error || "Erro ao criar comunidade",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Comunidade</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          {/* Seção de Ícone */}
          <View style={styles.photoSection}>
            <Text style={styles.label}>Ícone da Comunidade (Opcional)</Text>
            <View style={styles.photoContainer}>
              {communityImage ? (
                <Image 
                  source={{ uri: communityImage }} 
                  style={styles.communityIcon}
                />
              ) : (
                <View style={styles.placeholderIcon}>
                  <Ionicons name="people" size={48} color="#2E7D32" />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.selectPhotoButton}
              onPress={pickImage}
              disabled={loading}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.selectPhotoText}>
                {communityImage ? 'Alterar Ícone' : 'Selecionar Ícone'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.photoHint}>
              Escolha uma imagem redonda para o ícone da comunidade
            </Text>
          </View>

          <Text style={styles.label}>Nome da Comunidade *</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            editable={!loading}
            maxLength={50}
          />

          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva sobre o que é essa comunidade..."
            value={descricao}
            onChangeText={setDescricao}
            editable={!loading}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />

          <Text style={styles.charCount}>
            {descricao.length}/300 caracteres
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCriarComunidade}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Criar Comunidade</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  placeholder: {
    width: 34,
  },
  form: {
    padding: 20,
  },
  photoSection: {
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  communityIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  placeholderIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#E9ECEF",
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  selectPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  selectPhotoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  photoHint: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
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
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    textAlign: "right",
    color: "#999",
    fontSize: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2E8B57",
    borderRadius: 15,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
