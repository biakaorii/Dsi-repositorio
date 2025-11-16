import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import BottomNavBar from "../components/BottomNavBar";
import { useComunidades, Comunidade } from "../contexts/ComunidadesContext";
import { useEventos } from "../contexts/EventosContext";
import { useAuth } from "../contexts/AuthContext";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

export default function ComunidadesScreen() {
  const { comunidades, loading, isMember, joinComunidade } = useComunidades();
  const { eventos, loading: eventosLoading, toggleSelecionado, deleteEvento } = useEventos();
  const { user } = useAuth();
  const [minhasComunidades, setMinhasComunidades] = useState<Comunidade[]>([]);
  const [outrasComunidades, setOutrasComunidades] = useState<Comunidade[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComunidade, setSelectedComunidade] = useState<Comunidade | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'comunidades' | 'eventos'>('comunidades');
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  // Separar comunidades em duas listas: minhas e outras
  useEffect(() => {
    if (!user) {
      setMinhasComunidades([]);
      setOutrasComunidades(comunidades);
      return;
    }

    if (searchQuery.trim() === "") {
      // Sem busca: separar em minhas comunidades e outras
      const minhas = comunidades.filter((c) => isMember(c.id, user.uid));
      const outras = comunidades.filter((c) => !isMember(c.id, user.uid));
      setMinhasComunidades(minhas);
      setOutrasComunidades(outras);
    } else {
      // Com busca: filtrar e separar
      const filtradas = comunidades.filter(
        (comunidade) =>
          comunidade.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comunidade.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const minhas = filtradas.filter((c) => isMember(c.id, user.uid));
      const outras = filtradas.filter((c) => !isMember(c.id, user.uid));
      setMinhasComunidades(minhas);
      setOutrasComunidades(outras);
    }
  }, [searchQuery, comunidades, user]);

  const handleComunidadeClick = (comunidade: Comunidade) => {
    if (!user) return;

    // Se já é membro, vai direto pro chat
    if (isMember(comunidade.id, user.uid)) {
      router.push({
        pathname: "/chat-comunidade",
        params: { 
          id: comunidade.id,
          nome: comunidade.nome 
        }
      });
    } else {
      // Se não é membro, abre o dialog de confirmação
      setSelectedComunidade(comunidade);
      setShowDialog(true);
    }
  };

  const handleJoinComunidade = async () => {
    if (!selectedComunidade) return;

    setJoiningLoading(true);
    const result = await joinComunidade(selectedComunidade.id);
    setJoiningLoading(false);

    if (result.success) {
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Você entrou na comunidade!",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
      setShowDialog(false);
      // Redirecionar para o chat
      router.push({
        pathname: "/chat-comunidade",
        params: { 
          id: selectedComunidade.id,
          nome: selectedComunidade.nome 
        }
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: result.error || "Erro ao entrar na comunidade",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  // Funções auxiliares para categorias de eventos
  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      lancamento: "#FF6B6B",
      encontro: "#4ECDC4",
      feira: "#FFD93D",
      outro: "#95A5A6",
    };
    return colors[categoria] || "#2E7D32";
  };

  const getCategoryIcon = (categoria: string) => {
    const icons: { [key: string]: any } = {
      lancamento: "book",
      encontro: "people",
      feira: "storefront",
      outro: "ellipsis-horizontal",
    };
    return icons[categoria] || "calendar";
  };

  const getCategoryLabel = (categoria: string) => {
    const labels: { [key: string]: string } = {
      lancamento: "Lançamento",
      encontro: "Encontro",
      feira: "Feira",
      outro: "Outro",
    };
    return labels[categoria] || categoria;
  };

  const renderComunidade = ({ item }: { item: Comunidade }) => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return (
      <TouchableOpacity 
        style={styles.comunidadeCard}
        onPress={() => handleComunidadeClick(item)}
      >
        <View style={styles.comunidadeCardHeader}>
          {/* Ícone circular da Comunidade */}
          {item.photoURL ? (
            <Image 
              source={{ uri: item.photoURL }} 
              style={styles.comunidadeIcon}
            />
          ) : (
            <View style={styles.comunidadeIconPlaceholder}>
              <Ionicons name="people" size={24} color="#2E7D32" />
            </View>
          )}

          <View style={styles.comunidadeContent}>
            <View style={styles.headerRow}>
              <Text style={styles.comunidadeNome}>{item.nome}</Text>
              {user && isMember(item.id, user.uid) && (
                <View style={styles.memberBadge}>
                  <Text style={styles.memberBadgeText}>Membro</Text>
                </View>
              )}
            </View>
            <Text style={styles.comunidadeDono}>De: {item.ownerName}</Text>
            <Text style={styles.comunidadeDescricao} numberOfLines={1}>
              {item.descricao}
            </Text>
            <View style={styles.comunidadeFooter}>
              <View style={styles.footerRow}>
                <Ionicons name="people" size={16} color="#666" />
                <Text style={styles.membrosCount}>
                  {item.membros?.length || 1} {item.membros?.length === 1 ? "membro" : "membros"}
                </Text>
              </View>
              <View style={styles.footerRow}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.dataCount}>
                  Criada em {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'comunidades' ? 'Comunidades' : 'Eventos'}
        </Text>
      </View>

      {/* Tabs de Navegação */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'comunidades' && styles.activeTab]}
          onPress={() => setActiveTab('comunidades')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'comunidades' ? "#2E7D32" : "#666"} 
          />
          <Text style={[styles.tabText, activeTab === 'comunidades' && styles.activeTabText]}>
            Comunidades
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'eventos' && styles.activeTab]}
          onPress={() => setActiveTab('eventos')}
        >
          <Ionicons 
            name="calendar" 
            size={20} 
            color={activeTab === 'eventos' ? "#2E7D32" : "#666"} 
          />
          <Text style={[styles.tabText, activeTab === 'eventos' && styles.activeTabText]}>
            Eventos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo da aba Eventos */}
      {activeTab === 'eventos' ? (
        <ScrollView style={styles.eventosScrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.eventosSubtitle}>
            Visualize os pontos onde eventos literários estão acontecendo.
          </Text>

          {/* Mapa Nativo */}
          <View style={styles.eventosMapContainer}>
            {eventosLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Carregando eventos...</Text>
              </View>
            ) : eventos.length === 0 ? (
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
                initialRegion={{
                  latitude: eventos.length > 0 ? eventos[0].latitude : -23.5505,
                  longitude: eventos.length > 0 ? eventos[0].longitude : -46.6333,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                {eventos.map((evento, index) => (
                    <Marker
                      key={evento.id}
                      coordinate={{
                        latitude: evento.latitude,
                        longitude: evento.longitude,
                      }}
                      title={evento.titulo}
                      description={`${evento.local} • ${evento.cidade}`}
                      onPress={async () => {
                        await toggleSelecionado(evento.id);
                        if (mapRef.current) {
                          mapRef.current.animateToRegion({
                            latitude: evento.latitude,
                            longitude: evento.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                          }, 500);
                        }
                      }}
                    >
                      <View style={[
                        styles.markerContainer,
                        evento.selecionado && styles.markerContainerSelected
                      ]}>
                        <Ionicons name="calendar" size={20} color="#fff" />
                      </View>
                    </Marker>
                  ))}
              </MapView>
            )}
          </View>

          {/* Linha separadora */}
          <View style={styles.mapDivider} />

          {/* Lista de Eventos */}
          <View style={styles.eventsSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Eventos Literários</Text>
                <Text style={styles.sectionSubtitle}>
                  {eventos.length} {eventos.length === 1 ? 'evento disponível' : 'eventos disponíveis'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.createEventButton}
                onPress={() => router.push("/criar-evento" as any)}
              >
                <Ionicons name="add-circle" size={22} color="#fff" />
                <Text style={styles.createEventButtonText}>Novo</Text>
              </TouchableOpacity>
            </View>

            {eventos.length === 0 ? (
              <View style={styles.emptyEventsContainer}>
                <Ionicons name="calendar-outline" size={64} color="#ccc" />
                <Text style={styles.emptyEventsText}>Nenhum evento cadastrado</Text>
                <Text style={styles.emptyEventsSubtext}>
                  Seja o primeiro a criar um evento literário!
                </Text>
              </View>
            ) : (
              eventos.map((evento, index) => {
                const isOwner = user?.uid === evento.userId;
                
                return (
                  <View
                    key={evento.id}
                    style={[
                      styles.eventCard,
                      evento.selecionado && styles.eventCardSelected,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.eventCardContent}
                      onPress={() => toggleSelecionado(evento.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.eventIconContainer}>
                        <View style={[styles.eventIcon, { backgroundColor: getCategoryColor(evento.categoria) }]}>
                          <Ionicons name={getCategoryIcon(evento.categoria)} size={24} color="#fff" />
                        </View>
                        {evento.selecionado && (
                          <View style={styles.selectedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                          </View>
                        )}
                      </View>

                      <View style={styles.eventInfo}>
                        <View style={styles.eventHeader}>
                          <View style={[styles.eventCategoryBadge, { backgroundColor: getCategoryColor(evento.categoria) + '20' }]}>
                            <Text style={[styles.eventCategory, { color: getCategoryColor(evento.categoria) }]}>
                              {getCategoryLabel(evento.categoria)}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.eventTitle} numberOfLines={2}>{evento.titulo}</Text>

                        <View style={styles.eventDetails}>
                          <View style={styles.eventDetailRow}>
                            <Ionicons name="location" size={16} color="#666" />
                            <Text style={styles.eventDetailText} numberOfLines={1}>
                              {evento.local}, {evento.cidade}
                            </Text>
                          </View>

                          <View style={styles.eventDetailRow}>
                            <Ionicons name="calendar-outline" size={16} color="#666" />
                            <Text style={styles.eventDetailText}>
                              {new Intl.DateTimeFormat("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(evento.dataInicio)}
                            </Text>
                          </View>

                          <View style={styles.eventDetailRow}>
                            <Ionicons name="person-outline" size={16} color="#666" />
                            <Text style={styles.eventDetailText} numberOfLines={1}>
                              {evento.userName}
                            </Text>
                          </View>
                        </View>

                        {evento.descricao && (
                          <Text style={styles.eventDescription} numberOfLines={2}>
                            {evento.descricao}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Botões de ação - apenas para o dono */}
                    {isOwner && (
                      <View style={styles.eventActions}>
                        <TouchableOpacity
                          style={styles.editEventButton}
                          onPress={() => router.push({
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
                          } as any)}
                        >
                          <Ionicons name="pencil" size={18} color="#2E7D32" />
                          <Text style={styles.editEventButtonText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteEventButton}
                          onPress={() => {
                            Alert.alert(
                              "Confirmar Exclusão",
                              `Tem certeza que deseja excluir o evento "${evento.titulo}"?`,
                              [
                                { text: "Cancelar", style: "cancel" },
                                {
                                  text: "Excluir",
                                  style: "destructive",
                                  onPress: async () => {
                                    const result = await deleteEvento(evento.id);
                                    if (result.success) {
                                      Toast.show({
                                        type: "success",
                                        text1: "Evento excluído!",
                                        text2: "O evento foi removido com sucesso",
                                      });
                                    } else {
                                      Alert.alert("Erro", result.error || "Erro ao excluir evento");
                                    }
                                  },
                                },
                              ]
                            );
                          }}
                        >
                          <Ionicons name="trash" size={18} color="#D32F2F" />
                          <Text style={styles.deleteEventButtonText}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      ) : (
        <>
          {/* Conteúdo da aba Comunidades */}
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
          ) : minhasComunidades.length === 0 && outrasComunidades.length === 0 ? (
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
              data={[]}
              renderItem={() => null}
              ListHeaderComponent={
                <>
                  {/* Minhas Comunidades */}
                  {minhasComunidades.length > 0 && (
                    <>
                      <Text style={styles.sectionLabel}>Minhas Comunidades</Text>
                      {minhasComunidades.map((item) => (
                        <View key={item.id}>{renderComunidade({ item })}</View>
                      ))}
                    </>
                  )}

                  {/* Outras Comunidades */}
                  {outrasComunidades.length > 0 && (
                    <>
                      <Text style={styles.sectionLabel}>
                        {minhasComunidades.length > 0 ? "Descubra mais comunidades" : "Todas as Comunidades"}
                      </Text>
                      {outrasComunidades.map((item) => (
                        <View key={item.id}>{renderComunidade({ item })}</View>
                      ))}
                    </>
                  )}
                </>
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      {/* Barra de navegação inferior */}
      <BottomNavBar />

      {/* Botão flutuante + (apenas na aba de comunidades) */}
      {activeTab === 'comunidades' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/criar-comunidade")}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Dialog de confirmação de entrada */}
      <Modal
        visible={showDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Entrar na Comunidade</Text>
            
            {selectedComunidade && (
              <>
                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="people" size={20} color="#2E7D32" />
                    <Text style={styles.modalLabel}>Nome:</Text>
                  </View>
                  <Text style={styles.modalValue}>{selectedComunidade.nome}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="document-text" size={20} color="#2E7D32" />
                    <Text style={styles.modalLabel}>Descrição:</Text>
                  </View>
                  <Text style={styles.modalValue}>{selectedComunidade.descricao}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="person" size={20} color="#2E7D32" />
                    <Text style={styles.modalLabel}>Administrador:</Text>
                  </View>
                  <Text style={styles.modalValue}>{selectedComunidade.ownerName}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="calendar" size={20} color="#2E7D32" />
                    <Text style={styles.modalLabel}>Criada em:</Text>
                  </View>
                  <Text style={styles.modalValue}>
                    {selectedComunidade.createdAt.toLocaleDateString('pt-BR')}
                  </Text>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="people-outline" size={20} color="#2E7D32" />
                    <Text style={styles.modalLabel}>Membros:</Text>
                  </View>
                  <Text style={styles.modalValue}>
                    {selectedComunidade.membros?.length || 1} {selectedComunidade.membros?.length === 1 ? "membro" : "membros"}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDialog(false)}
                disabled={joiningLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.joinButton]}
                onPress={handleJoinComunidade}
                disabled={joiningLoading}
              >
                {joiningLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.joinButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    padding: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#E9ECEF",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#2E7D32",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#2E7D32",
  },
  // Conteúdo da aba Livrarias
  livrariasContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainerFullScreen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    position: "relative",
  },
  mapContainerFull: {
    height: "50%",
    backgroundColor: "#f5f5f5",
    position: "relative",
  },
  // Seção do Mapa
  mapSection: {
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  mapSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  mapHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mapSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  mapContainer: {
    height: 250,
    backgroundColor: "#f5f5f5",
    position: "relative",
  },
  mapLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 10,
  },
  webView: {
    flex: 1,
  },
  livrariasList: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  livrariasListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12,
  },
  livrariasListContent: {
    paddingBottom: 100,
  },
  livrariaCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  livrariaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  livrariaInfo: {
    flex: 1,
  },
  livrariaName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  livrariaAddress: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  livrariaFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFB800",
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    marginHorizontal: 20,
    marginVertical: 15,
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  comunidadeCard: {
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
  },
  comunidadeCardHeader: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  comunidadeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  comunidadeIconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#2E7D32",
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  comunidadeContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  comunidadeNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    flex: 1,
  },
  memberBadge: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
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
    flexDirection: "column",
    gap: 6,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  membrosCount: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  dataCount: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInfo: {
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  modalValue: {
    fontSize: 15,
    color: "#333",
    marginLeft: 28,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  joinButton: {
    backgroundColor: "#2E8B57",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  openMapButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    margin: 40,
    padding: 60,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#2E7D32",
    borderStyle: "dashed",
  },
  openMapTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 20,
    marginBottom: 12,
  },
  openMapSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  eventosMapContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  categoriesContentContainer: {
    gap: 8,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F0F8F0",
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  categoryButtonActive: {
    backgroundColor: "#2E7D32",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  eventosMapContainer: {
    height: 400,
    backgroundColor: "#E9ECEF",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerSelecionado: {
    backgroundColor: "#FFB800",
    borderColor: "#FFD700",
  },
  eventosInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  eventosCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  addEventButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F8F0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  addEventButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  // Estilos adicionais para a aba de eventos
  eventosScrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  eventosSubtitle: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  createButton: {
    flex: 1,
    backgroundColor: "#2E7D32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#2E7D32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  filterButtonText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "600",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    alignSelf: "center",
  },
  refreshButtonText: {
    color: "#666",
    fontSize: 13,
  },
  markerContainerSelected: {
    backgroundColor: "#1B5E20",
    borderWidth: 4,
    borderColor: "#4CAF50",
  },
  markerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  eventsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  createEventButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  createEventButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyEventsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyEventsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptyEventsSubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
  },
  eventCard: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  eventCardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
    gap: 12,
  },
  eventIconContainer: {
    position: "relative",
  },
  eventIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  eventInfo: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  eventHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  eventCategoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventCategoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  eventActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  editEventButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#E8F5E9",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  editEventButtonText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteEventButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFEBEE",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D32F2F",
  },
  deleteEventButtonText: {
    color: "#D32F2F",
    fontSize: 14,
    fontWeight: "600",
  },
});
