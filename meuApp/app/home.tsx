import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import BottomNavBar from "../components/BottomNavBar";
import { useReviews } from "../contexts/ReviewsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  genre: string;
  synopsis: string;
};

type BookWithRating = Book & {
  avgRating: number;
  reviewCount: number;
};

interface LivroProgresso {
  id: number;
  titulo: string;
  paginasLidas: number;
  totalPaginas: number;
  imagem: string;
  salvo?: boolean;
}

const books: Book[] = [
  {
    id: "percy-jackson-ladrao-raios",
    title: "Percy Jackson e o Ladrão de Raios",
    author: "Rick Riordan",
    coverUrl: "https://covers.openlibrary.org/b/isbn/142313494X-L.jpg",
    genre: "Fantasia, Aventura",
    synopsis:
      "Percy descobre ser um semideus e parte em uma missão para recuperar o raio-mestre de Zeus e evitar uma guerra entre os deuses.",
  },
  {
    id: "senhor-aneis-sociedade",
    title: "O Senhor dos Anéis: A Sociedade do Anel",
    author: "J.R.R. Tolkien",
    coverUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    genre: "Fantasia Épica",
    synopsis:
      "Frodo inicia a jornada para destruir o Um Anel, acompanhado por uma sociedade de heróis.",
  },
  {
    id: "dom-quixote",
    title: "Dom Quixote",
    author: "Miguel de Cervantes",
    coverUrl: "https://covers.openlibrary.org/b/id/554615-L.jpg",
    genre: "Clássico, Sátira",
    synopsis:
      "Um fidalgo idealista decide tornar-se cavaleiro andante e vive aventuras ao lado de Sancho Pança.",
  },
  {
    id: "pequeno-principe",
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    coverUrl: "https://covers.openlibrary.org/b/id/240726-L.jpg",
    genre: "Fábula, Filosofia",
    synopsis:
      "Um pequeno príncipe viaja por planetas e reflete sobre amizade, amor e a essência das coisas.",
  },
  {
    id: "arte-da-guerra",
    title: "A Arte da Guerra",
    author: "Sun Tzu",
    coverUrl: "https://covers.openlibrary.org/b/id/11153267-L.jpg",
    genre: "Estratégia, Filosofia",
    synopsis:
      "Tratado clássico sobre estratégia e táticas aplicáveis à guerra e à vida.",
  },
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    coverUrl: "https://covers.openlibrary.org/b/id/9281731-L.jpg",
    genre: "Distopia",
    synopsis:
      "Winston Smith luta contra um regime totalitário que controla pensamentos e reescreve a história.",
  },
  {
    id: "o-hobbit",
    title: "O Hobbit",
    author: "J.R.R. Tolkien",
    coverUrl: "https://covers.openlibrary.org/b/id/8221256-L.jpg",
    genre: "Fantasia",
    synopsis:
      "Bilbo Bolseiro embarca em uma aventura com anões para recuperar um tesouro guardado por um dragão.",
  },
  {
    id: "harry-potter-pedra-filosofal",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    coverUrl: "https://covers.openlibrary.org/b/id/10521215-L.jpg",
    genre: "Fantasia",
    synopsis:
      "Harry descobre ser um bruxo e enfrenta os primeiros desafios em Hogwarts.",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { reviews } = useReviews();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [topRatedBooks, setTopRatedBooks] = useState<BookWithRating[]>([]);
  const [livrosLendo, setLivrosLendo] = useState<LivroProgresso[]>([]);

  // Calcular livros mais bem avaliados
  useEffect(() => {
    const bookRatings = books.map(book => {
      const bookReviews = reviews.filter(r => r.bookId === book.id);
      const avgRating = bookReviews.length > 0
        ? bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length
        : 0;
      return { 
        ...book, 
        avgRating, 
        reviewCount: bookReviews.length 
      };
    });
    
    // Ordenar por avaliação e pegar apenas os que têm reviews
    const sorted = bookRatings
      .filter(b => b.reviewCount > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 8);
      
    setTopRatedBooks(sorted);
  }, [reviews]);

  // Carregar livros em leitura do usuário
  useEffect(() => {
    if (user?.uid) {
      carregarLivrosLendo();
    }
  }, [user]);

  const carregarLivrosLendo = async () => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        setLivrosLendo(dados.lendo || []);
      }
    } catch (error) {
      console.log("Erro ao carregar livros em leitura:", error);
    }
  };

  const openDetails = (book: Book) => {
    router.push({
      pathname: "/book-details",
      params: {
        id: book.id,
        title: book.title,
        author: book.author,
        image: book.coverUrl,
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Início</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Recomendados */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recomendados para você</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {books.map((b) => (
              <TouchableOpacity key={b.title} style={[styles.card, { backgroundColor: colors.card }]} onPress={() => openDetails(b)}>
                <Image source={{ uri: b.coverUrl }} style={styles.bookImage} />
                <Text numberOfLines={2} style={[styles.bookTitle, { color: colors.primary }]}>{b.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Livros Mais Bem Avaliados */}
        {topRatedBooks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}> Mais Bem Avaliados</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {topRatedBooks.map((book) => (
                <TouchableOpacity key={book.id} style={[styles.ratedCard, { backgroundColor: colors.card }]} onPress={() => openDetails(book)}>
                  <Image source={{ uri: book.coverUrl }} style={styles.bookImage} />
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFB800" />
                    <Text style={styles.ratingText}>{book.avgRating.toFixed(1)}</Text>
                  </View>
                  <Text numberOfLines={2} style={[styles.bookTitle, { color: colors.primary }]}>{book.title}</Text>
                  <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>{book.reviewCount} {book.reviewCount === 1 ? 'avaliação' : 'avaliações'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Continuar Lendo */}
        {livrosLendo.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Continuar lendo</Text>
            {livrosLendo.map((livro) => {
              const progresso = (livro.paginasLidas / livro.totalPaginas) * 100;
              return (
                <TouchableOpacity 
                  key={livro.id} 
                  style={[styles.readingCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push('/progresso')}
                >
                  <Image
                    source={{ uri: livro.imagem }}
                    style={styles.readingImage}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.readingTitle, { color: colors.text }]}>{livro.titulo}</Text>
                    <Text style={[styles.readingProgress, { color: colors.primary }]}>
                      Página {livro.paginasLidas} de {livro.totalPaginas} ({Math.round(progresso)}%)
                    </Text>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { backgroundColor: colors.primary }]} />
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Gêneros Populares */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Gêneros Populares</Text>
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>Fantasia</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>Romance</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>Suspense</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>Ciência</Text>
            </View>
          </View>
        </View>

        {/* Mais Livros para Explorar (Carrossel duplicado) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mais Livros para Explorar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {books.map((b) => (
              <TouchableOpacity key={`explore-${b.title}`} style={[styles.card, { backgroundColor: colors.card }]} onPress={() => openDetails(b)}>
                <Image source={{ uri: b.coverUrl }} style={styles.bookImage} />
                <Text numberOfLines={2} style={[styles.bookTitle, { color: colors.primary }]}>{b.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Botão de Previsão de Lançamento */}
        <TouchableOpacity 
          style={[styles.previsaoButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/previsao-lancamento' as any)}
        >
          <Ionicons name="trending-up" size={24} color="#fff" />
          <Text style={styles.previsaoButtonText}>Veja se seus livros favoritos são populares</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>

      {/* Barra de navegação inferior */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },

  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  sectionHeader: { marginBottom: 10 },
  sectionSubtitle: { fontSize: 12, marginTop: -5, marginBottom: 10 },

  card: {
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
    width: 140,
    alignItems: "center",
  },
  ratedCard: {
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
    width: 140,
    alignItems: "center",
    position: "relative",
  },
  bookImage: { width: 90, height: 120, borderRadius: 8, marginBottom: 8 },
  bookTitle: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: { 
    fontSize: 12, 
    fontWeight: "bold", 
    color: "#FFB800" 
  },
  reviewCount: { 
    fontSize: 10, 
    marginTop: 2 
  },

  previsaoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  previsaoButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },

  readingCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  readingImage: { width: 50, height: 70, borderRadius: 8 },
  readingTitle: { fontSize: 14, fontWeight: "bold" },
  readingProgress: { fontSize: 12, marginTop: 4, marginBottom: 6 },
  
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: { fontSize: 13, fontWeight: "500" },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#E8F5E9",
  },
});