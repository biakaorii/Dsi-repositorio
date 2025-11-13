// app/favoritos.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFavorites } from "../contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";

export default function FavoritosScreen() {
  const router = useRouter();
  const { favorites, loading, removeFavorite } = useFavorites();
  const { user } = useAuth();

  // Redirecionar empreendedores para a tela de perfil
  useEffect(() => {
    if (user?.profileType === 'empreendedor') {
      router.replace('/usuario');
    }
  }, [user]);

  // Se for empreendedor, não renderiza nada (vai redirecionar)
  if (user?.profileType === 'empreendedor') {
    return null;
  }

  const handleRemoveFavorite = async (bookId: string) => {
    await removeFavorite(bookId);
  };

  const handleBookPress = (favorite: any) => {
    router.push({
      pathname: "/book-details",
      params: {
        id: favorite.bookId,
        title: favorite.bookTitle,
        author: favorite.bookAuthor,
        image: favorite.bookImage,
      },
    });
  };

  if (loading) {
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
        <Text style={styles.headerTitle}>Meus Favoritos</Text>
        <View style={{ width: 24 }} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
          <Text style={styles.emptyText}>
            Adicione livros aos seus favoritos para vê-los aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.favoriteCard}
              onPress={() => handleBookPress(item)}
            >
              <Image
                source={{ uri: item.bookImage }}
                style={styles.bookCover}
              />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {item.bookTitle}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {item.bookAuthor}
                </Text>
                <Text style={styles.addedDate}>
                  Adicionado em {item.createdAt.toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(item.bookId)}
              >
                <Ionicons name="heart" size={24} color="#E63946" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  listContainer: {
    padding: 20,
  },
  favoriteCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    alignItems: "center",
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  addedDate: {
    fontSize: 12,
    color: "#999",
  },
  removeButton: {
    padding: 8,
  },
});
