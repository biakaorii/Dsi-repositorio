// app/usuario.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import BottomNavBar from "../components/BottomNavBar";

export default function PerfilScreen() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Enquanto carrega
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      </View>
    );
  }

  // Se não houver usuário autenticado
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          Nenhum usuário logado
        </Text>
      </View>
    );
  }

  // Dados do usuário
  const name = user.name || "Usuário";
  // ✅ Prioriza readingGoal, depois bio, depois fallback
  const bio = user.readingGoal || user.bio || "Leitor ávido";
  // Adiciona timestamp para forçar reload da imagem
  const profileImageUrl = user.profilePhotoUrl 
    ? `${user.profilePhotoUrl}?t=${Date.now()}` 
    : "https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small/user-icon-on-transparent-background-free-png.png";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <Ionicons name="settings-outline" size={24} color="#2E7D32" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Foto e Nome */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: profileImageUrl,
            }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileSubtitle}>{bio}</Text>

          {/* Botão Acompanhar Progresso */}
          <TouchableOpacity
            style={styles.progressButton}
            onPress={() => router.push("/progresso")}
          >
            <Ionicons name="trending-up-outline" size={18} color="#fff" />
            <Text style={styles.progressButtonText}>Acompanhar Progresso</Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Lidos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Lendo</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>20</Text>
            <Text style={styles.statLabel}>Salvos</Text>
          </View>
        </View>

        {/* Preferências: Gêneros Favoritos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gêneros Favoritos</Text>
          <View style={styles.tagsContainer}>
            {user.genres && Array.isArray(user.genres) ? (
              user.genres
                .filter(genre => typeof genre === 'string' && genre.trim() !== '')
                .map((genre) => (
                  <View key={genre} style={styles.tag}>
                    <Text style={styles.tagText}>{genre}</Text>
                  </View>
                ))
            ) : (
              <Text style={{ color: "#666", fontStyle: "italic" }}>
                Nenhum gênero selecionado
              </Text>
            )}
          </View>
        </View>

        {/* Ações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opções</Text>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => router.push("/editarPerfil")}
          >
            <Ionicons name="create-outline" size={20} color="#333" />
            <Text style={styles.optionText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton}>
            <Ionicons name="book-outline" size={20} color="#333" />
            <Text style={styles.optionText}>Meus Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#E63946" />
            <Text style={[styles.optionText, { color: "#E63946" }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de navegação inferior */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },

  profileSection: { alignItems: "center", marginVertical: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  profileName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  profileSubtitle: { fontSize: 14, color: "#666", marginBottom: 15 },

  progressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
  },
  progressButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "#E8F5E9",
    marginHorizontal: 20,
    borderRadius: 12,
  },
  statBox: { alignItems: "center" },
  statNumber: { fontSize: 16, fontWeight: "bold", color: "#333" },
  statLabel: { fontSize: 13, color: "#666" },

  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 10 },

  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    backgroundColor: "#C8E6C9",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tagText: { fontSize: 13, color: "#2E7D32", fontWeight: "500" },

  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: { marginLeft: 10, fontSize: 15, color: "#333" },
});
