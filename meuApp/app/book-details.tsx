// app/book-details.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useReviews, Review } from "../contexts/ReviewsContext";
import Toast from 'react-native-toast-message';

export default function BookDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const {
    reviews,
    loading: reviewsLoading,
    createReview,
    updateReview,
    deleteReview,
    getReviewsByBook,
    getUserReview,
    likeReview,
    unlikeReview,
  } = useReviews();

  // Dados do livro
  const bookId = params.id as string || "1";
  const bookTitle = params.title as string || "Livro Exemplo";
  const bookAuthor = params.author as string || "Autor Desconhecido";
  const bookImage = params.image as string || "https://via.placeholder.com/150";

  // Estados
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [bookReviews, setBookReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | undefined>(undefined);

  useEffect(() => {
    loadReviews();
  }, [reviews, bookId, user]);

  function loadReviews() {
    const filteredReviews = getReviewsByBook(bookId);
    setBookReviews(filteredReviews);

    if (user) {
      const myReview = getUserReview(bookId, user.uid);
      setUserReview(myReview);

      if (myReview) {
        setRating(myReview.rating);
        setComment(myReview.comment);
        setIsEditing(true);
        setEditingReviewId(myReview.id);
      }
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Faça login para avaliar',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    if (rating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Selecione uma avaliação',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    if (!comment.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Escreva um comentário',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    setSubmitting(true);
    let result;

    if (isEditing && editingReviewId) {
      result = await updateReview(editingReviewId, rating, comment);
    } else {
      result = await createReview(bookId, bookTitle, bookAuthor, bookImage, rating, comment);
    }

    setSubmitting(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: isEditing ? 'Review atualizado!' : 'Review publicado!',
        visibilityTime: 2500,
        autoHide: true,
        topOffset: 50,
      });
      if (!isEditing) {
        setRating(0);
        setComment("");
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: result.error || 'Erro ao salvar review',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      "Confirmar exclusão",
      "Deseja realmente excluir este review?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const result = await deleteReview(reviewId);
            if (result.success) {
              Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Review excluído!',
                visibilityTime: 2500,
                autoHide: true,
                topOffset: 50,
              });
              setRating(0);
              setComment("");
              setIsEditing(false);
              setEditingReviewId(null);
            } else {
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: result.error || 'Erro ao excluir',
                visibilityTime: 3000,
                autoHide: true,
                topOffset: 50,
              });
            }
          },
        },
      ]
    );
  };

  const handleLike = async (reviewId: string) => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Faça login para curtir',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    const review = bookReviews.find((r) => r.id === reviewId);
    if (!review) return;

    if (review.likedBy.includes(user.uid)) {
      await unlikeReview(reviewId);
    } else {
      await likeReview(reviewId);
    }
  };

  const renderStars = (
    currentRating: number,
    onPress?: (rating: number) => void,
    size: number = 30
  ) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Ionicons
              name={star <= currentRating ? "star" : "star-outline"}
              size={size}
              color="#FFB800"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const calculateAverageRating = () => {
    if (bookReviews.length === 0) return "0.0";
    const sum = bookReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / bookReviews.length).toFixed(1);
  };

  if (reviewsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Livro</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Informações do Livro */}
        <View style={styles.bookSection}>
          <Image source={{ uri: bookImage }} style={styles.bookCover} />
          <Text style={styles.bookTitle}>{bookTitle}</Text>
          <Text style={styles.bookAuthor}>{bookAuthor}</Text>

          {/* Avaliação Média */}
          <View style={styles.ratingSection}>
            {renderStars(Number(calculateAverageRating()), undefined, 20)}
            <Text style={styles.averageRating}>
              {calculateAverageRating()} ({bookReviews.length} avaliações)
            </Text>
          </View>
        </View>

        {/* Formulário de Review */}
        {user && (
          <View style={styles.reviewForm}>
            <Text style={styles.formTitle}>
              {isEditing ? "Editar seu review" : "Avaliar este livro"}
            </Text>

            <Text style={styles.label}>Sua avaliação:</Text>
            {renderStars(rating, setRating)}

            <Text style={styles.label}>Seu comentário:</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Escreva sua opinião sobre o livro..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!submitting}
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.buttonDisabled]}
                onPress={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isEditing ? "Atualizar" : "Publicar"}
                  </Text>
                )}
              </TouchableOpacity>

              {isEditing && (
                <TouchableOpacity
                  style={[styles.deleteButton, submitting && styles.buttonDisabled]}
                  onPress={() => handleDeleteReview(editingReviewId!)}
                  disabled={submitting}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {!user && (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>
              Faça login para avaliar este livro
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginButtonText}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>
            Avaliações ({bookReviews.length})
          </Text>

          {bookReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={50} color="#CCC" />
              <Text style={styles.emptyText}>
                Nenhuma avaliação ainda. Seja o primeiro!
              </Text>
            </View>
          ) : (
            bookReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewerName}>{review.userName}</Text>
                    {renderStars(review.rating, undefined, 16)}
                  </View>
                  <Text style={styles.reviewDate}>
                    {review.createdAt.toLocaleDateString("pt-BR")}
                  </Text>
                </View>

                <Text style={styles.reviewComment}>{review.comment}</Text>

                {review.updatedAt.getTime() !== review.createdAt.getTime() && (
                  <Text style={styles.editedLabel}>(editado)</Text>
                )}

                {/* Botão de Like */}
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => handleLike(review.id)}
                >
                  <Ionicons
                    name={
                      user && review.likedBy.includes(user.uid)
                        ? "heart"
                        : "heart-outline"
                    }
                    size={20}
                    color={
                      user && review.likedBy.includes(user.uid)
                        ? "#E63946"
                        : "#666"
                    }
                  />
                  <Text style={styles.likeCount}>{review.likes}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  bookSection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  bookCover: {
    width: 150,
    height: 220,
    borderRadius: 8,
    marginBottom: 15,
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  ratingSection: {
    alignItems: "center",
  },
  averageRating: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 5,
  },
  reviewForm: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    minHeight: 100,
    marginBottom: 15,
  },
  formButtons: {
    flexDirection: "row",
    gap: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E63946",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginPrompt: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loginPromptText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
  reviewCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  reviewComment: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 10,
  },
  editedLabel: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  likeCount: {
    fontSize: 14,
    color: "#666",
  },
  bottomSpacing: {
    height: 30,
  },
});