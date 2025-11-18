//estantes.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "react-native";
import Toast from 'react-native-toast-message';

// Importar Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import BottomNavBar from "@/components/BottomNavBar";

interface Estante {
  id: string;
  nome: string;
  descricao?: string;
  livros: (number | string)[];
}

export default function EstantesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [estantes, setEstantes] = useState<Estante[]>([]);

  useEffect(() => {
    if (user?.uid) {
      carregarEstantes();
    }
  }, [user]);

  const carregarEstantes = async () => {
    if (!user?.uid) return;

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        const estantesDoUsuario = dados.estantes || [];
        setEstantes(estantesDoUsuario);
      } else {
        setEstantes([]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar suas estantes.',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePressEstante = (id: string) => {
  router.push((`/detalhes-estantes?shelfId=${id}`) as any);
  };

  const handleCriarEstante = () => {
  router.push("/criar-estantes" as any);
  };

  const handleEditarEstante = (id: string) => {
    if (!id) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'ID da estante não encontrado.',
        visibilityTime: 3000,
      });
      return;
    }
  router.push((`/criar-estantes?editId=${id}`) as any);
  };

  const handleDeletarEstante = async (id: string, nome: string) => {
    Alert.alert(
      "Excluir Estante",
      `Tem certeza que deseja excluir "${nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            if (!user?.uid) return;

            try {
              const docRef = doc(db, "usuarios", user.uid);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                const dados = docSnap.data();
                const estantesAtuais = dados.estantes || [];
                const novasEstantes = estantesAtuais.filter((e: any) => e.id !== id);

                await updateDoc(docRef, {
                  estantes: novasEstantes
                });

                setEstantes(novasEstantes);
                Toast.show({
                  type: 'success',
                  text1: 'Sucesso',
                  text2: `A estante "${nome}" foi excluída.`,
                  visibilityTime: 3000,
                });
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível excluir a estante.',
                visibilityTime: 3000,
              });
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Carregando estantes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Estantes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {estantes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmarks-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Você ainda não tem estantes.</Text>
            <Text style={styles.emptySubtext}>Crie sua primeira estante agora!</Text>
          </View>
        ) : (
          estantes.map((estante) => (
            <View key={estante.id} style={styles.estanteCard}>
              <TouchableOpacity
                style={styles.estanteContent}
                onPress={() => handlePressEstante(estante.id)}
              >
                <View style={styles.estanteHeader}>
                  <Text style={styles.estanteTitle}>{estante.nome}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
                {estante.descricao ? (
                  <Text style={styles.estanteDescricao}>{estante.descricao}</Text>
                ) : null}
                <Text style={styles.estanteCount}>
                  {estante.livros.length} livro{estante.livros.length !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditarEstante(estante.id)}
                >
                  <Ionicons name="create" size={20} color="#2E7D32" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletarEstante(estante.id, estante.nome)}
                >
                  <Ionicons name="trash" size={20} color="#ff4757" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.adicionarButton} onPress={handleCriarEstante}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.adicionarButtonText}>Criar Nova Estante</Text>
      </TouchableOpacity>

      <BottomNavBar />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: { padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#999", textAlign: "center", marginTop: 8 },
  estanteCard: {
    backgroundColor: "#F1F8E9",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  estanteContent: {
    flex: 1,
    marginRight: 8,
  },
  estanteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  estanteTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  estanteDescricao: { fontSize: 14, color: "#666", marginBottom: 6 },
  estanteCount: { fontSize: 12, color: "#888" },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    justifyContent: 'center',
    alignItems: 'center',
  },
  adicionarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#2E7D32",
    padding: 16,
    margin: 20,
    borderRadius: 10,
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
  },
  adicionarButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});