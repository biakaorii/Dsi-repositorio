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
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import BottomNavBar from "../components/BottomNavBar";
import { useComunidades, Comunidade } from "../contexts/ComunidadesContext";
import { useAuth } from "../contexts/AuthContext";
import Toast from "react-native-toast-message";

type Livraria = {
  id: string;
  name: string;
  address: string;
  distance?: string;
  rating?: number;
  isOpen?: boolean;
};

export default function ComunidadesScreen() {
  const { comunidades, loading, isMember, joinComunidade } = useComunidades();
  const { user } = useAuth();
  const [minhasComunidades, setMinhasComunidades] = useState<Comunidade[]>([]);
  const [outrasComunidades, setOutrasComunidades] = useState<Comunidade[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComunidade, setSelectedComunidade] = useState<Comunidade | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'comunidades' | 'livrarias'>('comunidades');
  const [mapLoading, setMapLoading] = useState(true);
  const [livrarias, setLivrarias] = useState<Livraria[]>([]);
  const webViewRef = useRef<WebView>(null);
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

  // Carregar livrarias próximas
  useEffect(() => {
    const mockLivrarias: Livraria[] = [
      {
        id: "1",
        name: "Livraria Cultura",
        address: "Av. Paulista, 2073 - Consolação, São Paulo",
        distance: "1.2 km",
        rating: 4.5,
        isOpen: true,
      },
      {
        id: "2",
        name: "Saraiva Megastore",
        address: "Shopping Eldorado - Pinheiros, São Paulo",
        distance: "2.5 km",
        rating: 4.3,
        isOpen: true,
      },
      {
        id: "3",
        name: "Livraria da Vila",
        address: "R. Fradique Coutinho, 915 - Pinheiros, São Paulo",
        distance: "3.1 km",
        rating: 4.7,
        isOpen: false,
      },
    ];
    setLivrarias(mockLivrarias);
  }, []);

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

  const openDirections = (livraria: Livraria) => {
    const query = encodeURIComponent(livraria.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    Linking.openURL(url);
  };

  // HTML do mapa
  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; }
          body { overflow: hidden; }
          iframe { 
            width: 100vw; 
            height: 100vh; 
            border: 0;
            display: block;
          }
        </style>
      </head>
      <body>
        <iframe 
          src="https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=livrarias+perto+de+mim&zoom=14"
          frameborder="0"
          loading="lazy"
          allowfullscreen>
        </iframe>
      </body>
    </html>
  `;

  const renderLivraria = ({ item }: { item: Livraria }) => (
    <TouchableOpacity 
      style={styles.livrariaCard}
      onPress={() => openDirections(item)}
    >
      <View style={styles.livrariaIcon}>
        <Ionicons name="book" size={20} color="#2E7D32" />
      </View>
      
      <View style={styles.livrariaInfo}>
        <Text style={styles.livrariaName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.livrariaAddress} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.livrariaFooter}>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
          {item.distance && (
            <Text style={styles.distanceText}>{item.distance}</Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#2E7D32" />
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Comunidades</Text>
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
          style={[styles.tab, activeTab === 'livrarias' && styles.activeTab]}
          onPress={() => setActiveTab('livrarias')}
        >
          <Ionicons 
            name="map" 
            size={20} 
            color={activeTab === 'livrarias' ? "#2E7D32" : "#666"} 
          />
          <Text style={[styles.tabText, activeTab === 'livrarias' && styles.activeTabText]}>
            Livrarias
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo da aba Livrarias */}
      {activeTab === 'livrarias' ? (
        <View style={styles.livrariasContent}>
          {/* Mapa em tela cheia */}
          <View style={styles.mapContainerFullScreen}>
            {mapLoading && (
              <View style={styles.mapLoadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Carregando mapa...</Text>
              </View>
            )}
            <WebView
              ref={webViewRef}
              source={{ html: mapHTML }}
              style={styles.webView}
              onLoadStart={() => setMapLoading(true)}
              onLoadEnd={() => setMapLoading(false)}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              cacheEnabled={true}
              scrollEnabled={false}
              bounces={false}
            />
          </View>
        </View>
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

      {/* Botão flutuante + */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/criar-comunidade")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

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
});
