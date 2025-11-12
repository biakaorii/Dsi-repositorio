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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useReviews, Review } from "../contexts/ReviewsContext";
import { useFavorites } from "../contexts/FavoritesContext";
import Toast from 'react-native-toast-message';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export default function BookDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [bookReviews, setBookReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | undefined>(undefined);
  const [userPhotos, setUserPhotos] = useState<{ [userId: string]: string }>({});

  useEffect(() => {
    loadReviews();
  }, [reviews, bookId, user]);

  useEffect(() => {
    loadUserPhotos();
  }, [bookReviews]);

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
      } else {
        // Resetar estados quando não há review do usuário
        setRating(0);
        setComment("");
        setIsEditing(false);
        setEditingReviewId(null);
      }
    }
  }

  async function loadUserPhotos() {
    const photos: { [userId: string]: string } = {};
    
    // Buscar foto de perfil atual de cada usuário
    for (const review of bookReviews) {
      try {
        const userDocRef = doc(db, 'users', review.userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.profilePhotoUrl) {
            photos[review.userId] = userData.profilePhotoUrl;
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar foto do usuário ${review.userId}:`, error);
      }
    }
    
    setUserPhotos(photos);
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

  const handleDeleteReview = async () => {
    if (!editingReviewId) {
      Alert.alert('Erro', 'Review não encontrado');
      return;
    }

    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    
    if (!editingReviewId) return;

    setSubmitting(true);
    
    const result = await deleteReview(editingReviewId);
    
    setSubmitting(false);
    
    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Review excluído com sucesso!',
        visibilityTime: 2500,
        autoHide: true,
        topOffset: 50,
      });
      
      // Limpar formulário
      setRating(0);
      setComment("");
      setIsEditing(false);
      setEditingReviewId(null);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: result.error || 'Não foi possível excluir a review',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
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

  const handleFavoriteToggle = async () => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Faça login para favoritar',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    const favorite = isFavorite(bookId);
    
    if (favorite) {
      const result = await removeFavorite(bookId);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Removido',
          text2: 'Livro removido dos favoritos',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 50,
        });
      }
    } else {
      const result = await addFavorite(bookId, bookTitle, bookAuthor, bookImage);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Favoritado',
          text2: 'Livro adicionado aos favoritos',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 50,
        });
      }
    }
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
        <TouchableOpacity onPress={handleFavoriteToggle}>
          <Ionicons 
            name={isFavorite(bookId) ? "heart" : "heart-outline"} 
            size={24} 
            color="#E63946" 
          />
        </TouchableOpacity>
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

              {isEditing && editingReviewId && (
                <TouchableOpacity
                  style={[styles.deleteButton, submitting && styles.buttonDisabled]}
                  onPress={handleDeleteReview}
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
            bookReviews.map((review) => {
              // Usar foto atual do usuário, se disponível
              const currentUserPhoto = userPhotos[review.userId];
              
              return (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewHeaderLeft}>
                      <TouchableOpacity
                        onPress={() => {
                          // Navegar para o perfil do usuário
                          router.push({
                            pathname: "/perfil-usuario" as any,
                            params: { userId: review.userId }
                          });
                        }}
                      >
                        {currentUserPhoto ? (
                          <Image
                            source={{ uri: `${currentUserPhoto}?t=${Date.now()}` }}
                            style={styles.profilePhoto}
                          />
                        ) : (
                          <View style={styles.profilePhotoPlaceholder}>
                            <Ionicons name="person" size={24} color="#999" />
                          </View>
                        )}
                      </TouchableOpacity>
                      <View style={styles.reviewerInfo}>
                        <TouchableOpacity
                          onPress={() => {
                            // Navegar para o perfil do usuário
                            router.push({
                              pathname: "/perfil-usuario" as any,
                              params: { userId: review.userId }
                            });
                          }}
                          activeOpacity={0.6}
                        >
                          <View style={styles.reviewerNameContainer}>
                            {review.userProfileType === 'empreendedor' && review.businessName ? (
                              <>
                                <Ionicons name="storefront" size={16} color="#4CAF50" style={styles.storeIcon} />
                                <Text style={[styles.reviewerName, styles.businessName]}>
                                  {review.businessName}
                                </Text>
                              </>
                            ) : (
                              <Text style={styles.reviewerName}>
                                {review.userName}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                        {renderStars(review.rating, undefined, 16)}
                      </View>
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
              );
            })
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={50} color="#E63946" />
            </View>
            
            <Text style={styles.modalTitle}>Excluir Review</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja excluir sua avaliação? Esta ação não pode ser desfeita.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonTextDelete}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  reviewHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  profilePhoto: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E9ECEF",
  },
  profilePhotoPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  storeIcon: {
    marginRight: 6,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textDecorationLine: "underline",
  },
  businessName: {
    color: "#4CAF50",
    fontWeight: "700",
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
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  modalButtonDelete: {
    backgroundColor: "#E63946",
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalButtonTextDelete: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});