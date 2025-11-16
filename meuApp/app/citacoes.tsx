import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BottomNavBar from "../components/BottomNavBar";
import { useCitacoes, Citacao } from "../contexts/CitacoesContext";
import { useAuth } from "../contexts/AuthContext";
import Toast from "react-native-toast-message";

export default function CitacoesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { citacoes, loading, deleteCitacao, getCitacoesByUser } = useCitacoes();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtrar citações do usuário logado
  const minhasCitacoes = user ? getCitacoesByUser(user.uid) : [];

  const handleDelete = (citacao: Citacao) => {
    Alert.alert(
      "Excluir Citação",
      `Tem certeza que deseja excluir esta citação de "${citacao.livroTitulo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setDeletingId(citacao.id);
            const result = await deleteCitacao(citacao.id);
            setDeletingId(null);

            if (result.success) {
              Toast.show({
                type: "success",
                text1: "Citação excluída",
                text2: "A citação foi removida com sucesso",
                visibilityTime: 2000,
              });
            } else {
              Toast.show({
                type: "error",
                text1: "Erro",
                text2: result.error || "Não foi possível excluir a citação",
                visibilityTime: 3000,
              });
            }
          },
        },
      ]
    );
  };

  const handleEdit = (citacao: Citacao) => {
    router.push({
      pathname: "/editar-citacao",
      params: {
        id: citacao.id,
        texto: citacao.texto,
        pagina: citacao.pagina.toString(),
        contexto: citacao.contexto || "",
        livroTitulo: citacao.livroTitulo,
        livroAutor: citacao.livroAutor,
      },
    });
  };

  const renderCitacao = ({ item }: { item: Citacao }) => (
    <View style={styles.citacaoCard}>
      {/* Cabeçalho com informações do livro */}
      <View style={styles.livroInfo}>
        {item.livroImagem ? (
          <Image source={{ uri: item.livroImagem }} style={styles.livroImagem} />
        ) : (
          <View style={styles.livroImagemPlaceholder}>
            <Ionicons name="book" size={20} color="#2E7D32" />
          </View>
        )}
        <View style={styles.livroTexto}>
          <Text style={styles.livroTitulo} numberOfLines={1}>
            {item.livroTitulo}
          </Text>
          <Text style={styles.livroAutor} numberOfLines={1}>
            {item.livroAutor}
          </Text>
          <Text style={styles.paginaText}>Página {item.pagina}</Text>
        </View>
      </View>

      {/* Citação */}
      <View style={styles.citacaoContent}>
        <Ionicons name="chatbox-ellipses" size={24} color="#2E7D32" style={styles.quoteIcon} />
        <Text style={styles.citacaoTexto}>{item.texto}</Text>
      </View>

      {/* Contexto (opcional) */}
      {item.contexto && (
        <View style={styles.contextoContainer}>
          <Text style={styles.contextoLabel}>Contexto:</Text>
          <Text style={styles.contextoTexto}>{item.contexto}</Text>
        </View>
      )}

      {/* Rodapé com data e ações */}
      <View style={styles.footer}>
        <Text style={styles.dataText}>
          {item.createdAt.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={18} color="#2E7D32" />
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
            disabled={deletingId === item.id}
          >
            {deletingId === item.id ? (
              <ActivityIndicator size="small" color="#F44336" />
            ) : (
              <>
                <Ionicons name="trash" size={18} color="#F44336" />
                <Text style={[styles.actionText, styles.deleteText]}>Excluir</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minhas Citações</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="log-in-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Faça login para ver suas citações</Text>
        </View>
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
        <Text style={styles.headerTitle}>Minhas Citações</Text>
        <TouchableOpacity onPress={() => router.push("/adicionar-citacao" as any)}>
          <Ionicons name="add-circle" size={28} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {/* Lista de Citações */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Carregando citações...</Text>
        </View>
      ) : minhasCitacoes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbox-ellipses-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma citação salva</Text>
          <Text style={styles.emptySubtext}>
            Adicione frases marcantes dos seus livros favoritos
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/adicionar-citacao" as any)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Adicionar Citação</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={minhasCitacoes}
          renderItem={renderCitacao}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNavBar />

      {/* Botão flutuante para adicionar */}
      {minhasCitacoes.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/adicionar-citacao" as any)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <Toast />
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  citacaoCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
  },
  livroInfo: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  livroImagem: {
    width: 50,
    height: 70,
    borderRadius: 8,
  },
  livroImagemPlaceholder: {
    width: 50,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  livroTexto: {
    flex: 1,
    justifyContent: "center",
  },
  livroTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  livroAutor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  paginaText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
  citacaoContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 12,
  },
  quoteIcon: {
    marginTop: 2,
  },
  citacaoTexto: {
    flex: 1,
    fontSize: 15,
    fontStyle: "italic",
    color: "#333",
    lineHeight: 22,
  },
  contextoContainer: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  contextoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 4,
  },
  contextoTexto: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  dataText: {
    fontSize: 12,
    color: "#999",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
  },
  deleteText: {
    color: "#F44336",
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
