import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import BottomNavBar from "../components/BottomNavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useLivros } from "@/contexts/LivrosContext";

const categories = [
  "romance","fantasia","ficção","suspense","terror","ação","drama","mistério","literatura brasileira", 
  "literatura estrangeira"
];

// Interface do livro com flag para distinguir origem
interface Book {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  rating?: number;
  ratingsCount?: number;
  publishedDate?: string;
  isLocal?: boolean; // true para livros cadastrados, false/undefined para API
  genero?: string;
  paginas?: number;
  descricao?: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { livros } = useLivros();

  const getBetterImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    
    return imageUrl
      .replace('&edge=curl', '')
      .replace('zoom=1', 'zoom=0')  // zoom=0 dá imagens maiores
      .replace('http:', 'https:');   // Garante HTTPS
  };

  const searchBooks = async (searchQuery: string) => {   // Busca livros na API do Google Books
    if (!searchQuery.trim()) {
      setBooks([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=20&langRestrict=pt`
      );
      const data = await response.json();

      let apiBooks: Book[] = [];
      if (data.items) {
        apiBooks = data.items.map((item: any) => {
          const info = item.volumeInfo;
          
          const originalThumb = 
            info.imageLinks?.thumbnail || 
            info.imageLinks?.smallThumbnail || 
            '';

          return {
            id: item.id,
            title: info.title || 'Título Desconhecido',
            author: info.authors?.[0] || 'Autor Desconhecido',
            thumbnail: getBetterImageUrl(originalThumb),
            rating: info.averageRating,
            ratingsCount: info.ratingsCount,
            publishedDate: info.publishedDate,
            isLocal: false,
          };
        });
      }

      // Buscar livros cadastrados que correspondem à pesquisa
      const localBooks: Book[] = livros
        .filter(livro => 
          livro.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          livro.autor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (livro.genero && livro.genero.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .map(livro => ({
          id: livro.id,
          title: livro.titulo,
          author: livro.autor,
          thumbnail: livro.capaUri || '',
          isLocal: true,
          genero: livro.genero,
          paginas: livro.paginas,
          descricao: livro.descricao,
        }));

      // Mesclar resultados: livros locais primeiro, depois da API
      const allBooks = [...localBooks, ...apiBooks];
      setBooks(allBooks);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchBooks(query);
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  const renderCategory = (category: string) => (
    <TouchableOpacity 
      key={category} 
      style={styles.chip} 
      onPress={() => setQuery(category)}
    >
      <Text style={styles.chipText}>{category}</Text>
    </TouchableOpacity>
  );

  // Renderiza um card de livro
  const renderBook = ({ item }: { item: Book }) => {
    // Para livros locais, navegar para a tela de preview
    // Para livros da API, manter o comportamento anterior
    const handlePress = () => {
      if (item.isLocal) {
        router.push({
          pathname: '/book-preview-local' as any,
          params: {
            id: item.id,
          }
        });
      } else {
        router.push(`/book/${item.id}` as any);
      }
    };

    return (
      <TouchableOpacity 
        style={styles.bookCard} 
        onPress={handlePress}
      >
        {item.thumbnail ? (
          <Image 
            source={{ uri: item.thumbnail }} 
            style={styles.bookImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="book" size={40} color="#ccc" />
          </View>
        )}
        
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {item.author}
          </Text>
          
          {item.isLocal && item.genero && (
            <Text style={styles.bookGenre} numberOfLines={1}>
              {item.genero}
            </Text>
          )}
          
          {item.rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>
                {item.rating.toFixed(1)}
              </Text>
              {item.ratingsCount && (
                <Text style={styles.ratingsCount}>
                  ({item.ratingsCount})
                </Text>
              )}
            </View>
          )}

          {item.isLocal && (
            <View style={styles.localBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#2E7D32" />
              <Text style={styles.localBadgeText}>Seu livro</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View>
      <View style={styles.categoriesContainer}>
        {categories.map(renderCategory)}
      </View>
      <Text style={styles.sectionTitle}>
        {query ? `Resultados para "${query}"` : 'Livros Recomendados'}
      </Text>
    </View>
  );

  const EmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Buscando livros...</Text>
        </View>
      );
    }
    if (!query) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={64} color="#ddd" />
          <Text style={styles.emptyText}>
            Digite algo para buscar livros
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="book-outline" size={64} color="#ddd" />
        <Text style={styles.emptyText}>
          Nenhum livro encontrado para "{query}"
        </Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pesquisar</Text>
        {user ? (
          <View style={{ position: 'absolute', right: 20, top: 50 }}>
            <TouchableOpacity
              onPress={() => router.push('/cadastroLivro')}
              style={{ backgroundColor: '#2E7D32', padding: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 6, fontWeight: '600' }}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Barra de Pesquisa */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#555" />
        <TextInput
          placeholder="livro, autor, gênero..."
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

      {/* Lista de Livros */}
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={books.length > 0 ? styles.columnWrapper : undefined}
      />

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', marginHorizontal: 12, marginBottom: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF', gap: 8 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 12, gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#E8F5E9' },
  chipText: { fontSize: 14, color: '#2E7D32', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 12, paddingHorizontal: 12, color: '#333' },
  listContent: { paddingHorizontal: 12, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  bookCard: { width: '48%', backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  bookImage: { width: '100%', height: 200, backgroundColor: '#f5f5f5' },
  noImage: { width: '100%', height: 200, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  bookInfo: { padding: 12 },
  bookTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  bookAuthor: { fontSize: 12, color: '#666', marginBottom: 6 },
  bookGenre: { fontSize: 11, color: '#2E7D32', marginBottom: 4, fontStyle: 'italic' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: '#333', fontWeight: '600' },
  ratingsCount: { fontSize: 10, color: '#888' },
  localBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#E8F5E9', borderRadius: 8, alignSelf: 'flex-start' },
  localBadgeText: { fontSize: 10, color: '#2E7D32', fontWeight: '600' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  emptyText: { marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 40 },
});