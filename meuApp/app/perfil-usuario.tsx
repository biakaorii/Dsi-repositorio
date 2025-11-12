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
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { useReviews } from "../contexts/ReviewsContext";
import { useComunidades } from "../contexts/ComunidadesContext";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  profileType?: 'leitor' | 'empreendedor' | 'critico';
  bio?: string;
  genres?: string[];
  profilePhotoUrl?: string;
  age?: string;
  createdAt: string;
  // Campos do negócio (empreendedores)
  businessName?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  businessDescription?: string;
  mission?: string;
  foundedYear?: string;
  businessType?: 'fisica' | 'online' | 'hibrida';
  workingHours?: string;
  phoneWhatsApp?: string;
  website?: string;
  instagram?: string;
  services?: string[];
}

export default function PerfilUsuarioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getReviewsByUser } = useReviews();
  const { getComunidadesByUser } = useComunidades();
  
  const userId = params.userId as string;
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userComunidades, setUserComunidades] = useState<any[]>([]);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);

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
        
        // Buscar comunidades do usuário
        const comunidades = getComunidadesByUser(userId);
        setUserComunidades(comunidades);
        
        // Buscar favoritos do usuário
        const favoritesRef = collection(db, "favorites");
        const q = query(favoritesRef, where("userId", "==", userId));
        const favoritesSnapshot = await getDocs(q);
        
        const favoritesData: any[] = [];
        favoritesSnapshot.forEach((doc) => {
          const data = doc.data();
          favoritesData.push({
            id: doc.id,
            bookId: data.bookId,
            bookTitle: data.bookTitle,
            bookAuthor: data.bookAuthor,
            bookImage: data.bookImage,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        setUserFavorites(favoritesData);
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

        {/* Informações do Negócio - Apenas para Empreendedores */}
        {userProfile.profileType === 'empreendedor' && userProfile.businessName && (
          <>
            {/* Sobre o Negócio */}
            <View style={styles.businessSection}>
              <View style={styles.businessHeader}>
                <Ionicons name="storefront" size={24} color="#4CAF50" />
                <Text style={styles.businessHeaderTitle}>Livraria</Text>
              </View>
              
              <View style={styles.businessInfoCard}>
                <Text style={styles.businessName}>{userProfile.businessName}</Text>
                
                {userProfile.businessDescription && (
                  <Text style={styles.businessDescription}>
                    {userProfile.businessDescription}
                  </Text>
                )}

                {userProfile.mission && (
                  <View style={styles.missionContainer}>
                    <Ionicons name="flag" size={18} color="#4CAF50" />
                    <Text style={styles.missionText}>{userProfile.mission}</Text>
                  </View>
                )}

                <View style={styles.businessDetailsRow}>
                  {userProfile.foundedYear && (
                    <View style={styles.businessDetailItem}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.businessDetailText}>Desde {userProfile.foundedYear}</Text>
                    </View>
                  )}
                  
                  {userProfile.businessType && (
                    <View style={styles.businessDetailItem}>
                      <Ionicons 
                        name={userProfile.businessType === 'fisica' ? 'storefront-outline' : 
                              userProfile.businessType === 'online' ? 'globe-outline' : 'layers-outline'} 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.businessDetailText}>
                        {userProfile.businessType === 'fisica' ? 'Física' : 
                         userProfile.businessType === 'online' ? 'Online' : 'Híbrida'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Localização */}
                {userProfile.address && (
                  <View style={styles.locationContainer}>
                    <Ionicons name="location" size={20} color="#4CAF50" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationText}>
                        {userProfile.address}
                        {userProfile.city && userProfile.state && `, ${userProfile.city}/${userProfile.state}`}
                      </Text>
                      {userProfile.workingHours && (
                        <View style={styles.hoursContainer}>
                          <Ionicons name="time-outline" size={14} color="#666" />
                          <Text style={styles.hoursText}>{userProfile.workingHours}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Contatos */}
                {(userProfile.phoneWhatsApp || userProfile.website || userProfile.instagram) && (
                  <View style={styles.contactsContainer}>
                    {userProfile.phoneWhatsApp && (
                      <TouchableOpacity style={styles.contactButton}>
                        <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                        <Text style={styles.contactButtonText}>WhatsApp</Text>
                      </TouchableOpacity>
                    )}
                    
                    {userProfile.website && (
                      <TouchableOpacity style={styles.contactButton}>
                        <Ionicons name="globe-outline" size={20} color="#4CAF50" />
                        <Text style={styles.contactButtonText}>Site</Text>
                      </TouchableOpacity>
                    )}
                    
                    {userProfile.instagram && (
                      <TouchableOpacity style={styles.contactButton}>
                        <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                        <Text style={styles.contactButtonText}>Instagram</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Serviços */}
                {userProfile.services && userProfile.services.length > 0 && (
                  <View style={styles.servicesBox}>
                    <Text style={styles.servicesTitle}>⭐ Diferenciais e Serviços</Text>
                    {userProfile.services.map((service, index) => (
                      <View key={index} style={styles.serviceRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                        <Text style={styles.serviceRowText}>{service}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </>
        )}

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
            <Ionicons name="heart" size={24} color="#E63946" />
            <Text style={styles.statNumber}>{userFavorites.length}</Text>
            <Text style={styles.statLabel}>
              {userFavorites.length === 1 ? "Favorito" : "Favoritos"}
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#2E7D32" />
            <Text style={styles.statNumber}>{userComunidades.length}</Text>
            <Text style={styles.statLabel}>
              {userComunidades.length === 1 ? "Comunidade" : "Comunidades"}
            </Text>
          </View>
        </View>

        {/* Livros Favoritos do Usuário */}
        {userFavorites.length > 0 && (
          <View style={styles.favoritesSection}>
            <Text style={styles.sectionTitle}>Livros Favoritos</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoritesScrollContainer}
            >
              {userFavorites.map((favorite) => (
                <TouchableOpacity
                  key={favorite.id}
                  style={styles.favoriteBookCard}
                  onPress={() => {
                    router.push({
                      pathname: "/book-details",
                      params: {
                        id: favorite.bookId,
                        title: favorite.bookTitle,
                        author: favorite.bookAuthor,
                        image: favorite.bookImage,
                      },
                    });
                  }}
                >
                  <Image
                    source={{ uri: favorite.bookImage }}
                    style={styles.favoriteBookCover}
                  />
                  <Text style={styles.favoriteBookTitle} numberOfLines={2}>
                    {favorite.bookTitle}
                  </Text>
                  <Text style={styles.favoriteBookAuthor} numberOfLines={1}>
                    {favorite.bookAuthor}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Comunidades do Usuário */}
        {userComunidades.length > 0 && (
          <View style={styles.comunidadesSection}>
            <Text style={styles.sectionTitle}>Comunidades</Text>
            <View style={styles.comunidadesContainer}>
              {userComunidades.map((comunidade) => (
                <View key={comunidade.id} style={styles.comunidadeCard}>
                  <Ionicons name="people-circle" size={20} color="#2E7D32" />
                  <View style={styles.comunidadeInfo}>
                    <Text style={styles.comunidadeName} numberOfLines={1}>
                      {comunidade.nome}
                    </Text>
                    <Text style={styles.comunidadeMembers}>
                      {comunidade.membros.length} {comunidade.membros.length === 1 ? "membro" : "membros"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

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
  comunidadesSection: {
    padding: 20,
    paddingTop: 0,
  },
  comunidadesContainer: {
    gap: 12,
  },
  comunidadeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    gap: 12,
  },
  comunidadeInfo: {
    flex: 1,
  },
  comunidadeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  comunidadeMembers: {
    fontSize: 12,
    color: "#666",
  },
  favoritesSection: {
    padding: 20,
    paddingTop: 0,
  },
  favoritesScrollContainer: {
    paddingRight: 20,
  },
  favoriteBookCard: {
    width: 120,
    marginRight: 12,
  },
  favoriteBookCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  favoriteBookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    lineHeight: 18,
  },
  favoriteBookAuthor: {
    fontSize: 12,
    color: "#666",
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

  // Estilos para informações do negócio
  businessSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8FFF9",
  },
  businessHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  businessHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4CAF50",
  },
  businessInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
    gap: 16,
  },
  businessName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    fontStyle: "italic",
  },
  missionContainer: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F1F8E9",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  missionText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  businessDetailsRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  businessDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  businessDetailText: {
    fontSize: 13,
    color: "#666",
  },
  locationContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F8F9FA",
    padding: 14,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  hoursContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  hoursText: {
    fontSize: 12,
    color: "#666",
  },
  contactsContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8F9FA",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  servicesBox: {
    backgroundColor: "#F1F8E9",
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 4,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  serviceRowText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
});
