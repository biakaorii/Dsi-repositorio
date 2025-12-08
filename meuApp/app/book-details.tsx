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
import { useTheme } from "../contexts/ThemeContext";
import { useReviews, Review } from "../contexts/ReviewsContext";
import { useFavorites } from "../contexts/FavoritesContext";
import Toast from 'react-native-toast-message';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { GlobalStyles, Colors } from '../styles/theme';

export default function BookDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();
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
  const bookGenre = params.genre as string;
  const bookPages = params.pages as string;
  const bookPublisher = params.publisher as string;
  const bookYear = params.year as string;
  const bookDescription = params.description as string;

  // Estados
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Detalhes do Livro</Text>
        <TouchableOpacity onPress={handleFavoriteToggle}>
          <Ionicons 
            name={isFavorite(bookId) ? "heart" : "heart-outline"} 
            size={24} 
            color={colors.error} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Informações do Livro */}
        <View style={[styles.bookSection, { backgroundColor: colors.card }]}>
          <Image source={{ uri: bookImage }} style={styles.bookCover} />
          <Text style={[styles.bookTitle, { color: colors.text }]}>{bookTitle}</Text>
          <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>{bookAuthor}</Text>

          {/* Avaliação Média */}
          <View style={styles.ratingSection}>
            {renderStars(Number(calculateAverageRating()), undefined, 20)}
            <Text style={styles.averageRating}>
              {calculateAverageRating()} ({bookReviews.length} avaliações)
            </Text>
          </View>

          {/* Botão Mais Detalhes */}
          {(bookGenre || bookPages || bookPublisher || bookYear || bookDescription) && (
            <TouchableOpacity 
              style={[styles.moreDetailsButton, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}
              onPress={() => setShowMoreDetails(!showMoreDetails)}
            >
              <Text style={[styles.moreDetailsButtonText, { color: colors.primary }]}>
                {showMoreDetails ? "Menos Detalhes" : "Mais Detalhes"}
              </Text>
              <Ionicons 
                name={showMoreDetails ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          )}

          {/* Seção Expansível de Detalhes */}
          {showMoreDetails && (
            <View style={[styles.detailsSection, { backgroundColor: colors.inputBackground }]}>
              {bookGenre && (
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.detailLabel, { color: colors.text }]}>Gênero:</Text>
                  <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{bookGenre}</Text>
                </View>
              )}

              {bookPages && (
                <View style={styles.detailRow}>
                  <Ionicons name="book-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.detailLabel, { color: colors.text }]}>Páginas:</Text>
                  <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{bookPages}</Text>
                </View>
              )}

              {bookPublisher && (
                <View style={styles.detailRow}>
                  <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.detailLabel, { color: colors.text }]}>Editora:</Text>
                  <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{bookPublisher}</Text>
                </View>
              )}

              {bookYear && (
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.detailLabel, { color: colors.text }]}>Ano:</Text>
                  <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{bookYear}</Text>
                </View>
              )}

              {bookDescription && (
                <View style={styles.detailRowColumn}>
                  <View style={styles.detailRowHeader}>
                    <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
                    <Text style={[styles.detailLabel, { color: colors.text }]}>Descrição:</Text>
                  </View>
                  <Text style={[styles.detailDescription, { color: colors.textSecondary }]}>{bookDescription}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Formulário de Review */}
        {user && (
          <View style={[styles.reviewForm, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {isEditing ? "Editar seu review" : "Avaliar este livro"}
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>Sua avaliação:</Text>
            {renderStars(rating, setRating)}

            <Text style={[styles.label, { color: colors.text }]}>Seu comentário:</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              placeholder="Escreva sua opinião sobre o livro..."
              placeholderTextColor={colors.placeholder}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!submitting}
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }, submitting && styles.buttonDisabled]}
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
                  style={[styles.deleteButton, { backgroundColor: colors.error }, submitting && styles.buttonDisabled]}
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
          <View style={[styles.loginPrompt, { backgroundColor: colors.card }]}>
            <Text style={[styles.loginPromptText, { color: colors.textSecondary }]}>
              Faça login para avaliar este livro
            </Text>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginButtonText}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Reviews */}
        <View style={styles.reviewsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Avaliações ({bookReviews.length})
          </Text>

          {bookReviews.length === 0 ? (
            <View style={[GlobalStyles.emptyState, styles.emptyState]}>
              <Ionicons name="chatbubbles-outline" size={50} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Nenhuma avaliação ainda. Seja o primeiro!
              </Text>
            </View>
          ) : (
            bookReviews.map((review) => {
              // Usar foto atual do usuário, se disponível
              const currentUserPhoto = userPhotos[review.userId];
              
              return (
                <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.card }]}>
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
                            style={[styles.profilePhoto, { backgroundColor: colors.inputBackground }]}
                          />
                        ) : (
                          <View style={[styles.profilePhotoPlaceholder, { backgroundColor: colors.inputBackground }]}>
                            <Ionicons name="person" size={24} color={colors.textSecondary} />
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
                          {review.userProfileType === 'empreendedor' && review.businessName ? (
                            <View style={styles.reviewerNameContainer}>
                              <Ionicons name="storefront" size={18} color="#4CAF50" style={styles.storeIcon} />
                              <Text style={[styles.reviewerName, styles.businessName]}>
                                {review.businessName}
                              </Text>
                              <View style={styles.businessBadge}>
                                <Text style={styles.businessBadgeText}>LIVRARIA</Text>
                              </View>
                            </View>
                          ) : (
                            <Text style={[styles.reviewerName, { color: colors.text }]}>
                              {review.userName}
                            </Text>
                          )}
                        </TouchableOpacity>
                        {renderStars(review.rating, undefined, 16)}
                      </View>
                    </View>
                    <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                      {review.createdAt.toLocaleDateString("pt-BR")}
                    </Text>
                  </View>

                  <Text style={[styles.reviewComment, { color: colors.text }]}>{review.comment}</Text>

                  {review.updatedAt.getTime() !== review.createdAt.getTime() && (
                    <Text style={[styles.editedLabel, { color: colors.textSecondary }]}>(editado)</Text>
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
                          ? colors.error
                          : colors.textSecondary
                      }
                    />
                    <Text style={[styles.likeCount, { color: colors.textSecondary }]}>{review.likes}</Text>
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
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={50} color={colors.error} />
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.text }]}>Excluir Review</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Tem certeza que deseja excluir sua avaliação? Esta ação não pode ser desfeita.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.modalButtonTextCancel, { color: colors.text }]}>Cancelar</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  bookSection: {
    alignItems: "center",
    padding: 20,
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
    textAlign: "center",
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 16,
    marginBottom: 15,
  },
  ratingSection: {
    alignItems: "center",
  },
  averageRating: {
    fontSize: 14,
    marginTop: 5,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 5,
  },
  reviewForm: {
    padding: 20,
    borderBottomWidth: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 15,
  },
  formButtons: {
    flexDirection: "row",
    gap: 10,
  },
  submitButton: {
    flex: 1,
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
  },
  loginPromptText: {
    fontSize: 16,
    marginBottom: 15,
  },
  loginButton: {
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
    marginBottom: 15,
  },
  emptyState: {
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
  },
  reviewCard: {
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
  },
  profilePhotoPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewerInfo: {
    flex: 1,
  },
  businessReviewerContainer: {
    gap: 6,
  },
  reviewerNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 6,
  },
  storeIcon: {
    marginRight: 0,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  businessName: {
    color: "#4CAF50",
    fontWeight: "700",
  },
  businessBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  businessBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  editedLabel: {
    fontSize: 12,
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
  },
  bottomSpacing: {
    height: 30,
  },
  // Estilos do botão Mais Detalhes
  moreDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 15,
  },
  moreDetailsButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Estilos da seção de detalhes expansível
  detailsSection: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailRowColumn: {
    gap: 8,
  },
  detailRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 70,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  detailDescription: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 28,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
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
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
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
    borderWidth: 1,
  },
  modalButtonDelete: {
    backgroundColor: "#E63946",
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonTextDelete: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});