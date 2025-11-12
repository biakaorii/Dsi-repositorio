import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Book } from '@/utils/types';
import { useShelf } from '@/utils/useShelf';
import BottomNavBar from "../components/BottomNavBar";

// Importar Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  "romance","fantasia","ficção","suspense","terror","ação","drama","mistério","literatura brasileira", 
  "literatura estrangeira"
];

export default function Search() {
  const router = useRouter();
  const { shelfId } = useLocalSearchParams<{ shelfId?: string }>();
  const { shelves } = useShelf();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [shelfModalVisible, setShelfModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false); // Novo modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const getBetterImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    
    return imageUrl
      .replace('&edge=curl', '')
      .replace('zoom=1', 'zoom=0')  // zoom=0 dá imagens maiores
      .replace('http:', 'https:');   // Garante HTTPS
  };

  const searchBooks = async (searchQuery: string) => {
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

      if (data.items) {
        const formattedBooks: Book[] = data.items.map((item: any) => {
          const info = item.volumeInfo;
          
          const originalThumb = 
            info.imageLinks?.thumbnail || 
            info.imageLinks?.smallThumbnail || 
            '';

          return {
            id: item.id,
            title: info.title || 'Título Desconhecido',
            author: info.authors?.[0] || 'Autor Desconhecido',
            img: getBetterImageUrl(originalThumb),
            likes: info.ratingsCount || 0,
          };
        });

        setBooks(formattedBooks);
      } else {
        setBooks([]);
      }
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

  // Função para adicionar livro à lista "Lendo"
  const handleAddToReading = async (book: Book) => {
    if (!user?.uid) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      let lendoAtual = [];
      if (docSnap.exists()) {
        const dados = docSnap.data();
        lendoAtual = dados.lendo || [];
      }

      // Verificar se o livro já está na lista
      const jaExiste = lendoAtual.some((l: any) => l.id === book.id);
      if (jaExiste) {
        Alert.alert("Atenção", `"${book.title}" já está na sua lista de leitura.`);
        return;
      }

      // Adicionar novo livro
      const novoLivro = {
        id: Date.now(), // ID local para distinguir
        titulo: book.title,
        paginasLidas: 0,
        totalPaginas: 200, // Valor padrão; idealmente pegaria da API
        imagem: book.img,
      };

      await updateDoc(docRef, {
        lendo: [...lendoAtual, novoLivro]
      });

      Alert.alert("Sucesso", `"${book.title}" foi adicionado à sua lista de leitura.`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível adicionar o livro.");
    }
  };

  // Função para adicionar livro à lista "Quero Ler"
const handleAddToWishlist = async (book: Book) => {
  if (!user?.uid) {
    Alert.alert("Erro", "Usuário não autenticado.");
    return;
  }

  try {
    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    let queroLerAtual = [];
    if (docSnap.exists()) {
      const dados = docSnap.data();
      queroLerAtual = dados.queroLer || [];
    }

    // Verificar se o livro já está na lista
    const jaExiste = queroLerAtual.some((l: any) => l.id === book.id);
    if (jaExiste) {
      Alert.alert("Atenção", `"${book.title}" já está na sua lista de desejos.`);
      return;
    }

    // Adicionar novo livro
    const novoLivro = {
      id: Date.now(), // ID local para distinguir
      titulo: book.title,
      paginasLidas: 0,
      totalPaginas: 200, // Valor padrão
      imagem: book.img,
      salvo: true, // Padrão
    };

    await updateDoc(docRef, {
      queroLer: [...queroLerAtual, novoLivro]
    });

    Alert.alert("Sucesso", `"${book.title}" foi adicionado à sua lista de desejos ("Quero Ler").`);
  } catch (error) {
    Alert.alert("Erro", "Não foi possível adicionar o livro.");
  }
};

// ... (resto do código até o modal de progresso)

// Substitua a parte do modal de progresso:
<TouchableOpacity
  style={styles.progressOption}
  onPress={() => {
    if (selectedBook) {
      handleAddToWishlist(selectedBook);
      setProgressModalVisible(false);
    }
  }}
>
  <Text style={styles.progressOptionText}>Adicionar à "Quero Ler"</Text>
</TouchableOpacity>

  const handleAddToShelf = (book: Book) => {
    if (shelfId) {
      // Se veio de detalhes-estante, adiciona direto
      const shelf = shelves.find(s => s.id === shelfId);
      if (shelf) {
        Alert.alert('Sucesso', `"${book.title}" será adicionado à estante`);
      }
    } else {
      // Se veio de navegação normal, mostra modal com opções de estantes
      setSelectedBook(book);
      setShelfModalVisible(true);
    }
  };

  const handleAddToProgress = (book: Book) => {
    setSelectedBook(book);
    setProgressModalVisible(true);
  };

  const renderCategory = (category: string) => (
    <TouchableOpacity 
      key={category} 
      style={styles.chip} 
      onPress={() => setQuery(category)}
    >
      <Text style={styles.chipText}>{category}</Text>
    </TouchableOpacity>
  );

  const renderBook = ({ item }: { item: Book }) => (
    <View style={styles.bookCard}>
      <TouchableOpacity 
        onPress={() => router.push(`/book/${item.id}` as any)}
      >
        {item.img ? (
          <Image 
            source={{ uri: item.img }} 
            style={styles.bookImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="book" size={40} color="#ccc" />
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        
        {item.likes && item.likes > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="heart" size={14} color="#ff6b6b" />
            <Text style={styles.ratingText}>
              {item.likes}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToProgress(item)}
        >
          <Ionicons name="book-outline" size={20} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToShelf(item)}
        >
          <Ionicons name="add-circle" size={20} color="#2E7D32" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderShelfOption = (shelf: any) => (
    <TouchableOpacity
      key={shelf.id}
      style={styles.shelfOption}
      onPress={() => {
        Alert.alert('Sucesso', `Livro adicionado a "${shelf.name}"`);
        setShelfModalVisible(false);
      }}
    >
      <View style={styles.shelfOptionContent}>
        <Text style={styles.shelfOptionName}>{shelf.name}</Text>
        <Text style={styles.shelfOptionCount}>{shelf.books.length} livros</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>
          {shelfId ? 'Adicionar Livro' : 'Pesquisar'}
        </Text>
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
        numColumns={1}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={styles.listContent}
      />

      {/* Modal de Seleção de Estante */}
      <Modal
        visible={shelfModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShelfModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar a Estante</Text>
              <TouchableOpacity onPress={() => setShelfModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.shelfList}>
              {shelves.length > 0 ? (
                shelves.map(renderShelfOption)
              ) : (
                <View style={styles.noShelvesContainer}>
                  <Ionicons name="bookmarks" size={48} color="#ccc" />
                  <Text style={styles.noShelvesText}>
                    Nenhuma estante criada
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para adicionar à leitura */}
      <Modal
        visible={progressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProgressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar à Leitura</Text>
              <TouchableOpacity onPress={() => setProgressModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.progressOption}
              onPress={() => {
                if (selectedBook) {
                  handleAddToReading(selectedBook);
                  setProgressModalVisible(false);
                }
              }}
            >
              <Text style={styles.progressOptionText}>Adicionar à "Lendo"</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.progressOption}
              onPress={() => {
                if (selectedBook) {
                  // Aqui você pode adicionar a lógica para "Quero Ler" ou "Lidos"
                  Alert.alert("Funcionalidade", "Opção ainda não implementada.");
                  setProgressModalVisible(false);
                }
              }}
            >
              <Text style={styles.progressOptionText}>Adicionar à "Quero Ler"</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  bookCard: { 
    width: '100%', 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    overflow: 'hidden', 
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  bookImage: { width: 70, height: 100, backgroundColor: '#f5f5f5', borderRadius: 4 },
  noImage: { width: 70, height: 100, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  bookInfo: { flex: 1, padding: 12 },
  bookTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  bookAuthor: { fontSize: 12, color: '#666', marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: '#ff6b6b', fontWeight: '600' },
  ratingsCount: { fontSize: 10, color: '#888' },
  buttonGroup: { flexDirection: 'column', justifyContent: 'space-around', padding: 8 },
  addButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  emptyText: { marginTop: 16, fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 40 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2E7D32' },
  shelfList: { paddingHorizontal: 12, paddingVertical: 8 },
  shelfOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  shelfOptionContent: { flex: 1 },
  shelfOptionName: { fontSize: 14, fontWeight: '600', color: '#333' },
  shelfOptionCount: { fontSize: 12, color: '#999', marginTop: 4 },
  noShelvesContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  noShelvesText: { fontSize: 14, color: '#999', marginTop: 12 },
  progressOption: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  progressOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});