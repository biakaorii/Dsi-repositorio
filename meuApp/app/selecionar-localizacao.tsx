import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get("window");

export default function SelecionarLocalizacaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [latitude, setLatitude] = useState(
    params.currentLat ? parseFloat(params.currentLat as string) : -23.5505
  );
  const [longitude, setLongitude] = useState(
    params.currentLng ? parseFloat(params.currentLng as string) : -46.6333
  );

  // Região inicial do mapa
  const initialRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
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

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);
  };

  const handleConfirm = () => {
    // Retornar as coordenadas para a tela anterior usando navigate
    // Preserva os dados do formulário que foram passados via params
    const returnParams: any = {
      selectedLat: latitude.toFixed(6),
      selectedLng: longitude.toFixed(6),
    };

    // Repassar todos os parâmetros recebidos de volta
    if (params.titulo) returnParams.titulo = params.titulo;
    if (params.descricao) returnParams.descricao = params.descricao;
    if (params.local) returnParams.local = params.local;
    if (params.cidade) returnParams.cidade = params.cidade;
    if (params.estado) returnParams.estado = params.estado;
    if (params.pais) returnParams.pais = params.pais;
    if (params.categoria) returnParams.categoria = params.categoria;
    if (params.linkIngressos) returnParams.linkIngressos = params.linkIngressos;
    if (params.dataInicio) returnParams.dataInicio = params.dataInicio;
    if (params.dataFim) returnParams.dataFim = params.dataFim;

    router.replace({
      pathname: "/criar-evento" as any,
      params: returnParams,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Selecione a Localização</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Instruções */}
      <View style={styles.instructions}>
        <Ionicons name="information-circle" size={20} color="#2E7D32" />
        <Text style={styles.instructionsText}>
          Toque no mapa ou arraste o marcador para posicionar
        </Text>
      </View>

      {/* Mapa Nativo */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          customMapStyle={mapStyle}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            draggable
            onDragEnd={handleMapPress}
            title="Localização do Evento"
            description="Arraste para ajustar a posição"
          >
            <View style={styles.markerContainer}>
              <Ionicons name="location" size={40} color="#2E7D32" />
            </View>
          </Marker>
        </MapView>

        {/* Overlay com coordenadas flutuante */}
        <View style={styles.coordsOverlay}>
          <View style={styles.coordsRow}>
            <Ionicons name="navigate-circle" size={16} color="#2E7D32" />
            <Text style={styles.coordsText}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer com Coordenadas e Botão Confirmar */}
      <View style={styles.footer}>
        <View style={styles.coordsContainer}>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>Latitude:</Text>
            <Text style={styles.coordValue}>{latitude.toFixed(6)}</Text>
          </View>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>Longitude:</Text>
            <Text style={styles.coordValue}>{longitude.toFixed(6)}</Text>
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close-circle-outline" size={20} color="#666" />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirmar Localização</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  instructions: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: "#2E7D32",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  coordsOverlay: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  coordsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coordsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
    fontFamily: "monospace",
  },
  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    padding: 20,
    paddingBottom: 30,
  },
  coordsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  coordItem: {
    alignItems: "center",
  },
  coordLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    fontFamily: "monospace",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  confirmButton: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
});
