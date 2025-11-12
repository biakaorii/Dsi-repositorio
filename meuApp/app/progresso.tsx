import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Slider from '@react-native-community/slider';
import BottomNavBar from "../components/BottomNavBar";
import { useAuth } from "@/contexts/AuthContext";

// Importar Firebase
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

interface Livro {
  id: number;
  titulo: string;
  paginasLidas: number;
  totalPaginas: number;
  imagem: string;
  salvo?: boolean;
}

type Categoria = 'lendo' | 'lidos' | 'queroLer';

export default function ProgressoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.profileType === 'empreendedor') {
      router.replace('/usuario');
    }
  }, [user]);

  if (user?.profileType === 'empreendedor') {
    return null;
  }

  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria>('lendo');
  const [livros, setLivros] = useState<Record<Categoria, Livro[]>>({
    lendo: [],
    lidos: [],
    queroLer: [],
  });

  useEffect(() => {
    if (user?.uid) {
      carregarLivrosDoUsuario();
    }
  }, [user]);

  const carregarLivrosDoUsuario = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        setLivros({
          lendo: dados.lendo || [],
          lidos: dados.lidos || [],
          queroLer: dados.queroLer || [],
        });
      } else {
        // Se o documento não existir, cria com listas vazias
        await setDoc(docRef, { lendo: [], lidos: [], queroLer: [] });
        setLivros({ lendo: [], lidos: [], queroLer: [] });
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar seus livros.");
    } finally {
      setLoading(false);
    }
  };

  const salvarLivrosNoUsuario = async (novosLivros: Record<Categoria, Livro[]>) => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, "usuarios", user.uid);
      await updateDoc(docRef, {
        lendo: novosLivros.lendo,
        lidos: novosLivros.lidos,
        queroLer: novosLivros.queroLer,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  const atualizarPaginas = (id: number, paginas: number, categoria: Categoria) => {
    setLivros(prev => {
      const novasListas = {
        ...prev,
        [categoria]: prev[categoria].map(livro => 
          livro.id === id ? { ...livro, paginasLidas: Math.max(0, Math.min(livro.totalPaginas, paginas)) } : livro
        )
      };
      salvarLivrosNoUsuario(novasListas);
      return novasListas;
    });
  };

  const moverLivroParaLidos = (id: number) => {
    setLivros(prev => {
      const livro = prev.lendo.find(l => l.id === id);
      if (!livro) return prev;

      const novasListas = {
        ...prev,
        lendo: prev.lendo.filter(l => l.id !== id),
        lidos: [...prev.lidos, { ...livro, paginasLidas: livro.totalPaginas }]
      };
      salvarLivrosNoUsuario(novasListas);
      setCategoriaAtiva('lidos');
      return novasListas;
    });
  };

  const alternarSalvo = (id: number) => {
    setLivros(prev => {
      const novasListas = {
        ...prev,
        queroLer: prev.queroLer.map(livro => 
          livro.id === id ? { ...livro, salvo: !livro.salvo } : livro
        )
      };
      salvarLivrosNoUsuario(novasListas);
      return novasListas;
    });
  };

  const renderLivro = (livro: Livro, categoria: Categoria) => {
    const progresso = (livro.paginasLidas / livro.totalPaginas) * 100;
    const livroCompleto = progresso >= 100;

    if (categoria === 'lendo') {
      return (
        <View key={livro.id} style={[styles.bookProgress, livroCompleto && styles.completedReadingBook]}>
          <View style={styles.bookHeader}>
            <View style={styles.bookInfo}>
              <Image source={{ uri: livro.imagem }} style={styles.bookCover} />
              <Text style={styles.bookTitle}>{livro.titulo}</Text>
            </View>
          </View>
          <View style={styles.progressControls}>
            <View style={styles.pageInputContainer}>
              <Text style={styles.inputLabel}>Página atual:</Text>
              <View style={styles.pageInputRow}>
                <TextInput
                  style={styles.pageInput}
                  value={livro.paginasLidas.toString()}
                  onChangeText={text => atualizarPaginas(livro.id, parseInt(text) || 0, 'lendo')}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <Text style={styles.totalPages}>/ {livro.totalPaginas}</Text>
              </View>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={livro.totalPaginas}
                value={livro.paginasLidas}
                onValueChange={value => atualizarPaginas(livro.id, Math.round(value), 'lendo')}
                minimumTrackTintColor={livroCompleto ? '#4CAF50' : '#2E7D32'}
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor={livroCompleto ? '#4CAF50' : '#2E7D32'}
                step={1}
              />
            </View>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {livroCompleto ? "Livro concluído! " : `Página ${livro.paginasLidas} de ${livro.totalPaginas} (${Math.round(progresso)}%)`}
            </Text>
            {livroCompleto && (
              <TouchableOpacity style={styles.moveToReadButton} onPress={() => moverLivroParaLidos(livro.id)}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.moveToReadButtonText}>Marcar como Lido</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    if (categoria === 'lidos') {
      return (
        <View key={livro.id} style={[styles.bookProgress, styles.completedBook]}>
          <View style={styles.bookHeader}>
            <View style={styles.bookInfo}>
              <Image source={{ uri: livro.imagem }} style={styles.bookCover} />
              <Text style={styles.bookTitle}>{livro.titulo}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%', backgroundColor: '#4CAF50' }]} />
          </View>
          <Text style={styles.progressText}>Concluído!</Text>
        </View>
      );
    }

    if (categoria === 'queroLer') {
      return (
        <View key={livro.id} style={[styles.bookProgress, livro.salvo ? styles.wishlistBook : styles.wishlistBookUnsaved]}>
          <View style={styles.bookHeader}>
            <View style={styles.bookInfo}>
              <Image source={{ uri: livro.imagem }} style={styles.bookCover} />
              <Text style={styles.bookTitle}>{livro.titulo}</Text>
            </View>
            <TouchableOpacity onPress={() => alternarSalvo(livro.id)}>
              <Ionicons name={livro.salvo ? "bookmark" : "bookmark-outline"} size={20} color={livro.salvo ? "#FF9800" : "#CCC"} />
            </TouchableOpacity>
          </View>
          <View style={styles.wishlistInfo}>
            <Text style={styles.progressText}>{livro.totalPaginas} páginas</Text>
            <Text style={[styles.wishlistStatus, { color: livro.salvo ? "#FF9800" : "#999" }]}>
              {livro.salvo ? "Na lista de desejos" : "Clique no ícone para salvar"}
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Carregando seus livros...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acompanhar Progresso</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Resumo de Leitura</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{livros.lidos.length}</Text>
            <Text style={styles.summaryLabel}>Livros Lidos</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{livros.lendo.length}</Text>
            <Text style={styles.summaryLabel}>Lendo</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{livros.queroLer.length}</Text>
            <Text style={styles.summaryLabel}>Quero Ler</Text>
          </View>
        </View>
      </View>

      <View style={styles.categoryButtons}>
        {(['lendo', 'lidos', 'queroLer'] as Categoria[]).map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, categoriaAtiva === cat && styles.categoryButtonActive]}
            onPress={() => setCategoriaAtiva(cat)}
          >
            <Text style={[styles.categoryButtonText, categoriaAtiva === cat && styles.categoryButtonTextActive]}>
              {cat === 'lendo' && 'Lendo'}
              {cat === 'lidos' && 'Lidos'}
              {cat === 'queroLer' && 'Quero Ler'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.section}>
          {livros[categoriaAtiva].length === 0 ? (
            <Text style={styles.emptyText}>
              {categoriaAtiva === 'lendo' && 'Você ainda não está lendo nenhum livro.'}
              {categoriaAtiva === 'lidos' && 'Nenhum livro concluído ainda.'}
              {categoriaAtiva === 'queroLer' && 'Sua lista de desejos está vazia.'}
            </Text>
          ) : (
            livros[categoriaAtiva].map(livro => renderLivro(livro, categoriaAtiva))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.adicionarButton}
        onPress={() => {
          // Aqui você pode navegar para uma tela de busca ou catálogo
          Alert.alert("Funcionalidade", "Você pode adicionar livros a partir da tela de busca.");
          // router.push('/search'); // Descomente quando tiver a tela
        }}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <BottomNavBar />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },
  summaryContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
  },
  summaryTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 15 },
  summaryStats: { flexDirection: "row", justifyContent: "space-around" },
  summaryCard: { alignItems: "center" },
  summaryNumber: { fontSize: 16, fontWeight: "bold", color: "#333" },
  summaryLabel: { fontSize: 13, color: "#666", textAlign: "center" },
  section: { margin: 20 },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    marginTop: 30,
  },
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
  completedBook: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
  },
  wishlistBook: {
    backgroundColor: "#FFF8E1",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  wishlistBookUnsaved: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#CCC",
  },
  wishlistInfo: { gap: 4 },
  wishlistStatus: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#666",
  },
  completedReadingBook: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  progressInfo: { gap: 8 },
  moveToReadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  moveToReadButtonText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  categoryButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryButtonActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
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
  progressControls: {
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  pageInputContainer: { marginBottom: 15 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  pageInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pageInput: {
    borderWidth: 2,
    borderColor: "#2E7D32",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 45,
    maxWidth: 45,
    backgroundColor: "#fff",
  },
  totalPages: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
    fontWeight: "500",
  },
  sliderContainer: { paddingHorizontal: 5 },
  slider: { width: "100%", height: 30 },
  adicionarButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: "#2E7D32",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});