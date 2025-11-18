//detalhes-estantes.tsx
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
import Toast from 'react-native-toast-message';

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
  const { shelfId } = useLocalSearchParams<{ shelfId?: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [estante, setEstante] = useState<Estante | null>(null);
  const [livros, setLivros] = useState<Livro[]>([]);

  useEffect(() => {
    if (user?.uid && shelfId) {
      carregarEstante();
    }
  }, [user, shelfId]);

  const carregarEstante = async () => {
    if (!user?.uid || !shelfId) return;

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        const estantes = dados.estantes || [];

        const estanteEncontrada = estantes.find((e: any) => e.id === shelfId);
        if (estanteEncontrada) {
          setEstante(estanteEncontrada);

          // Carregar os livros reais do Firestore (lendo, lidos, queroLer)
          const todosLivros = [
            ...(dados.lendo || []),
            ...(dados.lidos || []),
            ...(dados.queroLer || []),
          ];

          // Debug: mostrar o que temos
          console.log('===== DEBUG carregarEstante =====');
          console.log('Estante:', estanteEncontrada.nome);
          console.log('IDs/dados na estante:', JSON.stringify(estanteEncontrada.livros));
          console.log('Total de livros no usuário:', todosLivros.length);
          console.log('Livros disponíveis:', todosLivros.map((l: any) => ({ id: l.id, titulo: l.titulo })));

          // Encontrar livros por múltiplos critérios
          const livrosDaEstante = todosLivros.filter((livro: any) => {
            // Critério 1: Comparar IDs (string ou número)
            const idMatch = estanteEncontrada.livros.some((livroId: any) => {
              const idStr = String(livroId).trim();
              const livroIdStr = String(livro.id).trim();
              const matches = idStr === livroIdStr;
              if (matches) {
                console.log(`✓ ID Match: ${idStr} === ${livroIdStr}`);
              }
              return matches;
            });

            // Critério 2: Comparar por título (para livros salvos manualmente ou de APIs diferentes)
            const titleMatch = estanteEncontrada.livros.some((livroData: any) => {
              if (typeof livroData === 'object' && livroData.titulo) {
                return livroData.titulo === livro.titulo || livroData.titulo === livro.title;
              }
              return false;
            });

            return idMatch || titleMatch;
          });

          console.log('Livros encontrados:', livrosDaEstante.length);
          console.log('=====================================');
          
          setLivros(livrosDaEstante);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Estante não encontrada.',
            visibilityTime: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estante:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar os dados da estante.',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditarEstante = () => {
    if (!shelfId) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'ID da estante não encontrado.',
        visibilityTime: 3000,
      });
      return;
    }

    router.push((`/criar-estantes?editId=${shelfId}`) as any);
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
        <TouchableOpacity onPress={handleEditarEstante}>
          <Ionicons name="create" size={24} color="#2E7D32" />
        </TouchableOpacity>
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

      <Toast />
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