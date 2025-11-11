// app/perfil-usuario.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { useReviews } from "../contexts/ReviewsContext";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  bio?: string;
  genres?: string[];
  profilePhotoUrl?: string;
  age?: string;
  createdAt: string;
}

export default function PerfilUsuarioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getReviewsByUser } = useReviews();
  
  const userId = params.userId as string;
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<any[]>([]);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do usuário no Firestore
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setUserProfile(userData);
        
        // Buscar reviews do usuário
        const reviews = getReviewsByUser(userId);
        setUserReviews(reviews);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
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
            size={16}
            color="#FFB800"
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#999" />
        <Text style={styles.errorText}>Perfil não encontrado</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Foto e Informações do Usuário */}
        <View style={styles.profileSection}>
          {userProfile.profilePhotoUrl ? (
            <Image
              source={{ uri: `${userProfile.profilePhotoUrl}?t=${Date.now()}` }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.profilePhotoPlaceholder}>
              <Ionicons name="person" size={50} color="#999" />
            </View>
          )}
          
          <Text style={styles.userName}>{userProfile.name}</Text>
          
          {userProfile.age && (
            <Text style={styles.userAge}>{userProfile.age} anos</Text>
          )}
          
          {userProfile.bio && (
            <Text style={styles.userBio}>{userProfile.bio}</Text>
          )}
          
          {userProfile.genres && userProfile.genres.length > 0 && (
            <View style={styles.genresSection}>
              <Text style={styles.genresTitle}>Gêneros Favoritos:</Text>
              <View style={styles.genresContainer}>
                {userProfile.genres.map((genre, index) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Estatísticas */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="chatbubbles" size={24} color="#2E7D32" />
            <Text style={styles.statNumber}>{userReviews.length}</Text>
            <Text style={styles.statLabel}>
              {userReviews.length === 1 ? "Avaliação" : "Avaliações"}
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#2E7D32" />
            <Text style={styles.statNumber}>
              {new Date(userProfile.createdAt).getFullYear()}
            </Text>
            <Text style={styles.statLabel}>Membro desde</Text>
          </View>
        </View>

        {/* Reviews do Usuário */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>
            Avaliações de {userProfile.name.split(" ")[0]}
          </Text>
          
          {userReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={50} color="#CCC" />
              <Text style={styles.emptyText}>
                Nenhuma avaliação ainda
              </Text>
            </View>
          ) : (
            userReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {review.bookTitle}
                    </Text>
                    {renderStars(review.rating)}
                  </View>
                  <Text style={styles.reviewDate}>
                    {review.createdAt.toLocaleDateString("pt-BR")}
                  </Text>
                </View>
                
                <Text style={styles.reviewComment} numberOfLines={3}>
                  {review.comment}
                </Text>
                
                {review.likes > 0 && (
                  <View style={styles.likesContainer}>
                    <Ionicons name="heart" size={16} color="#E63946" />
                    <Text style={styles.likesText}>
                      {review.likes} {review.likes === 1 ? "curtida" : "curtidas"}
                    </Text>
                  </View>
                )}
              </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  profileSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8F9FA",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#2E7D32",
    marginBottom: 16,
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#2E7D32",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userAge: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  userBio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  genresSection: {
    marginTop: 16,
    width: "100%",
  },
  genresTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  genreTag: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  genreText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "500",
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
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
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 4,
    maxWidth: 200,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  reviewComment: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 8,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  likesText: {
    fontSize: 12,
    color: "#666",
  },
});
