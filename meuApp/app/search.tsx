import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import BottomNavBar from "../components/BottomNavBar";

const categories = ["romance", "fantasia", "ficção", "suspense", "terror", "ação", "drama", "mistério", "literatura brasileira", "literatura estrangeira"];

const mockBooks = [
  { id: "1", title: "O Hobbit", author: "J. R. R. Tolkien", likes: 10000, img: "https://covers.openlibrary.org/b/id/14849956-M.jpg" },
  { id: "2", title: "Harry Potter", author: "J. K. Rowling", likes: 10000, img: "https://covers.openlibrary.org/b/id/10521215-L.jpg" },
  { id: "3", title: "1984", author: "George Orwell", likes: 8500, img: "https://covers.openlibrary.org/b/id/12345678-M.jpg" },
  { id: "4", title: "Dom Casmurro", author: "Machado de Assis", likes: 7200, img: "https://covers.openlibrary.org/b/id/87654321-M.jpg" },
];

interface Book {
  id: string;
  title: string;
  author: string;
  likes: number;
  img: string;
  genero?: string;
  descricao?: string;
  editora?: string;
  ISBN_13?: string;
  ISBN_10?: string;
  ano?: number;
  rating?: number;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [books] = useState<Book[]>(mockBooks);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [sortBy] = useState<'relevance' | 'likes' | 'rating' | 'year'>('relevance');
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const normalize = (s: any) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const filterBooks = (q: string) => {
    if (!q) return books;
    const tokens = normalize(q).split(/\s+/).filter(Boolean);
    const fields = ['title', 'author', 'genero', 'descricao', 'editora', 'ISBN_13', 'ISBN_10'];
    
    return books.filter(book => {
      const hay = fields.map(f => normalize((book as any)[f] ?? '')).join(' ');
      return tokens.every(t => hay.includes(t));
    });
  };

  const sortBooks = (list: Book[]) => {
    if (sortBy === 'likes') return [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    if (sortBy === 'year') return [...list].sort((a, b) => (b.ano || 0) - (a.ano || 0));
    return list;
  };

  const filteredBooks = useMemo(() => sortBooks(filterBooks(debouncedQuery)), [books, debouncedQuery, sortBy]);

  const renderCategory = (item: string) => (
    <TouchableOpacity key={item} style={styles.chip} onPress={() => setQuery(item)}>
      <Text style={styles.chipText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderBook = ({ item }: { item: Book }) => (
    <TouchableOpacity style={styles.bookCard} onPress={() => router.push(`/book/${item.id}` as any)}>
      <Image source={{ uri: item.img }} style={styles.bookImage} />
      <View style={styles.bookTextContainer}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
        <Text style={styles.bookLikes}>{item.likes} curtidas</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.categoriesContainer}>{categories.map(renderCategory)}</View>
      <Text style={styles.sectionTitle}>
        {debouncedQuery ? `Resultados para "${debouncedQuery}"` : 'Livros que você talvez goste'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesquisar</Text>
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
        <TextInput
          placeholder="livro, autor, gênero, etc..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={24} color="#808080" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filteredBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>Nenhum livro encontrado para "{debouncedQuery}"</Text>
          </View>
        }
        contentContainerStyle={styles.resultsContainer}
        columnWrapperStyle={styles.columnWrapper}
      />
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20, paddingTop: 50, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', marginHorizontal: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF' },
  searchIcon: { marginRight: 6 },
  input: { flex: 1, fontSize: 16, paddingVertical: 4, fontWeight: "bold", color: '#333' },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12, paddingHorizontal: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#E8F5E9', marginRight: 8, marginBottom: 8 },
  chipText: { fontSize: 14, color: '#2E7D32', fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 12, paddingHorizontal: 12 },
  resultsContainer: { paddingBottom: 20 },
  columnWrapper: { justifyContent: 'space-between' },
  bookCard: { width: '48%', marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  bookImage: { width: '100%', height: 150, borderRadius: 6, resizeMode: 'cover' },
  bookTextContainer: { marginTop: 8 },
  bookTitle: { fontSize: 14, fontWeight: "600", color: '#333', lineHeight: 20 },
  bookAuthor: { fontSize: 12, color: '#666', marginTop: 2 },
  bookLikes: { fontSize: 11, color: '#444', marginTop: 4 },
  noResultsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  noResultsText: { fontSize: 16, color: '#666', textAlign: 'center' },
});