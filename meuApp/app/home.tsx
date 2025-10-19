import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Link } from "expo-router";
import BottomNavBar from "../components/BottomNavBar";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Início</Text>
        <Ionicons name="notifications-outline" size={24} color="#2E7D32" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Descubra novos livros 📚</Text>
        </View>

        {/* Sessão: Recomendados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendados para você</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.card}>
              <Image
                source={{ uri: "https://covers.openlibrary.org/b/id/8221256-L.jpg" }}
                style={styles.bookImage}
              />
              <Text style={styles.bookTitle}>O Hobbit</Text>
            </View>
            <View style={styles.card}>
              <Image
                source={{ uri: "https://covers.openlibrary.org/b/id/9281731-L.jpg" }}
                style={styles.bookImage}
              />
              <Text style={styles.bookTitle}>1984</Text>
            </View>
            <View style={styles.card}>
              <Image
                source={{ uri: "https://covers.openlibrary.org/b/id/10521215-L.jpg" }}
                style={styles.bookImage}
              />
              <Text style={styles.bookTitle}>Harry Potter e a Pedra Filosofal</Text>
            </View>
          </ScrollView>
        </View>

        {/* Sessão: Continuar Lendo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continuar lendo</Text>
          <View style={styles.readingCard}>
            <Image
              source={{ uri: "https://covers.openlibrary.org/b/id/10521656-L.jpg" }}
              style={styles.readingImage}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.readingTitle}>Harry Potter</Text>
              <Text style={styles.readingProgress}>Capítulo 8 de 20</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
          </View>
        </View>

        {/* Sessão: Gêneros Populares */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gêneros Populares</Text>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}><Text style={styles.tagText}>Fantasia</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Romance</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Suspense</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Ciência</Text></View>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },

  banner: {
    backgroundColor: "#E8F5E9",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  bannerText: { fontSize: 16, fontWeight: "600", color: "#2E7D32" },

  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#333" },

  card: {
    backgroundColor: "#F1F8E9",
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
    width: 120,
    alignItems: "center",
  },
  bookImage: { width: 80, height: 110, borderRadius: 8, marginBottom: 8 },
  bookTitle: { fontSize: 13, fontWeight: "500", textAlign: "center", color: "#2E7D32" },

  readingCard: {
    flexDirection: "row",
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  readingImage: { width: 50, height: 70, borderRadius: 8 },
  readingTitle: { fontSize: 14, fontWeight: "bold", color: "#333" },
  readingProgress: { fontSize: 12, color: "#2E7D32" },

  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    backgroundColor: "#C8E6C9",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: { fontSize: 13, color: "#2E7D32", fontWeight: "500" },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#E8F5E9",
  },
});