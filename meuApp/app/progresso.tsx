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
import { useTheme } from "../contexts/ThemeContext";
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

type Categoria = "lendo" | "lidos" | "queroLer";

const getCategoryLabel = (cat: Categoria): string => {
  switch (cat) {
    case "lendo": return "Lendo";
    case "lidos": return "Lidos";
    case "queroLer": return "Quero Ler";
  }
};

const getEmptyMessage = (cat: Categoria): string => {
  switch (cat) {
    case "lendo": return "Você ainda não está lendo nenhum livro.";
    case "lidos": return "Nenhum livro concluído ainda.";
    case "queroLer": return "Sua lista de desejos está vazia.";
  }
};

export default function ProgressoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria>("lendo");
  const [livros, setLivros] = useState<Record<Categoria, Livro[]>>({
    lendo: [],
    lidos: [],
    queroLer: [],
  });

  useEffect(() => {
    if (user?.profileType === "empreendedor") {
      router.replace("/usuario");
    }
  }, [user]);

  if (user?.profileType === "empreendedor") return null;

  useEffect(() => {
    if (user?.uid) carregarLivrosDoUsuario();
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
      await updateDoc(docRef, novosLivros);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  const atualizarPaginas = (id: number, paginas: number, categoria: Categoria) => {
    setLivros((prev) => {
      const novasListas = {
        ...prev,
        [categoria]: prev[categoria].map((livro) =>
          livro.id === id
            ? { ...livro, paginasLidas: Math.max(0, Math.min(livro.totalPaginas, paginas)) }
            : livro
        ),
      };
      salvarLivrosNoUsuario(novasListas);
      return novasListas;
    });
  };

  const moverLivroParaLidos = (id: number) => {
    setLivros((prev) => {
      const livro = prev.lendo.find((l) => l.id === id);
      if (!livro) return prev;
      const novasListas = {
        ...prev,
        lendo: prev.lendo.filter((l) => l.id !== id),
        lidos: [...prev.lidos, { ...livro, paginasLidas: livro.totalPaginas }],
      };
      salvarLivrosNoUsuario(novasListas);
      setCategoriaAtiva("lidos");
      return novasListas;
    });
  };

  const alternarSalvo = (id: number) => {
    setLivros((prev) => {
      const novasListas = {
        ...prev,
        queroLer: prev.queroLer.map((livro) =>
          livro.id === id ? { ...livro, salvo: !livro.salvo } : livro
        ),
      };
      salvarLivrosNoUsuario(novasListas);
      return novasListas;
    });
  };

  const removerLivro = (id: number, categoria: Categoria) => {
    Alert.alert(
      "Remover Livro",
      "Tem certeza que deseja remover este livro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            setLivros((prev) => {
              const novasListas = {
                ...prev,
                [categoria]: prev[categoria].filter((livro) => livro.id !== id),
              };
              salvarLivrosNoUsuario(novasListas);
              return novasListas;
            });
          },
        },
      ]
    );
  };

  const renderLivroItem = (livro: Livro) => {
    const progresso = (livro.paginasLidas / livro.totalPaginas) * 100;
    const livroCompleto = progresso >= 100;
    const categoria = categoriaAtiva;

    const renderBookContent = () => {
      if (categoria === "lendo") {
        return (
          <>
            <View style={styles.progressControls}>
              <View style={styles.pageInputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Página atual:</Text>
                <View style={styles.pageInputRow}>
                  <TextInput
                    style={[styles.pageInput, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
                    value={livro.paginasLidas.toString()}
                    onChangeText={(text) => atualizarPaginas(livro.id, parseInt(text) || 0, "lendo")}
                    keyboardType="numeric"
                    maxLength={4}
                    placeholderTextColor={colors.placeholder}
                  />
                  <Text style={[styles.totalPages, { color: colors.textSecondary }]}>/ {livro.totalPaginas}</Text>
                </View>
              </View>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={livro.totalPaginas}
                  value={livro.paginasLidas}
                  onValueChange={(value) => atualizarPaginas(livro.id, Math.round(value), "lendo")}
                  minimumTrackTintColor={livroCompleto ? "#4CAF50" : colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={livroCompleto ? "#4CAF50" : colors.primary}
                  step={1}
                />
              </View>
            </View>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {livroCompleto
                  ? "Livro concluído! "
                  : `Página ${livro.paginasLidas} de ${livro.totalPaginas} (${Math.round(progresso)}%)`}
              </Text>
              {livroCompleto && (
                <TouchableOpacity style={[styles.moveToReadButton, { backgroundColor: colors.success }]} onPress={() => moverLivroParaLidos(livro.id)}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.card} />
                  <Text style={[styles.moveToReadButtonText, { color: colors.card }]}>Marcar como Lido</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        );
      }

      if (categoria === "lidos") {
        return (
          <>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: "100%", backgroundColor: "#4CAF50" }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.success }]}>Concluído!</Text>
          </>
        );}

      if (categoria === "queroLer") {
        return (
          <View style={styles.wishlistInfo}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>{livro.totalPaginas} páginas</Text>
            <Text style={[styles.wishlistStatus, { color: livro.salvo ? "#FF9800" : colors.placeholder }]}>
              {livro.salvo ? "Na lista de desejos" : "Clique no ícone para salvar"}
            </Text>
          </View>
        );
      }

      return null;
    };

    const getRemoveIconColor = () => {
      if (categoria === "lidos") return "#4CAF50";
      if (categoria === "queroLer") return livro.salvo ? "#FF9800" : "#999";
      return "#2E7D32"; // lendo
    };

    return (
      <View
        key={livro.id}
        style={[
          styles.bookProgress,
          { backgroundColor: colors.card, borderColor: colors.border },
          categoria === "lendo" && livroCompleto && [styles.completedReadingBook, { backgroundColor: colors.primaryLight, borderLeftColor: colors.success }],
          categoria === "lidos" && [styles.completedBook, { backgroundColor: colors.primaryLight, borderLeftColor: colors.success }],
          categoria === "queroLer" && (livro.salvo ? [styles.wishlistBook, { backgroundColor: '#FFF8E1', borderLeftColor: '#FF9800' }] : [styles.wishlistBookUnsaved, { backgroundColor: colors.inputBackground, borderLeftColor: colors.border }]),
        ]}
      >
        <View style={styles.bookHeader}>
          <View style={styles.bookInfo}>
            <Image source={{ uri: livro.imagem }} style={styles.bookCover} />
            <Text style={[styles.bookTitle, { color: colors.text }]}>{livro.titulo}</Text>
          </View>
          <TouchableOpacity onPress={() => removerLivro(livro.id, categoria)}>
            <Ionicons name="trash-outline" size={20} color={getRemoveIconColor()} />
          </TouchableOpacity>
        </View>
        {renderBookContent()}
      </View>
    );
  };

  // ── Renderização principal ──────────────────────────────

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary }}>Carregando seus livros...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho */}
      <View style={[styles.header, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Acompanhar Progresso</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Resumo */}
      <View style={[styles.summaryContainer, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>Resumo de Leitura</Text>
        <View style={styles.summaryStats}>
          {(["lidos", "lendo", "queroLer"] as Categoria[]).map((cat) => (
            <View key={cat} style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>{livros[cat].length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{getCategoryLabel(cat)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Botões de categoria */}
      <View style={styles.categoryButtons}>
        {(["lendo", "lidos", "queroLer"] as Categoria[]).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              categoriaAtiva === cat && [styles.categoryButtonActive, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]
            ]}
            onPress={() => setCategoriaAtiva(cat)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                { color: colors.textSecondary },
                categoriaAtiva === cat && [styles.categoryButtonTextActive, { color: colors.primary }],
              ]}
            >
              {getCategoryLabel(cat)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de livros */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.section}>
          {livros[categoriaAtiva].length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.placeholder }]}>{getEmptyMessage(categoriaAtiva)}</Text>
          ) : (
            livros[categoriaAtiva].map(renderLivroItem)
          )}
        </View>
      </ScrollView>

      {/* Botão flutuante de adicionar */}
      <TouchableOpacity
        style={[styles.adicionarButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
        onPress={() => {
          Alert.alert("Funcionalidade", "Você pode adicionar livros a partir da tela de busca.");
        }}
      >
        <Ionicons name="add" size={24} color={colors.card} />
      </TouchableOpacity>

      {/* Barra de navegação inferior */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  summaryContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15 },
  summaryStats: { flexDirection: "row", justifyContent: "space-around" },
  summaryCard: { alignItems: "center" },
  summaryNumber: { fontSize: 16, fontWeight: "bold" },
  summaryLabel: { fontSize: 13, textAlign: "center" },
  section: { margin: 20 },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 30,
  },
  bookProgress: {
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
  },
  bookTitle: { fontSize: 14, fontWeight: "600", flex: 1 },
  completedBook: {
    borderLeftWidth: 4,
  },
  wishlistBook: {
    borderLeftWidth: 4,
  },
  wishlistBookUnsaved: {
    borderLeftWidth: 4,
  },
  wishlistInfo: { gap: 4 },
  wishlistStatus: {
    fontSize: 11,
    fontStyle: "italic",
  },
  completedReadingBook: {
    borderLeftWidth: 4,
    borderWidth: 2,
  },
  progressInfo: { gap: 8 },
  moveToReadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  moveToReadButtonText: {
    marginLeft: 5,
    fontSize: 12,
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
    alignItems: "center",
    borderWidth: 1,
  },
  categoryButtonActive: {
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryButtonTextActive: {
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: { fontSize: 12 },
  progressControls: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  pageInputContainer: { marginBottom: 15 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  pageInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pageInput: {
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 45,
    maxWidth: 45,
  },
  totalPages: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "500",
  },
  sliderContainer: { paddingHorizontal: 5 },
  slider: { width: "100%", height: 30 },
  adicionarButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});