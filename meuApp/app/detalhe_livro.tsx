import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function BookDetailsScreen() {
  const router = useRouter();
  const { title, author, coverUrl, genre, synopsis } = useLocalSearchParams<{
    title?: string;
    author?: string;
    coverUrl?: string;
    genre?: string;
    synopsis?: string;
  }>();

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

      <ScrollView contentContainerStyle={styles.content}>
        {coverUrl ? (
          <Image source={{ uri: String(coverUrl) }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]} />
        )}

        <Text style={styles.title}>{title || "Livro"}</Text>
        <Text style={styles.author}>{author || "Autor desconhecido"}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{genre || "Gênero"}</Text>
        </View>

        <Text style={styles.sectionTitle}>Sinopse</Text>
        <Text style={styles.synopsis}>{synopsis || "Sem sinopse disponível."}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#2E7D32" },

  content: { padding: 20, alignItems: "center" },
  cover: { width: 180, height: 260, borderRadius: 12, marginBottom: 16 },
  coverPlaceholder: { backgroundColor: "#E8F5E9" },

  title: { fontSize: 22, fontWeight: "bold", color: "#333", textAlign: "center" },
  author: { fontSize: 14, color: "#666", marginTop: 4, marginBottom: 12 },

  badge: {
    backgroundColor: "#C8E6C9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: { color: "#2E7D32", fontWeight: "600" },

  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", alignSelf: "flex-start", marginBottom: 8 },
  synopsis: { fontSize: 14, color: "#444", lineHeight: 20, textAlign: "justify" },
});