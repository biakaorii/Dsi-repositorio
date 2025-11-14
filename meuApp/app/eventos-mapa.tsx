// app/eventos-mapa.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEvents } from '@/contexts/EventsContext';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function EventosMapaScreen() {
  const router = useRouter();
  const { events } = useEvents();
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Obter localização do usuário
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permissão de localização negada');
          setLoadingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Erro ao obter localização:', error);
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  // Filtrar apenas eventos futuros com coordenadas válidas
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate >= now && event.latitude && event.longitude;
  });

  // Calcular região inicial do mapa
  const getInitialRegion = () => {
    if (upcomingEvents.length === 0) {
      // Se não houver eventos, centralizar na localização do usuário ou São Paulo
      if (userLocation) {
        return {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
      }
      // Coordenadas de São Paulo como fallback
      return {
        latitude: -23.550520,
        longitude: -46.633308,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    // Calcular centro e zoom baseado nos eventos
    const latitudes = upcomingEvents.map((e) => e.latitude);
    const longitudes = upcomingEvents.map((e) => e.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const latDelta = (maxLat - minLat) * 1.5 || 0.0922;
    const lngDelta = (maxLng - minLng) * 1.5 || 0.0421;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.05),
      longitudeDelta: Math.max(lngDelta, 0.05),
    };
  };

  const formatEventDate = (date: Date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkerPress = (eventId: string) => {
    router.push({
      pathname: '/evento-details',
      params: { eventId },
    });
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const fitAllMarkers = () => {
    if (upcomingEvents.length > 0 && mapRef.current) {
      const coordinates = upcomingEvents.map((event) => ({
        latitude: event.latitude,
        longitude: event.longitude,
      }));
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  if (loadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
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
        <Text style={styles.headerTitle}>Mapa de Eventos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={getInitialRegion()}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Marcadores de Eventos */}
        {upcomingEvents.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            pinColor="#4CAF50"
          >
            <Callout onPress={() => handleMarkerPress(event.id)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{event.title}</Text>
                <Text style={styles.calloutDate}>{formatEventDate(event.date)}</Text>
                <Text style={styles.calloutLocation} numberOfLines={1}>
                  {event.location}
                </Text>
                <Text style={styles.calloutTap}>Toque para ver detalhes</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Controles do Mapa */}
      <View style={styles.controls}>
        {userLocation && (
          <TouchableOpacity style={styles.controlButton} onPress={centerOnUserLocation}>
            <Ionicons name="locate" size={24} color="#2E7D32" />
          </TouchableOpacity>
        )}
        
        {upcomingEvents.length > 0 && (
          <TouchableOpacity style={styles.controlButton} onPress={fitAllMarkers}>
            <Ionicons name="expand" size={24} color="#2E7D32" />
          </TouchableOpacity>
        )}
      </View>

      {/* Info sobre quantidade de eventos */}
      <View style={styles.infoCard}>
        <Ionicons name="calendar" size={20} color="#4CAF50" />
        <Text style={styles.infoText}>
          {upcomingEvents.length === 0
            ? 'Nenhum evento futuro cadastrado'
            : `${upcomingEvents.length} evento${upcomingEvents.length > 1 ? 's' : ''} futuro${upcomingEvents.length > 1 ? 's' : ''}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  map: {
    flex: 1,
    width: width,
  },
  callout: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  calloutDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  calloutLocation: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
  calloutTap: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  controls: {
    position: 'absolute',
    right: 20,
    top: 120,
    gap: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
});
