import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

// Importar Firebase
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

interface Livro {
  id: number | string;
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
  livros: (number | string)[]; // IDs dos livros
}

export default function DetalhesEstanteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [estante, setEstante] = useState<Estante | null>(null);
  const [livros, setLivros] = useState<Livro[]>([]);

  useEffect(() => {
    if (user?.uid && id) {
      carregarEstante();
    }
  }, [user, id]);

  const carregarEstante = async () => {
    if (!user?.uid || !id) return;

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        const estantes = dados.estantes || [];

        const estanteEncontrada = estantes.find((e: any) => e.id === id);
        if (estanteEncontrada) {
          setEstante(estanteEncontrada);

          // Carregar os livros reais do Firestore (lendo, lidos, queroLer)
          const todosLivros = [
            ...(dados.lendo || []),
            ...(dados.lidos || []),
            ...(dados.queroLer || []),
          ];

          const livrosDaEstante = todosLivros.filter(l => estanteEncontrada.livros.includes(l.id));
          setLivros(livrosDaEstante);
        } else {
          Alert.alert("Erro", "Estante não encontrada.");
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados da estante.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Carregando estante...</Text>
      </View>
    );
  }

  if (!estante) {
    return (
      <View style={styles.container}>
        <Text>Estante não encontrada.</Text>
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