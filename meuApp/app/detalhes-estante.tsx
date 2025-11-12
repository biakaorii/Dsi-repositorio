import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Livro {
  id: number;
  titulo: string;
  paginasLidas: number;
  totalPaginas: number;
  imagem: string;
}

interface Estante {
  id: string;
  nome: string;
  descricao?: string;
  livros: number[];
}

export default function DetalhesEstanteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [estante, setEstante] = useState<Estante | null>(null);
  const [livros, setLivros] = useState<Livro[]>([]);

  useEffect(() => {
    carregarEstante();
  }, []);

  const carregarEstante = async () => {
    try {
      const estantesSalvas = await AsyncStorage.getItem("estantes");
      if (estantesSalvas) {
        const estantes: Estante[] = JSON.parse(estantesSalvas);
        const estanteEncontrada = estantes.find((e) => e.id === id);
        if (estanteEncontrada) {
          setEstante(estanteEncontrada);

          // Simulando carregar os dados dos livros
          const todosLivros: Livro[] = [
            { id: 1, titulo: "O Senhor dos Anéis", paginasLidas: 240, totalPaginas: 400, imagem: "..." },
            { id: 2, titulo: "1984", paginasLidas: 75, totalPaginas: 300, imagem: "..." },
            { id: 4, titulo: "Harry Potter", paginasLidas: 450, totalPaginas: 450, imagem: "..." },
            { id: 5, titulo: "O Pequeno Príncipe", paginasLidas: 120, totalPaginas: 120, imagem: "..." },
            { id: 7, titulo: "Cem Anos de Solidão", paginasLidas: 0, totalPaginas: 350, imagem: "..." },
            { id: 8, titulo: "O Nome do Vento", paginasLidas: 0, totalPaginas: 680, imagem: "..." },
          ];
          const livrosDaEstante = todosLivros.filter(l => estanteEncontrada.livros.includes(l.id));
          setLivros(livrosDaEstante);
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados da estante.");
    }
  };

  if (!estante) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{estante.nome}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {estante.descricao && <Text style={styles.descricao}>{estante.descricao}</Text>}

        <Text style={styles.sectionTitle}>Livros ({livros.length})</Text>
        {livros.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum livro nesta estante.</Text>
        ) : (
          livros.map((livro) => (
            <View key={livro.id} style={styles.bookProgress}>
              <View style={styles.bookHeader}>
                <View style={styles.bookInfo}>
                  <Image source={{ uri: livro.imagem }} style={styles.bookCover} />
                  <Text style={styles.bookTitle}>{livro.titulo}</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(livro.paginasLidas / livro.totalPaginas) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {livro.paginasLidas} de {livro.totalPaginas} páginas
              </Text>
            </View>
          ))
        )}
      </ScrollView>
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
  descricao: { fontSize: 14, color: "#666", marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 15 },
  emptyText: { textAlign: "center", color: "#999", fontStyle: "italic", marginTop: 20 },

  bookProgress: {
    backgroundColor: "#F1F8E9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bookInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bookCover: {
    width: 40,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  bookTitle: { fontSize: 14, fontWeight: "600", color: "#333", flex: 1 },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 4,
  },
  progressText: { fontSize: 12, color: "#666" },
});