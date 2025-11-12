import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useShelf } from '../utils/useShelf';
import { Shelf } from '../utils/types';
import BottomNavBar from '../components/BottomNavBar';

export default function EstantesScreen() {
  const router = useRouter();
  const { shelves, loading, loadShelves, deleteShelf } = useShelf();
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);

  // Recarregar estantes quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadShelves();
    }, [loadShelves])
  );

  const handleCreateShelf = () => {
    router.push('/criar-estante' as any);
  };

  const handleEditShelf = (shelfId: string) => {
    router.push({
      pathname: '/criar-estante' as any,
      params: { shelfId },
    });
  };

  const handleDeleteShelf = (shelfId: string, shelfName: string) => {
    Alert.alert(
      'Deletar Estante',
      `Tem certeza que deseja deletar a estante "${shelfName}"? Todos os livros serão removidos.`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Deletar',
          onPress: async () => {
            const result = await deleteShelf(shelfId);
            if (result.success) {
              Alert.alert('Sucesso', result.message);
              loadShelves();
            } else {
              Alert.alert('Erro', result.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleViewShelf = (shelfId: string) => {
    router.push({
      pathname: '/detalhes-estante' as any,
      params: { shelfId },
    });
  };

  const renderShelfCard = ({ item }: { item: Shelf }) => (
    <TouchableOpacity
      style={styles.shelfCard}
      onPress={() => handleViewShelf(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.shelfHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.shelfName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={styles.shelfDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.bookCountBadge}>
          <Ionicons name="book" size={16} color="#fff" />
          <Text style={styles.bookCount}>{item.books.length}</Text>
        </View>
      </View>

      <View style={styles.shelfFooter}>
        <Text style={styles.createdDate}>
          Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => handleEditShelf(item.id)}
            style={styles.iconButton}
          >
            <Ionicons name="create" size={20} color="#2E7D32" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteShelf(item.id, item.name)}
            style={styles.iconButton}
          >
            <Ionicons name="trash" size={20} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="library" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Nenhuma estante criada</Text>
      <Text style={styles.emptySubtext}>
        Toque no botão "+" para criar sua primeira estante
      </Text>
    </View>
  );

  if (loading && shelves.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Estantes</Text>
        <TouchableOpacity
          onPress={handleCreateShelf}
          style={styles.createButton}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista de estantes */}
      <FlatList
        data={shelves}
        renderItem={renderShelfCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Navbar */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  shelfCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shelfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shelfName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  shelfDescription: {
    fontSize: 14,
    color: '#666',
  },
  bookCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  bookCount: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  shelfFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
