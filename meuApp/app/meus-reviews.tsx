// app/meus-reviews.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useReviews, Review } from "../contexts/ReviewsContext";
import { GlobalStyles, Colors } from '../styles/theme';

export default function MeusReviewsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getReviewsByUser } = useReviews();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserReviews();
    }
  }, [user]);

  const loadUserReviews = async () => {
    try {
      setLoading(true);
      
      // Buscar reviews do contexto
      const userReviews = getReviewsByUser(user!.uid);
      setReviews(userReviews);
    } catch (error) {
      console.error("Erro ao carregar reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={18}
            color="#FFB800"
          />
        ))}
      </View>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando suas avaliações...</Text>
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
        <Text style={styles.headerTitle}>Minhas Avaliações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Estatísticas */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="chatbubbles" size={32} color="#2E7D32" />
            <Text style={styles.statNumber}>{reviews.length}</Text>
            <Text style={styles.statLabel}>
              {reviews.length === 1 ? "Avaliação" : "Avaliações"}
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="star" size={32} color="#FFB800" />
            <Text style={styles.statNumber}>{calculateAverageRating()}</Text>
            <Text style={styles.statLabel}>Média</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="heart" size={32} color="#E63946" />
            <Text style={styles.statNumber}>
              {reviews.reduce((acc, r) => acc + r.likes, 0)}
            </Text>
            <Text style={styles.statLabel}>
              {reviews.reduce((acc, r) => acc + r.likes, 0) === 1 ? "Curtida" : "Curtidas"}
            </Text>
          </View>
        </View>

        {/* Lista de Reviews */}
        <View style={styles.reviewsSection}>
          {reviews.length === 0 ? (
            <View style={[GlobalStyles.emptyState, styles.emptyState]}>
              <Ionicons name="chatbubbles-outline" size={80} color="#CCC" />
              <Text style={styles.emptyTitle}>Nenhuma avaliação ainda</Text>
              <Text style={styles.emptyText}>
                Comece a avaliar livros e suas opiniões aparecerão aqui!
              </Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push("/search")}
              >
                <Ionicons name="search" size={20} color="#fff" />
                <Text style={styles.exploreButtonText}>Explorar Livros</Text>
              </TouchableOpacity>
            </View>
          ) : (
            reviews.map((review) => (
              <TouchableOpacity
                key={review.id}
                style={styles.reviewCard}
                onPress={() => {
                  router.push({
                    pathname: "/book-details",
                    params: {
                      id: review.bookId,
                      title: review.bookTitle,
                      author: review.bookAuthor,
                      image: review.bookImage,
                    },
                  });
                }}
              >
                {/* Capa do Livro */}
                <Image
                  source={{ uri: review.bookImage }}
                  style={styles.bookCover}
                />
                
                {/* Informações da Review */}
                <View style={styles.reviewInfo}>
                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {review.bookTitle}
                  </Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>
                    {review.bookAuthor}
                  </Text>
                  
                  <View style={styles.ratingRow}>
                    {renderStars(review.rating)}
                    <Text style={styles.ratingText}>({review.rating})</Text>
                  </View>
                  
                  <Text style={styles.reviewComment} numberOfLines={3}>
                    {review.comment}
                  </Text>
                  
                  <View style={styles.reviewFooter}>
                    <Text style={styles.reviewDate}>
                      {review.createdAt.toLocaleDateString("pt-BR")}
                    </Text>
                    
                    {review.likes > 0 && (
                      <View style={styles.likesContainer}>
                        <Ionicons name="heart" size={16} color="#E63946" />
                        <Text style={styles.likesText}>
                          {review.likes}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
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
  statsSection: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  reviewsSection: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    padding: 16,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
  },
  reviewInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  reviewComment: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likesText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
});
