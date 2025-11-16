import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useEventos } from "../contexts/EventosContext";
import BottomNavBar from "../components/BottomNavBar";

const { width, height } = Dimensions.get("window");

export default function LivrariasMapaScreen() {
  const router = useRouter();
  const { eventos, loading, toggleSelecionado } = useEventos();
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  // Filtrar eventos por categoria
  const eventosFiltrados = selectedCategoria
    ? eventos.filter((e) => e.categoria === selectedCategoria)
    : eventos;

  // Região inicial do mapa (São Paulo como padrão)
  const initialRegion = {
    latitude: eventosFiltrados.length > 0 ? eventosFiltrados[0].latitude : -23.5505,
    longitude: eventosFiltrados.length > 0 ? eventosFiltrados[0].longitude : -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Estilo do mapa (dark theme)
  const mapStyle = [
    {
      elementType: "geometry",
      stylers: [{ color: "#1d2c4d" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#8ec3b9" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1a3646" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0e1626" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#2c3e50" }],
    },
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleToggleSelecionado = async (eventoId: string) => {
    const result = await toggleSelecionado(eventoId);
    if (!result.success) {
      Alert.alert("Erro", result.error || "Não foi possível atualizar o evento");
    }
  };

  const handleMarkerPress = async (eventoId: string) => {
    await handleToggleSelecionado(eventoId);
    
    // Encontrar o evento e centralizar no mapa
    const evento = eventosFiltrados.find(e => e.id === eventoId);
    if (evento && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: evento.latitude,
        longitude: evento.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  const handleRefresh = () => {
    // Centralizar no primeiro evento
    if (eventosFiltrados.length > 0 && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: eventosFiltrados[0].latitude,
        longitude: eventosFiltrados[0].longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    }
  };

  const categorias = [
    { id: "show", label: "Shows", icon: "musical-notes" },
    { id: "lancamento", label: "Lançamentos", icon: "book" },
    { id: "encontro", label: "Encontros", icon: "people" },
    { id: "feira", label: "Feiras", icon: "storefront" },
    { id: "outro", label: "Outros", icon: "ellipsis-horizontal" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa de Eventos</Text>
        <TouchableOpacity onPress={() => router.push("/criar-evento" as any)}>
          <Ionicons name="add-circle" size={28} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Visualize os pontos onde eventos literários estão acontecendo.
        </Text>

        {/* Botões de Categoria */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[styles.categoryButton, !selectedCategoria && styles.categoryButtonActive]}
            onPress={() => setSelectedCategoria(null)}
          >
            <Ionicons
              name="apps"
              size={18}
              color={!selectedCategoria ? "#fff" : "#2E7D32"}
            />
            <Text
              style={[
                styles.categoryButtonText,
                !selectedCategoria && styles.categoryButtonTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategoria === cat.id && styles.categoryButtonActive,
              ]}
              onPress={() =>
                setSelectedCategoria(selectedCategoria === cat.id ? null : cat.id)
              }
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={selectedCategoria === cat.id ? "#fff" : "#2E7D32"}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategoria === cat.id && styles.categoryButtonTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Botão Criar Evento */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/criar-evento" as any)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Criar Evento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => Alert.alert("Filtros", "Funcionalidade em desenvolvimento")}
          >
            <Ionicons name="funnel-outline" size={20} color="#2E7D32" />
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* Botão Atualizar */}
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={16} color="#666" />
          <Text style={styles.refreshButtonText}>Atualizar</Text>
        </TouchableOpacity>

        {/* Mapa Nativo */}
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Carregando eventos...</Text>
            </View>
          ) : eventosFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="map-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum evento encontrado</Text>
              <Text style={styles.emptySubtext}>
                Seja o primeiro a criar um evento!
              </Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={initialRegion}
              customMapStyle={mapStyle}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {eventosFiltrados.map((evento, index) => (
                <Marker
                  key={evento.id}
                  coordinate={{
                    latitude: evento.latitude,
                    longitude: evento.longitude,
                  }}
                  title={evento.titulo}
                  description={`${evento.local} • ${evento.cidade}`}
                  onPress={() => handleMarkerPress(evento.id)}
                  pinColor={evento.selecionado ? "#4CAF50" : "#2196F3"}
                >
                  <View style={[
                    styles.markerContainer,
                    evento.selecionado && styles.markerContainerSelected
                  ]}>
                    <Text style={styles.markerText}>{index + 1}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>

        {/* Lista de Eventos */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Eventos</Text>
          <Text style={styles.sectionSubtitle}>
            Toque em um cartão para destacar no mapa.
          </Text>

          {eventosFiltrados.map((evento, index) => (
            <TouchableOpacity
              key={evento.id}
              style={[
                styles.eventCard,
                evento.selecionado && styles.eventCardSelected,
              ]}
              onPress={() => handleToggleSelecionado(evento.id)}
            >
              <View style={styles.eventNumber}>
                <Text style={styles.eventNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.eventInfo}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventCategory}>{evento.categoria.toUpperCase()}</Text>
                  <Text style={styles.eventAuthor}>por {evento.userName}</Text>
                </View>

                <Text style={styles.eventTitle}>{evento.titulo}</Text>

                <View style={styles.eventLocation}>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.eventLocationText}>
                    {evento.local} • {evento.cidade}
                  </Text>
                </View>

                <View style={styles.eventDate}>
                  <Ionicons name="calendar" size={14} color="#666" />
                  <Text style={styles.eventDateText}>
                    {formatDate(evento.dataInicio)}
                    {evento.dataFim && ` → ${formatDate(evento.dataFim)}`}
                  </Text>
                </View>

                {evento.descricao && (
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {evento.descricao}
                  </Text>
                )}

                <View style={styles.eventFooter}>
                  <Text style={styles.eventCoords}>
                    {evento.latitude.toFixed(5)}, {evento.longitude.toFixed(5)}
                  </Text>

                  {evento.selecionado && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.selectedBadgeText}>Selecionado</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNavBar />
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
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2E7D32",
    marginRight: 8,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: "#2E7D32",
  },
  categoryButtonText: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  createButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  filterButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  filterButtonText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "600",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  refreshButtonText: {
    fontSize: 13,
    color: "#666",
  },
  mapContainer: {
    height: height * 0.4,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerContainerSelected: {
    backgroundColor: "#4CAF50",
    transform: [{ scale: 1.2 }],
  },
  markerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#999",
  },
  eventsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  eventCardSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  eventNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  eventNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  eventInfo: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventAuthor: {
    fontSize: 11,
    color: "#999",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  eventLocationText: {
    fontSize: 13,
    color: "#666",
  },
  eventDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  eventDateText: {
    fontSize: 12,
    color: "#666",
  },
  eventDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventCoords: {
    fontSize: 11,
    color: "#999",
    fontFamily: "monospace",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  selectedBadgeText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
