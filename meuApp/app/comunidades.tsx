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
import { useTheme } from "../contexts/ThemeContext";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

export default function ComunidadesScreen() {
  const { comunidades, loading, isMember, joinComunidade } = useComunidades();
  const { eventos, loading: eventosLoading, toggleSelecionado, deleteEvento } = useEventos();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [minhasComunidades, setMinhasComunidades] = useState<Comunidade[]>([]);
  const [outrasComunidades, setOutrasComunidades] = useState<Comunidade[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComunidade, setSelectedComunidade] = useState<Comunidade | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'comunidades' | 'eventos'>('comunidades');
  const [eventSearchText, setEventSearchText] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
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

  // Categorias de eventos
  const categorias = [
    { id: "lancamento", label: "Lançamentos", icon: "book", color: "#2E7D32" },
    { id: "encontro", label: "Encontros", icon: "people", color: "#1976D2" },
    { id: "feira", label: "Feiras", icon: "storefront", color: "#F57C00" },
    { id: "outro", label: "Outros", icon: "ellipsis-horizontal", color: "#7B1FA2" },
  ];

  // Função para contar eventos por categoria
  const getEventCountByCategory = (categoryId: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas a data
    
    return eventos.filter(evento => {
      const dataEvento = new Date(evento.dataInicio);
      dataEvento.setHours(0, 0, 0, 0);
      return evento.categoria === categoryId && dataEvento >= hoje;
    }).length;
  };

  // Filtrar eventos futuros (remover eventos passados)
  const eventosFuturos = eventos.filter((evento) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataEvento = new Date(evento.dataInicio);
    dataEvento.setHours(0, 0, 0, 0);
    return dataEvento >= hoje;
  });

  // Filtrar eventos por categoria, texto de pesquisa e seleção (já filtrados por data)
  const eventosFiltrados = eventosFuturos.filter((evento) => {
    // Se NÃO tem filtro de categoria ou busca ativa, mostrar apenas selecionados
    const temFiltroAtivo = selectedCategoria || eventSearchText.trim() !== "";
    
    if (!temFiltroAtivo) {
      // Sem filtros: mostrar apenas eventos selecionados
      if (!evento.selecionado) return false;
    }
    
    // Filtro por categoria
    const passaCategoria = selectedCategoria ? evento.categoria === selectedCategoria : true;
    
    // Filtro por texto de pesquisa
    const passaPesquisa = eventSearchText.trim() === "" ? true : 
      evento.titulo.toLowerCase().includes(eventSearchText.toLowerCase()) ||
      evento.local.toLowerCase().includes(eventSearchText.toLowerCase()) ||
      evento.cidade.toLowerCase().includes(eventSearchText.toLowerCase()) ||
      (evento.descricao && evento.descricao.toLowerCase().includes(eventSearchText.toLowerCase()));
    
    return passaCategoria && passaPesquisa;
  });

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
        style={[styles.comunidadeCard, { backgroundColor: colors.card }]}
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
            <View style={[styles.comunidadeIconPlaceholder, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="people" size={24} color={colors.primary} />
            </View>
          )}

          <View style={styles.comunidadeContent}>
            <View style={styles.headerRow}>
              <Text style={[styles.comunidadeNome, { color: colors.text }]}>{item.nome}</Text>
              {user && isMember(item.id, user.uid) && (
                <View style={[styles.memberBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.memberBadgeText, { color: colors.primary }]}>Membro</Text>
                </View>
              )}
            </View>
            <Text style={[styles.comunidadeDono, { color: colors.textSecondary }]}>De: {item.ownerName}</Text>
            <Text style={[styles.comunidadeDescricao, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.descricao}
            </Text>
            <View style={styles.comunidadeFooter}>
              <View style={styles.footerRow}>
                <Ionicons name="people" size={16} color={colors.textSecondary} />
                <Text style={[styles.membrosCount, { color: colors.textSecondary }]}>
                  {item.membros?.length || 1} {item.membros?.length === 1 ? "membro" : "membros"}
                </Text>
              </View>
              <View style={styles.footerRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.dataCount, { color: colors.textSecondary }]}>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          {activeTab === 'comunidades' ? 'Comunidades' : 'Eventos'}
        </Text>
      </View>

      {/* Tabs de Navegação */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'comunidades' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('comunidades')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'comunidades' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'comunidades' && [styles.activeTabText, { color: colors.primary }]]}>
            Comunidades
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'eventos' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('eventos')}
        >
          <Ionicons 
            name="calendar" 
            size={20} 
            color={activeTab === 'eventos' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'eventos' && [styles.activeTabText, { color: colors.primary }]]}>
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
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando eventos...</Text>
              </View>
            ) : eventos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="map-outline" size={64} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum evento encontrado</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Seja o primeiro a criar um evento!
                </Text>
              </View>
            ) : (
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: eventosFuturos.length > 0 ? eventosFuturos[0].latitude : -23.5505,
                  longitude: eventosFuturos.length > 0 ? eventosFuturos[0].longitude : -46.6333,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                {eventosFuturos.map((evento, index) => (
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
                        evento.selecionado && styles.markerContainerSelected,
                        { backgroundColor: colors.primary, borderColor: colors.card, shadowColor: colors.shadow }
                      ]}>
                        <Ionicons name="calendar" size={20} color={colors.card} />
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
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Eventos Literários</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  {eventosFiltrados.length} {eventosFiltrados.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.createEventButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                onPress={() => router.push("/criar-evento" as any)}
              >
                <Ionicons name="add-circle" size={22} color={colors.card} />
                <Text style={[styles.createEventButtonText, { color: colors.card }]}>Novo</Text>
              </TouchableOpacity>
            </View>

            {/* Botão de Filtros */}
            <TouchableOpacity
              style={[styles.filterButtonBelow, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons 
                name={selectedCategoria ? "funnel" : "funnel-outline"} 
                size={20} 
                color={selectedCategoria ? colors.primary : colors.textSecondary} 
              />
              <Text style={[styles.filterButtonBelowText, { color: colors.text }]}>
                Filtros {selectedCategoria && '• 1 ativo'}
              </Text>
            </TouchableOpacity>

            {/* Barra de pesquisa */}
            <View style={styles.eventSearchContainer}>
              <View style={[styles.searchInputContainer, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Buscar eventos..."
                  value={eventSearchText}
                  onChangeText={setEventSearchText}
                  placeholderTextColor={colors.placeholder}
                />
                {eventSearchText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setEventSearchText("")}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {eventosFiltrados.length === 0 ? (
              <View style={styles.emptyEventsContainer}>
                <Ionicons name="calendar-outline" size={64} color={colors.border} />
                <Text style={[styles.emptyEventsText, { color: colors.placeholder }]}>
                  {eventos.length === 0 ? 'Nenhum evento cadastrado' : 'Nenhum evento encontrado'}
                </Text>
                <Text style={[styles.emptyEventsSubtext, { color: colors.placeholder }]}>
                  {eventos.length === 0 
                    ? 'Seja o primeiro a criar um evento literário!' 
                    : 'Tente ajustar os filtros ou a pesquisa'}
                </Text>
              </View>
            ) : (
              eventosFiltrados.map((evento, index) => {
                const isOwner = user?.uid === evento.userId;
                
                return (
                  <View
                    key={evento.id}
                    style={[
                      styles.eventCard,
                      { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
                      evento.selecionado && [styles.eventCardSelected, { backgroundColor: colors.primaryLight }],
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.eventCardContent}
                      onPress={() => toggleSelecionado(evento.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.eventIconContainer}>
                        <View style={[styles.eventIcon, { backgroundColor: getCategoryColor(evento.categoria) }]}>
                          <Ionicons name={getCategoryIcon(evento.categoria)} size={24} color={colors.card} />
                        </View>
                        {evento.selecionado && (
                          <View style={[styles.selectedBadge, { borderColor: colors.card }]}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                          </View>
                        )}
                      </View>

                      <View style={styles.eventInfo}>
                        <View style={styles.eventHeader}>
                          <View style={[styles.eventCategoryBadge, { backgroundColor: getCategoryColor(evento.categoria) + '20' }]}>
                            <Text style={[styles.eventCategoryText, { color: getCategoryColor(evento.categoria) }]}>
                              {getCategoryLabel(evento.categoria)}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>{evento.titulo}</Text>

                        <View style={styles.eventDetails}>
                          <View style={styles.eventDetailRow}>
                            <Ionicons name="location" size={16} color={colors.textSecondary} />
                            <Text style={[styles.eventDetailText, { color: colors.textSecondary }]} numberOfLines={1}>
                              {evento.local}, {evento.cidade}
                            </Text>
                          </View>

                          <View style={styles.eventDetailRow}>
                            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                            <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                              {new Intl.DateTimeFormat("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(evento.dataInicio)}
                            </Text>
                          </View>

                          <View style={styles.eventDetailRow}>
                            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                            <Text style={[styles.eventDetailText, { color: colors.textSecondary }]} numberOfLines={1}>
                              {evento.userName}
                            </Text>
                          </View>
                        </View>

                        {evento.descricao && (
                          <Text style={[styles.eventDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                            {evento.descricao}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Botões de ação - apenas para o dono */}
                    {isOwner && (
                      <View style={[styles.eventActions, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                          style={[styles.editEventButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
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
                          <Ionicons name="pencil" size={18} color={colors.primary} />
                          <Text style={[styles.editEventButtonText, { color: colors.primary }]}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.deleteEventButton, { backgroundColor: '#FFEBEE' }]}
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
          <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar comunidades..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.placeholder}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={colors.placeholder} />
              </TouchableOpacity>
            )}
          </View>

          {/* Lista de comunidades */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando comunidades...</Text>
            </View>
          ) : minhasComunidades.length === 0 && outrasComunidades.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.placeholder }]}>
                {searchQuery ? "Nenhuma comunidade encontrada" : "Ainda não há comunidades"}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.placeholder }]}>
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
                      <Text style={[styles.sectionLabel, { color: colors.primary }]}>Minhas Comunidades</Text>
                      {minhasComunidades.map((item) => (
                        <View key={item.id}>{renderComunidade({ item })}</View>
                      ))}
                    </>
                  )}

                  {/* Outras Comunidades */}
                  {outrasComunidades.length > 0 && (
                    <>
                      <Text style={[styles.sectionLabel, { color: colors.primary }]}>
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
          style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
          onPress={() => router.push("/criar-comunidade")}
        >
          <Ionicons name="add" size={28} color={colors.card} />
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
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>Entrar na Comunidade</Text>
            
            {selectedComunidade && (
              <>
                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="people" size={20} color={colors.primary} />
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Nome:</Text>
                  </View>
                  <Text style={[styles.modalValue, { color: colors.text }]}>{selectedComunidade.nome}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="document-text" size={20} color={colors.primary} />
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Descrição:</Text>
                  </View>
                  <Text style={[styles.modalValue, { color: colors.text }]}>{selectedComunidade.descricao}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="person" size={20} color={colors.primary} />
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Administrador:</Text>
                  </View>
                  <Text style={[styles.modalValue, { color: colors.text }]}>{selectedComunidade.ownerName}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="calendar" size={20} color={colors.primary} />
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Criada em:</Text>
                  </View>
                  <Text style={[styles.modalValue, { color: colors.text }]}>
                    {selectedComunidade.createdAt.toLocaleDateString('pt-BR')}
                  </Text>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Ionicons name="people-outline" size={20} color={colors.primary} />
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Membros:</Text>
                  </View>
                  <Text style={[styles.modalValue, { color: colors.text }]}>
                    {selectedComunidade.membros?.length || 1} {selectedComunidade.membros?.length === 1 ? "membro" : "membros"}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                onPress={() => setShowDialog(false)}
                disabled={joiningLoading}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.joinButton, { backgroundColor: '#2E8B57' }]}
                onPress={handleJoinComunidade}
                disabled={joiningLoading}
              >
                {joiningLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.joinButtonText, { color: '#fff' }]}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Filtros de Eventos */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModalContent}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filtrar Eventos</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptions}>
              <Text style={styles.filterSectionTitle}>Categorias</Text>
              
              {categorias.map((categoria) => {
                const count = getEventCountByCategory(categoria.id);
                const isSelected = selectedCategoria === categoria.id;
                
                return (
                  <TouchableOpacity
                    key={categoria.id}
                    style={[
                      styles.filterOption,
                      isSelected && { backgroundColor: categoria.color + '20', borderColor: categoria.color }
                    ]}
                    onPress={() => {
                      setSelectedCategoria(isSelected ? null : categoria.id);
                    }}
                  >
                    <View style={styles.filterOptionLeft}>
                      <Ionicons 
                        name={categoria.icon as any} 
                        size={24} 
                        color={isSelected ? categoria.color : '#666'} 
                      />
                      <Text style={[
                        styles.filterOptionText,
                        isSelected && { color: categoria.color, fontWeight: '600' }
                      ]}>
                        {categoria.label}
                      </Text>
                    </View>
                    <View style={styles.filterOptionRight}>
                      <View style={styles.eventCountBadge}>
                        <Text style={styles.eventCountText}>
                          {count}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={categoria.color} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.filterModalFooter}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSelectedCategoria(null);
                  setEventSearchText("");
                }}
              >
                <Ionicons name="refresh" size={20} color="#666" />
                <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyFiltersText}>Aplicar</Text>
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
  },
  // Tabs
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 2,
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
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
  },
  // Conteúdo da aba Livrarias
  livrariasContent: {
    flex: 1,
  },
  mapContainerFullScreen: {
    flex: 1,
    position: "relative",
  },
  mapContainerFull: {
    height: "50%",
    position: "relative",
  },
  // Seção do Mapa
  mapSection: {
    borderBottomWidth: 1,
  },
  mapSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  mapHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mapSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  mapContainer: {
    height: 250,
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
  },
  livrariasListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  livrariasListContent: {
    paddingBottom: 100,
  },
  livrariaCard: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  livrariaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 4,
  },
  livrariaAddress: {
    fontSize: 12,
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
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
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  comunidadeCard: {
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
  },
  comunidadeIconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
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
    flex: 1,
  },
  memberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  comunidadeDono: {
    fontSize: 13,
    marginBottom: 8,
  },
  comunidadeDescricao: {
    fontSize: 14,
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
    marginLeft: 6,
  },
  dataCount: {
    fontSize: 13,
    marginLeft: 6,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
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
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
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
  },
  modalValue: {
    fontSize: 15,
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
    borderWidth: 1,
  },
  cancelButtonText: {
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
    margin: 40,
    padding: 60,
    borderRadius: 20,
    borderWidth: 3,
    borderStyle: "dashed",
  },
  openMapTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
  },
  openMapSubtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  eventosMapContent: {
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    borderWidth: 1,
  },
  categoryButtonActive: {
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryButtonTextActive: {
  },
  eventosMapContainer: {
    height: 400,
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
    marginHorizontal: 16,
    marginBottom: 8,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
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
    borderTopWidth: 1,
  },
  eventosCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  addEventButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  addEventButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Estilos adicionais para a aba de eventos
  eventosScrollView: {
    flex: 1,
  },
  eventosSubtitle: {
    fontSize: 14,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  filterButtonText: {
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
    borderRadius: 20,
    alignSelf: "center",
  },
  refreshButtonText: {
    fontSize: 13,
  },
  markerContainerSelected: {
    backgroundColor: "#1B5E20",
    borderWidth: 4,
    borderColor: "#4CAF50",
  },
  markerText: {
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  createEventButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  createEventButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  viewMapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewMapButtonText: {
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
    marginTop: 16,
  },
  emptyEventsSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  eventCard: {
    flexDirection: "column",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
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
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  eventActions: {
    flexDirection: "row",
    borderTopWidth: 1,
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
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  editEventButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  deleteEventButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
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
  // Estilos específicos do filtro de eventos (não confundir com filterButton de comunidades)
  eventSearchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButtonBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  filterButtonBelowText: {
    fontSize: 15,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  // Estilos do modal de filtros
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filterOptions: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  filterOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  filterModalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyFiltersButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: '700',
  },
  eventCardSelected: {
    borderColor: '#4CAF50',
  },
});
