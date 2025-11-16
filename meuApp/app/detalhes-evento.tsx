import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEventos } from "../contexts/EventosContext";
import { useAuth } from "../contexts/AuthContext";

export default function DetalhesEventoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { eventos, deleteEvento, updateEvento } = useEventos();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const eventoId = params.id as string;
  const evento = eventos.find((e) => e.id === eventoId);

  // Se não encontrar o evento, voltar
  useEffect(() => {
    if (!evento && !loading) {
      Alert.alert("Erro", "Evento não encontrado");
      router.back();
    }
  }, [evento]);

  if (!evento) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const isOwner = user?.uid === evento.userId;

  const handleEdit = () => {
    router.push({
      pathname: "/editar-evento",
      params: {
        id: evento.id,
        titulo: evento.titulo,
        descricao: evento.descricao || "",
        local: evento.local,
        cidade: evento.cidade,
        estado: evento.estado,
        pais: evento.pais,
        latitude: evento.latitude.toString(),
        longitude: evento.longitude.toString(),
        dataInicio: evento.dataInicio.toISOString(),
        dataFim: evento.dataFim?.toISOString() || "",
        categoria: evento.categoria,
        linkIngressos: evento.linkIngressos || "",
      },
    } as any);
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const result = await deleteEvento(evento.id);
            setLoading(false);

            if (result.success) {
              Alert.alert("Sucesso", "Evento excluído com sucesso!");
              router.back();
            } else {
              Alert.alert("Erro", result.error || "Erro ao excluir evento");
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: { [key: string]: string } = {
      show: "Show",
      lancamento: "Lançamento",
      encontro: "Encontro",
      feira: "Feira",
      outro: "Outro",
    };
    return labels[categoria] || categoria;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Evento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Categoria Badge */}
        <View style={styles.categoryBadge}>
          <Ionicons name="pricetag" size={16} color="#2E7D32" />
          <Text style={styles.categoryText}>{getCategoriaLabel(evento.categoria)}</Text>
        </View>

        {/* Título */}
        <Text style={styles.titulo}>{evento.titulo}</Text>

        {/* Autor */}
        <View style={styles.authorContainer}>
          <Ionicons name="person-circle-outline" size={20} color="#666" />
          <Text style={styles.authorText}>Criado por {evento.userName}</Text>
        </View>

        {/* Informações principais */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#2E7D32" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data de Início</Text>
              <Text style={styles.infoValue}>{formatDate(evento.dataInicio)}</Text>
            </View>
          </View>

          {evento.dataFim && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#2E7D32" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Data de Término</Text>
                <Text style={styles.infoValue}>{formatDate(evento.dataFim)}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#2E7D32" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Localização</Text>
              <Text style={styles.infoValue}>{evento.local}</Text>
              <Text style={styles.infoSubValue}>
                {evento.cidade}, {evento.estado} - {evento.pais}
              </Text>
            </View>
          </View>

          {evento.linkIngressos && (
            <View style={styles.infoRow}>
              <Ionicons name="ticket" size={20} color="#2E7D32" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Link de Ingressos</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {evento.linkIngressos}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Descrição */}
        {evento.descricao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.descricao}>{evento.descricao}</Text>
          </View>
        )}

        {/* Coordenadas (apenas para debug/informação) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coordenadas</Text>
          <Text style={styles.coordinates}>
            Lat: {evento.latitude.toFixed(6)}, Long: {evento.longitude.toFixed(6)}
          </Text>
        </View>

        {/* Botões de ação (apenas para o dono) */}
        {isOwner && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
              disabled={loading}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Editar Evento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Excluir Evento</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  scrollView: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F5E9",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginHorizontal: 20,
    marginTop: 12,
    lineHeight: 32,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  authorText: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "#1a1a1a",
    fontWeight: "600",
  },
  infoSubValue: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  descricao: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },
  coordinates: {
    fontSize: 13,
    color: "#666",
    fontFamily: "monospace",
  },
  actionsContainer: {
    marginHorizontal: 20,
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#D32F2F",
    paddingVertical: 14,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
