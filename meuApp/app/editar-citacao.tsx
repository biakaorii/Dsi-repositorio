import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCitacoes } from "../contexts/CitacoesContext";
import Toast from "react-native-toast-message";

export default function EditarCitacaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updateCitacao } = useCitacoes();

  const [texto, setTexto] = useState(params.texto as string || "");
  const [pagina, setPagina] = useState(params.pagina as string || "");
  const [contexto, setContexto] = useState(params.contexto as string || "");
  const [loading, setLoading] = useState(false);

  const citacaoId = params.id as string;
  const livroTitulo = params.livroTitulo as string;
  const livroAutor = params.livroAutor as string;

  const handleSubmit = async () => {
    // Validações
    if (!texto.trim()) {
      Alert.alert("Erro", "Por favor, digite a citação");
      return;
    }

    if (!pagina.trim()) {
      Alert.alert("Erro", "Por favor, informe a página");
      return;
    }

    const paginaNum = parseInt(pagina);
    if (isNaN(paginaNum) || paginaNum < 1) {
      Alert.alert("Erro", "Por favor, informe um número de página válido");
      return;
    }

    setLoading(true);
    const result = await updateCitacao(citacaoId, {
      texto: texto.trim(),
      pagina: paginaNum,
      contexto: contexto.trim() || undefined,
    });
    setLoading(false);

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "Citação atualizada!",
        text2: "Suas alterações foram salvas",
        visibilityTime: 2000,
      });
      router.back();
    } else {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: result.error || "Não foi possível atualizar a citação",
        visibilityTime: 3000,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Citação</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Informação do Livro (não editável) */}
        <View style={styles.livroInfo}>
          <Ionicons name="book" size={20} color="#2E7D32" />
          <View style={styles.livroTexto}>
            <Text style={styles.livroTitulo}>{livroTitulo}</Text>
            <Text style={styles.livroAutor}>{livroAutor}</Text>
          </View>
        </View>

        {/* Citação */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Citação <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Digite a frase marcante..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={texto}
            onChangeText={setTexto}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{texto.length} caracteres</Text>
        </View>

        {/* Página */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Página <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 42"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={pagina}
            onChangeText={setPagina}
          />
        </View>

        {/* Contexto (Opcional) */}
        <View style={styles.section}>
          <Text style={styles.label}>Contexto (opcional)</Text>
          <Text style={styles.hint}>
            Adicione informações sobre o momento da história ou seu significado
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Ex: Momento em que o protagonista descobre a verdade..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={contexto}
            onChangeText={setContexto}
            textAlignVertical="top"
          />
        </View>

        {/* Botões */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Salvar</Text>
              </>
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
    color: "#2E7D32",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  livroInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  livroTexto: {
    flex: 1,
  },
  livroTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  livroAutor: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#F44336",
  },
  hint: {
    fontSize: 13,
    color: "#999",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
