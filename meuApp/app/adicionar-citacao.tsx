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
import { useRouter } from "expo-router";
import { useCitacoes } from "../contexts/CitacoesContext";
import Toast from "react-native-toast-message";

// Lista simplificada de livros populares para o usuário escolher
const livrosPopulares = [
  {
    id: "percy-jackson-ladrao-raios",
    titulo: "Percy Jackson e o Ladrão de Raios",
    autor: "Rick Riordan",
    imagem: "https://covers.openlibrary.org/b/isbn/142313494X-L.jpg",
  },
  {
    id: "senhor-aneis-sociedade",
    titulo: "O Senhor dos Anéis: A Sociedade do Anel",
    autor: "J.R.R. Tolkien",
    imagem: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
  },
  {
    id: "harry-potter-pedra-filosofal",
    titulo: "Harry Potter e a Pedra Filosofal",
    autor: "J.K. Rowling",
    imagem: "https://covers.openlibrary.org/b/id/10521215-L.jpg",
  },
  {
    id: "1984",
    titulo: "1984",
    autor: "George Orwell",
    imagem: "https://covers.openlibrary.org/b/id/9281731-L.jpg",
  },
  {
    id: "pequeno-principe",
    titulo: "O Pequeno Príncipe",
    autor: "Antoine de Saint-Exupéry",
    imagem: "https://covers.openlibrary.org/b/id/240726-L.jpg",
  },
];

export default function AdicionarCitacaoScreen() {
  const router = useRouter();
  const { addCitacao } = useCitacoes();

  const [texto, setTexto] = useState("");
  const [pagina, setPagina] = useState("");
  const [contexto, setContexto] = useState("");
  const [livroSelecionado, setLivroSelecionado] = useState<typeof livrosPopulares[0] | null>(null);
  const [showLivrosPicker, setShowLivrosPicker] = useState(false);
  const [loading, setLoading] = useState(false);

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

    if (!livroSelecionado) {
      Alert.alert("Erro", "Por favor, selecione um livro");
      return;
    }

    setLoading(true);
    const result = await addCitacao({
      texto: texto.trim(),
      pagina: paginaNum,
      livroId: livroSelecionado.id,
      livroTitulo: livroSelecionado.titulo,
      livroAutor: livroSelecionado.autor,
      livroImagem: livroSelecionado.imagem,
      contexto: contexto.trim() || undefined,
    });
    setLoading(false);

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "Citação adicionada!",
        text2: "Sua citação foi salva com sucesso",
        visibilityTime: 2000,
      });
      router.back();
    } else {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: result.error || "Não foi possível adicionar a citação",
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
        <Text style={styles.headerTitle}>Nova Citação</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Seleção de Livro */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Livro <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.livroButton}
            onPress={() => setShowLivrosPicker(!showLivrosPicker)}
          >
            <Ionicons name="book" size={20} color="#2E7D32" />
            <Text style={styles.livroButtonText}>
              {livroSelecionado ? livroSelecionado.titulo : "Selecione um livro"}
            </Text>
            <Ionicons
              name={showLivrosPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {showLivrosPicker && (
            <View style={styles.livrosPicker}>
              {livrosPopulares.map((livro) => (
                <TouchableOpacity
                  key={livro.id}
                  style={[
                    styles.livroOption,
                    livroSelecionado?.id === livro.id && styles.livroOptionSelected,
                  ]}
                  onPress={() => {
                    setLivroSelecionado(livro);
                    setShowLivrosPicker(false);
                  }}
                >
                  <Text style={styles.livroOptionTitulo}>{livro.titulo}</Text>
                  <Text style={styles.livroOptionAutor}>{livro.autor}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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

        {/* Botão Salvar */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Salvar Citação</Text>
            </>
          )}
        </TouchableOpacity>
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
  livroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  livroButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  livrosPicker: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    overflow: "hidden",
  },
  livroOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  livroOptionSelected: {
    backgroundColor: "#E8F5E9",
  },
  livroOptionTitulo: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  livroOptionAutor: {
    fontSize: 13,
    color: "#666",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
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
