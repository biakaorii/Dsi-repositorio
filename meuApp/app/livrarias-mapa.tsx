// app/livrarias-mapa.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  FlatList,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";

type Livraria = {
  id: string;
  name: string;
  address: string;
  distance?: string;
  rating?: number;
  isOpen?: boolean;
};

export default function LivrariasMapaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [livrarias, setLivrarias] = useState<Livraria[]>([]);
  const webViewRef = useRef<WebView>(null);

  // HTML simplificado e otimizado do Google Maps Embed
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

  // Função para extrair livrarias do mapa (simula busca)
  useEffect(() => {
    // Simular dados de livrarias próximas INSTANTANEAMENTE
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
      {
        id: "4",
        name: "Livraria Martins Fontes",
        address: "Av. Paulista, 509 - Bela Vista, São Paulo",
        distance: "1.8 km",
        rating: 4.6,
        isOpen: true,
      },
      {
        id: "5",
        name: "Livraria Travessa",
        address: "Shopping Iguatemi - Faria Lima, São Paulo",
        distance: "4.2 km",
        rating: 4.4,
        isOpen: true,
      },
    ];

    // Carregar lista imediatamente
    setLivrarias(mockLivrarias);
  }, []);

  const openDirections = (livraria: Livraria) => {
    const query = encodeURIComponent(livraria.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    Linking.openURL(url);
  };

  const renderLivraria = ({ item }: { item: Livraria }) => (
    <TouchableOpacity 
      style={styles.livrariaCard}
      onPress={() => openDirections(item)}
    >
      <View style={styles.livrariaIcon}>
        <Ionicons name="book" size={24} color="#2E7D32" />
      </View>
      
      <View style={styles.livrariaInfo}>
        <View style={styles.livrariaHeader}>
          <Text style={styles.livrariaName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isOpen !== undefined && (
            <View style={[styles.statusBadge, item.isOpen ? styles.openBadge : styles.closedBadge]}>
              <Text style={styles.statusText}>
                {item.isOpen ? "Aberto" : "Fechado"}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.livrariaAddress} numberOfLines={2}>
          {item.address}
        </Text>
        
        <View style={styles.livrariaFooter}>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
          {item.distance && (
            <View style={styles.distanceContainer}>
              <Ionicons name="walk" size={14} color="#666" />
              <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Livrarias Próximas</Text>
        <TouchableOpacity onPress={() => webViewRef.current?.reload()}>
          <Ionicons name="refresh" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {/* Informação */}
      <View style={styles.infoBar}>
        <Ionicons name="location" size={20} color="#2E7D32" />
        <Text style={styles.infoText}>
          O Google Maps irá solicitar sua localização para mostrar livrarias próximas
        </Text>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      )}

      {/* WebView com Google Maps - Altura aumentada para ser destaque */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          cacheEnabled={true}
          scrollEnabled={false}
          bounces={false}
        />
      </View>

      {/* Lista de Livrarias */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Ionicons name="list" size={20} color="#2E7D32" />
          <Text style={styles.listTitle}>Livrarias Próximas</Text>
        </View>
        
        <FlatList
          data={livrarias}
          renderItem={renderLivraria}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.emptyText}>Buscando livrarias...</Text>
            </View>
          }
        />
      </View>
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
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  infoText: {
    fontSize: 14,
    color: "#2E7D32",
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  mapContainer: {
    height: "60%", // 60% da tela para o mapa ser o destaque principal
    backgroundColor: "#f5f5f5",
  },
  webView: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    gap: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  livrariaCard: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  livrariaIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  livrariaInfo: {
    flex: 1,
  },
  livrariaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  livrariaName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: "#4CAF50",
  },
  closedBadge: {
    backgroundColor: "#F44336",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  livrariaAddress: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  livrariaFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFB800",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    color: "#666",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
});
