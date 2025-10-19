import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from 'expo-router';
import BottomNavBar from "../components/BottomNavBar";

const categories = [
  "romance", "fantasia", "ficção", "suspense", "terror", "ação", 
  "drama", "mistério", "literatura brasileira", "literatura estrangeira"
];

const mockBooks = [
  { id: "1", title: "O Hobbit", author: "J. R. R. Tolkien", likes: 10000, img: "https://covers.openlibrary.org/b/id/14849956-M.jpg" },
  { id: "2", title: "Harry Potter", author: "J. K. Rowlling", likes: 10000, img: "https://covers.openlibrary.org/b/id/10521215-L.jpg" },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const renderCategory = (item: string) => (
    <TouchableOpacity key={item} style={styles.chip}>
      <Text style={styles.chipText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderBook = (item: any) => (
    <View key={item.id} style={styles.bookCard}>
      <Image source={{ uri: item.img }} style={styles.bookImage} />
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
        <Text style={styles.bookLikes}>{item.likes} Likes</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#555" style={{ marginRight: 6 }} />
        <TextInput
          placeholder="livro, autor, gênero, etc..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categorias */}
        <View style={styles.categoriesContainer}>
          {categories.map(renderCategory)}
        </View>

        {/* Seções */}
        <Text style={styles.sectionTitle}>Livros que você talvez goste</Text>
        <View style={styles.sectionRow}>
          {mockBooks.map(renderBook)}
        </View>

        <Text style={styles.sectionTitle}>Fantasia</Text>
        <View style={styles.sectionRow}>
          {mockBooks.map(renderBook)}
        </View>
      </ScrollView>

      {/* Navbar inferior */}
      <BottomNavBar />

    </View>
  );
}

// estilos corrigidos com StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    fontWeight: "bold", // ✅ corrigido
  },
  clearText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#808080',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
    gap: 8,
    paddingHorizontal: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: "bold", // ✅ corrigido
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold", // ✅ corrigido
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bookCard: {
    flex: 1,
    marginRight: 12,
    alignItems: 'flex-start',
    paddingHorizontal: 12,
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 6,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600", // ✅ corrigido
    marginTop: 6,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#666',
  },
  bookLikes: {
    fontSize: 12,
    color: '#444',
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#E8F5E9",
  },
});
