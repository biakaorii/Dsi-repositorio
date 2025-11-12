import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Livro {
  id: number;
  titulo: string;
  paginasLidas: number;
  totalPaginas: number;
  imagem: string;
  salvo?: boolean;
}

interface Estante {
  id: string;
  nome: string;
  descricao?: string;
  livros: number[];
}

export default function CriarEstanteScreen() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [livrosDisponiveis, setLivrosDisponiveis] = useState<Livro[]>([]);
  const [livrosSelecionados, setLivrosSelecionados] = useState<number[]>([]);

  React.useEffect(() => {
    // Simulando carregar livros de todas as categorias
    const todosLivros = [
      { id: 1, titulo: "O Senhor dos Anéis", paginasLidas: 240, totalPaginas: 400, imagem: "..." },
      { id: 2, titulo: "1984", paginasLidas: 75, totalPaginas: 300, imagem: "..." },
      { id: 4, titulo: "Harry Potter", paginasLidas: 450, totalPaginas: 450, imagem: "..." },
      { id: 5, titulo: "O Pequeno Príncipe", paginasLidas: 120, totalPaginas: 120, imagem: "..." },
      { id: 7, titulo: "Cem Anos de Solidão", paginasLidas: 0, totalPaginas: 350, imagem: "..." },
      { id: 8, titulo: "O Nome do Vento", paginasLidas: 0, totalPaginas: 680, imagem: "..." },
    ];
    setLivrosDisponiveis(todosLivros);
  }, []);

  const toggleLivro = (id: number) => {
    if (livrosSelecionados.includes(id)) {
      setLivrosSelecionados(livrosSelecionados.filter((lid) => lid !== id));
    } else {
      setLivrosSelecionados([...livrosSelecionados, id]);
    }
  };

  const salvarEstante = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "O nome da estante é obrigatório.");
      return;
    }

    const novaEstante: Estante = {
      id: Date.now().toString(),
      nome,
      descricao,
      livros: livrosSelecionados,
    };

    try {
      const estantesSalvas = await AsyncStorage.getItem("estantes");
      const estantes = estantesSalvas ? JSON.parse(estantesSalvas) : [];
      estantes.push(novaEstante);
      await AsyncStorage.setItem("estantes", JSON.stringify(estantes));
      Alert.alert("Sucesso", "Estante criada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a estante.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Nova Estante</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TextInput
          style={styles.input}
          placeholder="Nome da estante"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição (opcional)"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.sectionTitle}>Selecione os livros:</Text>
        {livrosDisponiveis.map((livro) => (
          <TouchableOpacity
            key={livro.id}
            style={[
              styles.livroItem,
              livrosSelecionados.includes(livro.id) && styles.livroSelecionado,
            ]}
            onPress={() => toggleLivro(livro.id)}
          >
            <Text style={styles.livroTitulo}>{livro.titulo}</Text>
            <Ionicons
              name={livrosSelecionados.includes(livro.id) ? "checkbox" : "square-outline"}
              size={24}
              color="#2E7D32"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.salvarButton} onPress={salvarEstante}>
        <Text style={styles.salvarButtonText}>Salvar Estante</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginVertical: 10 },
  livroItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F1F8E9",
    borderRadius: 8,
    marginBottom: 8,
  },
  livroSelecionado: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
  },
  livroTitulo: { fontSize: 14, fontWeight: "600", color: "#333" },
  salvarButton: {
    backgroundColor: "#2E7D32",
    padding: 16,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  salvarButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});