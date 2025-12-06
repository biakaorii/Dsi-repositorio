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
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useEventos } from "../contexts/EventosContext";
import BottomNavBar from "../components/BottomNavBar";

const { width, height } = Dimensions.get("window");

export default function EventosMapaScreen() {
  const router = useRouter();
  const { eventos, loading, toggleSelecionado } = useEventos();
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Filtrar eventos futuros (remover eventos passados)
  const eventosFuturos = eventos.filter((evento) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataEvento = new Date(evento.dataInicio);
    dataEvento.setHours(0, 0, 0, 0);
    return dataEvento >= hoje;
  });

  // Filtrar eventos por categoria, texto de pesquisa e seleção
  const eventosFiltrados = eventosFuturos.filter((evento) => {
    // Se NÃO tem filtro de categoria ou busca ativa, mostrar apenas selecionados
    const temFiltroAtivo = selectedCategoria || searchText.trim() !== "";
    
    if (!temFiltroAtivo) {
      // Sem filtros: mostrar apenas eventos selecionados
      if (!evento.selecionado) return false;
    }
    
    // Filtro por categoria
    const passaCategoria = selectedCategoria ? evento.categoria === selectedCategoria : true;
    
    // Filtro por texto de pesquisa
    const passaPesquisa = searchText.trim() === "" ? true : 
      evento.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
      evento.local.toLowerCase().includes(searchText.toLowerCase()) ||
      evento.cidade.toLowerCase().includes(searchText.toLowerCase()) ||
      (evento.descricao && evento.descricao.toLowerCase().includes(searchText.toLowerCase()));
    
    return passaCategoria && passaPesquisa;
  });

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
    { id: "lancamento", label: "Lançamentos", icon: "book", color: "#2E7D32" },
    { id: "encontro", label: "Encontros", icon: "people", color: "#1976D2" },
    { id: "feira", label: "Feiras", icon: "storefront", color: "#F57C00" },
    { id: "outro", label: "Outros", icon: "ellipsis-horizontal", color: "#7B1FA2" },
  ];

  // Função para contar eventos por categoria (apenas eventos futuros)
  const getEventCountByCategory = (categoryId: string) => {
    return eventosFuturos.filter(evento => evento.categoria === categoryId).length;
  };

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

        {/* Barra de Pesquisa */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar eventos..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")} style={styles.clearButton}>
                <Ionicons name="close" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Botão Criar Evento e Filtros */}
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
            onPress={() => setModalVisible(true)}
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

      {/* Modal de Filtros */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Opções de Filtro */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionTitle}>Categorias</Text>
              
              {/* Todos */}
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  !selectedCategoria && styles.filterOptionActive
                ]}
                onPress={() => {
                  setSelectedCategoria(null);
                  setModalVisible(false);
                }}
              >
                <View style={styles.filterOptionLeft}>
                  <Ionicons name="apps" size={24} color="#2E7D32" />
                  <View>
                    <Text style={styles.filterOptionText}>Todos os eventos</Text>
                    <Text style={styles.filterOptionCount}>{eventos.length} eventos</Text>
                  </View>
                </View>
                {!selectedCategoria && (
                  <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                )}
              </TouchableOpacity>

              {/* Categorias */}
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterOption,
                    selectedCategoria === cat.id && styles.filterOptionActive
                  ]}
                  onPress={() => {
                    setSelectedCategoria(cat.id);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.filterOptionLeft}>
                    <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                    <View>
                      <Text style={styles.filterOptionText}>{cat.label}</Text>
                      <Text style={styles.filterOptionCount}>
                        {getEventCountByCategory(cat.id)} eventos
                      </Text>
                    </View>
                  </View>
                  {selectedCategoria === cat.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Botão Limpar Filtros */}
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedCategoria(null);
                setModalVisible(false);
              }}
            >
              <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  // Estilos da barra de pesquisa
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  // Estilos do Modal de Filtros
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
  },
  filterOptionActive: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  filterOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  filterOptionCount: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  clearFiltersButton: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
});
