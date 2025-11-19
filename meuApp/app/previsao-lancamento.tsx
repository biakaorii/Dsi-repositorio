import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  ActivityIndicator,
  Modal 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from 'react-native-toast-message';
import { predictPopularity } from '../utils/predictionService';

export default function PrevisaoLancamentoScreen() {
  const router = useRouter();
  
  // Estados para os inputs
  const [ano, setAno] = useState("");
  const [paginas, setPaginas] = useState("");
  const [queremLer, setQueremLer] = useState("");
  const [autor, setAutor] = useState("");
  const [editora, setEditora] = useState("");
  const [generoPrimario, setGeneroPrimario] = useState("");
  const [subGenero, setSubGenero] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const handlePrevisao = async () => {
    // Validação
    if (!ano || !paginas || !queremLer || !autor || !editora || !generoPrimario || !subGenero) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha todos os campos',
        visibilityTime: 3000,
      });
      return;
    }

    setLoading(true);
    
    try {
      // Fazer a previsão usando o serviço
      const prediction = await predictPopularity({
        ano: parseInt(ano),
        paginas: parseInt(paginas),
        queremLer: parseInt(queremLer),
        autor,
        editora,
        generoPrimario,
        subGenero,
      });
      
      setResultado(prediction);
      setShowResultModal(true);
      
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Erro ao fazer a previsão',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    setAno("");
    setPaginas("");
    setQueremLer("");
    setAutor("");
    setEditora("");
    setGeneroPrimario("");
    setSubGenero("");
    setResultado(null);
    setShowResultModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Previsão de Lançamento</Text>
        <TouchableOpacity onPress={limparFormulario}>
          <Ionicons name="refresh" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#2E7D32" />
          <Text style={styles.infoText}>
            Preencha os dados do livro para prever sua popularidade
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          {/* Ano */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ano de Lançamento *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 2024"
              value={ano}
              onChangeText={setAno}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          {/* Páginas */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de Páginas *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 350"
              value={paginas}
              onChangeText={setPaginas}
              keyboardType="numeric"
            />
          </View>

          {/* Querem Ler */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pessoas que Querem Ler *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1000"
              value={queremLer}
              onChangeText={setQueremLer}
              keyboardType="numeric"
            />
          </View>

          {/* Autor */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Autor *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do autor"
              value={autor}
              onChangeText={setAutor}
              autoCapitalize="words"
            />
          </View>

          {/* Editora */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Editora *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da editora"
              value={editora}
              onChangeText={setEditora}
              autoCapitalize="words"
            />
          </View>

          {/* Gênero Primário */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gênero Primário *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Ficção, Romance, Fantasia"
              value={generoPrimario}
              onChangeText={setGeneroPrimario}
              autoCapitalize="words"
            />
          </View>

          {/* Sub-Gênero */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sub-Gênero *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Ficção Científica, Romance Histórico"
              value={subGenero}
              onChangeText={setSubGenero}
              autoCapitalize="words"
            />
          </View>

          {/* Botão de Previsão */}
          <TouchableOpacity 
            style={[styles.previsaoButton, loading && styles.buttonDisabled]}
            onPress={handlePrevisao}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="analytics" size={20} color="#fff" />
                <Text style={styles.previsaoButtonText}>Fazer Previsão</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Resultado */}
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalResultado}>
            <View style={styles.modalResultadoContent}>
              <Ionicons 
                name={resultado === 1 ? "trending-up" : "trending-down"} 
                size={80} 
                color={resultado === 1 ? "#2E7D32" : "#E63946"} 
              />
              <Text style={[
                styles.modalResultadoTexto,
                { color: resultado === 1 ? "#2E7D32" : "#E63946" }
              ]}>
                {resultado === 1 ? "Popular" : "Impopular"}
              </Text>
              <Text style={styles.modalResultadoDescricao}>
                {resultado === 1 
                  ? "Este livro tem grande potencial de popularidade!" 
                  : "Este livro pode ter popularidade limitada."}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowResultModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#2E7D32",
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    fontSize: 16,
    color: "#333",
  },
  previsaoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  previsaoButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  resultadoCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  resultadoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  resultadoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  resultadoContent: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
  },
  resultadoValor: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  resultadoLabel: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  resultadoFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
  },
  resultadoInfo: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalResultado: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalResultadoContent: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalResultadoTexto: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  modalResultadoDescricao: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  modalCloseButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
