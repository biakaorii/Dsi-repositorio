import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import BottomNavBar from "../components/BottomNavBar";

type Book = {
  title: string;
  author: string;
  coverUrl: string;
  genre: string;
  synopsis: string;
};

const books: Book[] = [
  {
    title: "Percy Jackson e o Ladrão de Raios",
    author: "Rick Riordan",
    coverUrl: "https://covers.openlibrary.org/b/isbn/142313494X-L.jpg",
    genre: "Fantasia, Aventura",
    synopsis:
      "Percy descobre ser um semideus e parte em uma missão para recuperar o raio-mestre de Zeus e evitar uma guerra entre os deuses.",
  },
  {
    title: "O Senhor dos Anéis: A Sociedade do Anel",
    author: "J.R.R. Tolkien",
    coverUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    genre: "Fantasia Épica",
    synopsis:
      "Frodo inicia a jornada para destruir o Um Anel, acompanhado por uma sociedade de heróis.",
  },
  {
    title: "Dom Quixote",
    author: "Miguel de Cervantes",
    coverUrl: "https://covers.openlibrary.org/b/id/554615-L.jpg",
    genre: "Clássico, Sátira",
    synopsis:
      "Um fidalgo idealista decide tornar-se cavaleiro andante e vive aventuras ao lado de Sancho Pança.",
  },
  {
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    coverUrl: "https://covers.openlibrary.org/b/id/240726-L.jpg",
    genre: "Fábula, Filosofia",
    synopsis:
      "Um pequeno príncipe viaja por planetas e reflete sobre amizade, amor e a essência das coisas.",
  },
  {
    title: "A Arte da Guerra",
    author: "Sun Tzu",
    coverUrl: "https://covers.openlibrary.org/b/id/11153267-L.jpg",
    genre: "Estratégia, Filosofia",
    synopsis:
      "Tratado clássico sobre estratégia e táticas aplicáveis à guerra e à vida.",
  },
  {
    title: "1984",
    author: "George Orwell",
    coverUrl: "https://covers.openlibrary.org/b/id/9281731-L.jpg",
    genre: "Distopia",
    synopsis:
      "Winston Smith luta contra um regime totalitário que controla pensamentos e reescreve a história.",
  },
  {
    title: "O Hobbit",
    author: "J.R.R. Tolkien",
    coverUrl: "https://covers.openlibrary.org/b/id/8221256-L.jpg",
    genre: "Fantasia",
    synopsis:
      "Bilbo Bolseiro embarca em uma aventura com anões para recuperar um tesouro guardado por um dragão.",
  },
  {
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

  const openDetails = (book: Book) => {
    router.push({
      pathname: "/book-details",
      params: {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        genre: book.genre,
        synopsis: book.synopsis,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Início</Text>
        <Ionicons name="notifications-outline" size={24} color="#2E7D32" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Descubra novos livros 📚</Text>
        </View>

        {/* Recomendados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendados para você</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {books.map((b) => (
              <TouchableOpacity key={b.title} style={styles.card} onPress={() => openDetails(b)}>
                <Image source={{ uri: b.coverUrl }} style={styles.bookImage} />
                <Text numberOfLines={2} style={styles.bookTitle}>{b.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Continuar Lendo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continuar lendo</Text>
          <View style={styles.readingCard}>
            <Image
              source={{ uri: "https://covers.openlibrary.org/b/id/10521656-L.jpg" }}
              style={styles.readingImage}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.readingTitle}>Harry Potter</Text>
              <Text style={styles.readingProgress}>Capítulo 8 de 20</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
          </View>
        </View>

        {/* Gêneros Populares */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gêneros Populares</Text>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}><Text style={styles.tagText}>Fantasia</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Romance</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Suspense</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Ciência</Text></View>
          </View>
        </View>

        {/* Mais Livros para Explorar (Carrossel duplicado) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mais Livros para Explorar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {books.map((b) => (
              <TouchableOpacity key={`explore-${b.title}`} style={styles.card} onPress={() => openDetails(b)}>
                <Image source={{ uri: b.coverUrl }} style={styles.bookImage} />
                <Text numberOfLines={2} style={styles.bookTitle}>{b.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Barra de navegação inferior */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },

  banner: {
    backgroundColor: "#E8F5E9",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  bannerText: { fontSize: 16, fontWeight: "600", color: "#2E7D32" },

  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#333" },

  card: {
    backgroundColor: "#F1F8E9",
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
    width: 140,
    alignItems: "center",
  },
  bookImage: { width: 90, height: 120, borderRadius: 8, marginBottom: 8 },
  bookTitle: { fontSize: 12, fontWeight: "600", textAlign: "center", color: "#2E7D32" },

  readingCard: {
    flexDirection: "row",
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  readingImage: { width: 50, height: 70, borderRadius: 8 },
  readingTitle: { fontSize: 14, fontWeight: "bold", color: "#333" },
  readingProgress: { fontSize: 12, color: "#2E7D32" },

  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    backgroundColor: "#C8E6C9",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: { fontSize: 13, color: "#2E7D32", fontWeight: "500" },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#E8F5E9",
  },
});