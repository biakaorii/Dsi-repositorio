import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useLivros } from "../contexts/LivrosContext";

export default function BookPreviewLocalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { livros } = useLivros();

  // Extrair ID do livro e buscar dados completos
  const bookId = params.id as string || "1";
  const livro = livros.find(l => l.id === bookId);

  if (!livro) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Carregando livro...</Text>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Capa do Livro */}
        <View style={styles.coverSection}>
          {livro.capaUri ? (
            <Image 
              source={{ uri: livro.capaUri }} 
              style={styles.bookCover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noCover}>
              <Ionicons name="book" size={80} color="#ccc" />
            </View>
          )}
        </View>

        {/* Informações Básicas */}
        <View style={styles.infoSection}>
          {/* Título */}
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Título</Text>
            <Text style={styles.value}>{livro.titulo}</Text>
          </View>

          {/* Autor */}
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Autor</Text>
            <Text style={styles.value}>{livro.autor}</Text>
          </View>

          {/* Gênero */}
          {livro.genero && (
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Gênero</Text>
              <Text style={styles.value}>{livro.genero}</Text>
            </View>
          )}

          {/* Número de Páginas */}
          {livro.paginas && (
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Número de Páginas</Text>
              <Text style={styles.value}>{livro.paginas}</Text>
            </View>
          )}

          {/* Descrição */}
          {livro.descricao && (
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Descrição</Text>
              <Text style={styles.descriptionValue}>{livro.descricao}</Text>
            </View>
          )}
        </View>

        {/* Botão para Ver Detalhes Completos */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => 
              router.push({
                pathname: '/book-details-local' as any,
                params: {
                  id: livro.id,
                  title: livro.titulo,
                  author: livro.autor,
                  image: livro.capaUri,
                }
              })
            }
          >
            <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
            <Text style={styles.detailsButtonText}>Ver Avaliações</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
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
    marginTop: 16,
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
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  coverSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#F8F9FA",
  },
  bookCover: {
    width: 180,
    height: 260,
    borderRadius: 12,
    backgroundColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  noCover: {
    width: 180,
    height: 260,
    borderRadius: 12,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoBlock: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    lineHeight: 26,
  },
  descriptionValue: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    marginTop: 4,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 40,
  },
});
