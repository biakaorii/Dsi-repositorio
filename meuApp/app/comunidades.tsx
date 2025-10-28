import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BottomNavBar from "../components/BottomNavBar";
import { useComunidades, Comunidade } from "../contexts/ComunidadesContext";

export default function ComunidadesScreen() {
  const { comunidades, loading } = useComunidades();
  const [comunidadesFiltradas, setComunidadesFiltradas] = useState(comunidades);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Atualizar lista filtrada quando comunidades mudarem
  useEffect(() => {
    setComunidadesFiltradas(comunidades);
  }, [comunidades]);

  // Filtrar comunidades pela busca
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setComunidadesFiltradas(comunidades);
    } else {
      const filtradas = comunidades.filter(
        (comunidade) =>
          comunidade.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comunidade.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setComunidadesFiltradas(filtradas);
    }
  }, [searchQuery, comunidades]);

  const renderComunidade = ({ item }: { item: Comunidade }) => (
    <TouchableOpacity style={styles.comunidadeCard}>
      <View style={styles.comunidadeContent}>
        <Text style={styles.comunidadeNome}>{item.nome}</Text>
        <Text style={styles.comunidadeDono}>De: {item.ownerName}</Text>
        <Text style={styles.comunidadeDescricao} numberOfLines={1}>
          {item.descricao}
        </Text>
        <View style={styles.comunidadeFooter}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.membrosCount}>
            {item.membros?.length || 1} {item.membros?.length === 1 ? "membro" : "membros"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comunidades</Text>
      </View>

      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar comunidades..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de comunidades */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Carregando comunidades...</Text>
        </View>
      ) : comunidadesFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? "Nenhuma comunidade encontrada" : "Ainda não há comunidades"}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? "Tente buscar por outro nome" : "Seja o primeiro a criar uma!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={comunidadesFiltradas}
          renderItem={renderComunidade}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Barra de navegação inferior */}
      <BottomNavBar />

      {/* Botão flutuante + */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/criar-comunidade")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  comunidadeCard: {
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    marginBottom: 15,
    padding: 16,
  },
  comunidadeContent: {
    flex: 1,
  },
  comunidadeNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  comunidadeDono: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  comunidadeDescricao: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  comunidadeFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  membrosCount: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
