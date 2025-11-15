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
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomNavBar from "../components/BottomNavBar";
import Toast from 'react-native-toast-message';

// Importar Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";

// Definindo o tipo Book localmente
interface Book {
  id: string;
  title: string;
  author: string;
  img?: string;
  likes?: number;
}

// Definindo o tipo Shelf localmente
interface Shelf {
  id: string;
  name: string;
  description?: string;
  books: (number | string)[];
}

const categories = [
  "romance","fantasia","ficção","suspense","terror","ação","drama","mistério","literatura brasileira", 
  "literatura estrangeira"
];

export default function Search() {
  const router = useRouter();
  const { shelfId } = useLocalSearchParams<{ shelfId?: string }>();
  
  // Simulando estantes (você pode carregar do Firebase se quiser)
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [shelfModalVisible, setShelfModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [createShelfModalVisible, setCreateShelfModalVisible] = useState(false);
  const [novaEstanteNome, setNovaEstanteNome] = useState('');
  const [novaEstanteDescricao, setNovaEstanteDescricao] = useState('');

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
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Usuário não autenticado.',
        visibilityTime: 3000,
      });
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
        Toast.show({
          type: 'info',
          text1: 'Atenção',
          text2: `"${book.title}" já está na sua lista de leitura.`,
          visibilityTime: 3000,
        });
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

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: `"${book.title}" foi adicionado à sua lista de leitura.`,
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível adicionar o livro.',
        visibilityTime: 3000,
      });
    }
  };

  // Função para adicionar livro à lista "Quero Ler"
  const handleAddToWishlist = async (book: Book) => {
    if (!user?.uid) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Usuário não autenticado.',
        visibilityTime: 3000,
      });
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
        Toast.show({
          type: 'info',
          text1: 'Atenção',
          text2: `"${book.title}" já está na sua lista de desejos.`,
          visibilityTime: 3000,
        });
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

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: `"${book.title}" foi adicionado à sua lista de desejos ("Quero Ler").`,
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível adicionar o livro.',
        visibilityTime: 3000,
      });
    }
  };

  // Função para adicionar livro a uma estante existente
  const handleAddBookToShelf = async (book: Book, shelfId: string) => {
    if (!user?.uid) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Usuário não autenticado.',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        const estantes = dados.estantes || [];

        const estanteIndex = estantes.findIndex((e: any) => e.id === shelfId);
        if (estanteIndex !== -1) {
          const livroJaNaEstante = estantes[estanteIndex].livros.some((id: any) => id === book.id);
          if (livroJaNaEstante) {
            Toast.show({
              type: 'info',
              text1: 'Atenção',
              text2: `"${book.title}" já está nesta estante.`,
              visibilityTime: 3000,
            });
            return;
          }

          estantes[estanteIndex].livros.push(book.id);

          await updateDoc(docRef, {
            estantes: estantes
          });

          Toast.show({
            type: 'success',
            text1: 'Sucesso',
            text2: `"${book.title}" foi adicionado à estante.`,
            visibilityTime: 3000,
          });
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível adicionar o livro à estante.',
        visibilityTime: 3000,
      });
    }
  };

  // Função para criar nova estante com o livro selecionado
  const handleCreateNewShelf = async () => {
    if (!user?.uid || !selectedBook) return;

    if (!novaEstanteNome.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O nome da estante é obrigatório.',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      let estantesAtuais = [];
      if (docSnap.exists()) {
        const dados = docSnap.data();
        estantesAtuais = dados.estantes || [];
      }

      const novaEstante = {
        id: Date.now().toString(),
        nome: novaEstanteNome.trim(),
        descricao: novaEstanteDescricao.trim() || undefined,
        livros: [selectedBook.id], // Adiciona o livro imediatamente
      };

      estantesAtuais.push(novaEstante);

      await updateDoc(docRef, {
        estantes: estantesAtuais
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: `"${selectedBook.title}" foi adicionado à nova estante "${novaEstante.nome}".`,
        visibilityTime: 3000,
      });
      setCreateShelfModalVisible(false);
      setNovaEstanteNome('');
      setNovaEstanteDescricao('');
      setShelfModalVisible(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível criar a estante.',
        visibilityTime: 3000,
      });
    }
  };

  const openCreateShelfModal = () => {
    setShelfModalVisible(false);
    setCreateShelfModalVisible(true);
  };

  const handleAddToShelf = (book: Book) => {
    if (shelfId) {
      // Se veio de detalhes-estante, adiciona direto
      // Aqui você pode carregar estantes do Firebase se quiser
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: `"${book.title}" será adicionado à estante`,
        visibilityTime: 3000,
      });
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
          {item.title || 'Título Desconhecido'}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author || 'Autor Desconhecido'}
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
        if (selectedBook) {
          handleAddBookToShelf(selectedBook, shelf.id);
          setShelfModalVisible(false);
        }
      }}
    >
      <View style={styles.shelfOptionContent}>
        <Text style={styles.shelfOptionName}>{shelf.name}</Text>
        <Text style={styles.shelfOptionCount}>{shelf.livros?.length || 0} livros</Text>
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
                <>
                  {shelves.map(renderShelfOption)}
                  <TouchableOpacity
                    style={styles.shelfOption}
                    onPress={openCreateShelfModal}
                  >
                    <View style={styles.shelfOptionContent}>
                      <Text style={styles.shelfOptionName}>Criar Nova Estante</Text>
                    </View>
                    <Ionicons name="add" size={20} color="#2E7D32" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.shelfOption}
                  onPress={openCreateShelfModal}
                >
                  <View style={styles.shelfOptionContent}>
                    <Text style={styles.shelfOptionName}>Criar Primeira Estante</Text>
                  </View>
                  <Ionicons name="add" size={20} color="#2E7D32" />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para criar nova estante */}
      <Modal
        visible={createShelfModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateShelfModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Nova Estante</Text>
              <TouchableOpacity onPress={() => setCreateShelfModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome da estante"
              value={novaEstanteNome}
              onChangeText={setNovaEstanteNome}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição (opcional)"
              value={novaEstanteDescricao}
              onChangeText={setNovaEstanteDescricao}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateShelfModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateNewShelf}
              >
                <Text style={styles.modalButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>
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
                  handleAddToWishlist(selectedBook);
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
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', marginHorizontal: 12, marginBottom: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF', gap: 8 },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#000', // ✅ Cor do texto escura para contraste
    backgroundColor:'#fff', // ✅ Fundo branco para o input
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    marginBottom: 12 
  },
  textArea: {
    height: 80,
    color: '#000', // ✅ Cor do texto escura
    backgroundColor:'#fff', // ✅ Fundo branco
    textAlignVertical: 'top',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
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
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', paddingBottom: 12 },
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confirmButtonText: {
    color: '#fff',
  }
});