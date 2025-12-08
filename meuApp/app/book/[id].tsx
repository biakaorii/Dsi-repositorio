import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";

interface Book {
  id: string;
  title: string;
  author: string;
  img?: string;
  description?: string;
  averageRating?: number;
  ratingsCount?: number;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
}

export default function BookDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0); // 0 a 5
  const [comment, setComment] = useState('');

  // Função para buscar dados do livro via Google Books API
  const fetchBookDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
      const data = await response.json();

      if (data) {
        const info = data.volumeInfo;
        const rating = info.averageRating || 0;
        const count = info.ratingsCount || 0;

        const bookData = {
          id: data.id,
          title: info.title || 'Título Desconhecido',
          author: info.authors?.[0] || 'Autor Desconhecido',
          img: info.imageLinks?.thumbnail || '',
          description: info.description || 'Sem descrição disponível.',
          averageRating: rating,
          ratingsCount: count,
          publisher: info.publisher,
          publishedDate: info.publishedDate,
          pageCount: info.pageCount,
          categories: info.categories,
        };

        setBook(bookData);

        // Redirecionar para book-details com todos os parâmetros
        router.replace({
          pathname: '/book-details',
          params: {
            id: bookData.id,
            title: bookData.title,
            author: bookData.author,
            image: bookData.img || '',
            description: bookData.description || '',
            genre: bookData.categories?.join(', ') || '',
            pages: bookData.pageCount?.toString() || '',
            publisher: bookData.publisher || '',
            year: bookData.publishedDate?.split('-')[0] || '', // Extrair apenas o ano
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do livro:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar os detalhes do livro.',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  // Função para salvar avaliação
  const handlePublishReview = async () => {
    if (!user?.uid || !book) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Usuário não autenticado ou livro inválido.',
        visibilityTime: 3000,
      });
      return;
    }

    if (userRating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, selecione uma nota.',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      let reviewsAtual = [];
      if (docSnap.exists()) {
        const dados = docSnap.data();
        reviewsAtual = dados.avaliacoes || [];
      }

      // Verifica se já avaliou esse livro
      const jaAvaliou = reviewsAtual.some((r: any) => r.bookId === book.id);
      if (jaAvaliou) {
        Toast.show({
          type: 'info',
          text1: 'Atenção',
          text2: 'Você já avaliou este livro.',
          visibilityTime: 3000,
        });
        return;
      }

      const novaAvaliacao = {
        id: Date.now(),
        bookId: book.id,
        titulo: book.title,
        autor: book.author,
        nota: userRating,
        comentario: comment.trim(),
        data: new Date().toISOString().split('T')[0],
      };

      await updateDoc(docRef, {
        avaliacoes: [...reviewsAtual, novaAvaliacao]
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Sua avaliação foi publicada!',
        visibilityTime: 3000,
      });

      // Limpa formulário
      setUserRating(0);
      setComment('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar sua avaliação.',
        visibilityTime: 3000,
      });
    }
  };

  // Renderiza estrelas
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <TouchableOpacity key={i} onPress={() => setUserRating(i + 1)}>
        <Ionicons
          name={i < rating ? "star" : "star-outline"}
          size={24}
          color={i < rating ? "#FFD700" : "#999"}
          style={{ marginHorizontal: 2 }}
        />
      </TouchableOpacity>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="book" size={64} color="#ccc" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Livro não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonContainer}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Livro</Text>
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {/* Capa e Info Básica */}
      <View style={styles.coverContainer}>
        {book.img ? (
          <Image source={{ uri: book.img }} style={styles.coverImage} />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="book" size={64} color="#ccc" />
          </View>
        )}
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        <View style={styles.ratingContainer}>
          {renderStars(book.averageRating || 0)}
          <Text style={styles.ratingText}>
            {book.averageRating?.toFixed(1)} ({book.ratingsCount} avaliações)
          </Text>
        </View>
      </View>

      {/* Avaliação do Usuário */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliar este livro</Text>
        <Text style={styles.label}>Sua avaliação:</Text>
        <View style={styles.starRow}>
          {renderStars(userRating)}
        </View>
        <Text style={styles.label}>Seu comentário:</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Escreva sua opinião sobre o livro..."
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.publishButton} onPress={handlePublishReview}>
          <Text style={styles.publishButtonText}>Publicar</Text>
        </TouchableOpacity>
      </View>

      {/* Avaliações Existentes (exemplo - pode ser expandido com Firebase) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliações (3)</Text>
        <View style={styles.reviewItem}>
          <View style={styles.avatar} />
          <View style={styles.reviewContent}>
            <Text style={styles.reviewerName}>kaori</Text>
            <View style={styles.reviewStars}>
              {renderStars(4)}
            </View>
            <Text style={styles.reviewDate}>10/11/2025</Text>
          </View>
        </View>
        {/* Adicione mais avaliações aqui conforme necessário */}
      </View>

      {/* Espaçamento final */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButtonContainer: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  heartButton: {
    padding: 8,
  },
  coverContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  coverImage: {
    width: 180,
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  noImage: {
    width: 180,
    height: 250,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#333',
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
    fontSize: 14,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  publishButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  reviewContent: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  reviewStars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 16,
  },
  backButton: {
    color: '#2E7D32',
    fontSize: 16,
    marginTop: 12,
    textDecorationLine: 'underline',
  },
});