// components/StickerPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useStickers, Sticker } from '../contexts/StickersContext';
import { uploadSticker } from '../utils/uploadSticker';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';

interface StickerPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectSticker?: (imageUrl: string) => void;
  onSelect?: (imageUrl: string) => void;
}

export default function StickerPicker({ visible, onClose, onSelectSticker, onSelect }: StickerPickerProps) {
  const { user } = useAuth();
  const { myStickers, recentStickers, favoriteStickers, addSticker, addFavorite, removeFavorite, isFavorite, loading } = useStickers();
  const [activeTab, setActiveTab] = useState<'my' | 'recent' | 'favorite'>('my');
  const [uploading, setUploading] = useState(false);

  const handleSelect = (imageUrl: string) => {
    if (onSelectSticker) {
      onSelectSticker(imageUrl);
    } else if (onSelect) {
      onSelect(imageUrl);
    }
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'É necessário permitir o acesso à galeria para adicionar stickers.');
      return false;
    }
    return true;
  };

  const handleAddSticker = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission || !user) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const stickerId = `${Date.now()}_${user.uid}`;
        const imageUrl = await uploadSticker(result.assets[0].uri, user.uid, stickerId);
        
        if (imageUrl) {
          await addSticker(imageUrl);
          Toast.show({
            type: 'success',
            text1: 'Sticker adicionado!',
            visibilityTime: 2000,
            topOffset: 50,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Erro ao adicionar sticker',
            visibilityTime: 2000,
            topOffset: 50,
          });
        }
        setUploading(false);
      }
    } catch (error) {
      console.error('Erro ao adicionar sticker:', error);
      setUploading(false);
      Toast.show({
        type: 'error',
        text1: 'Erro ao adicionar sticker',
        visibilityTime: 2000,
        topOffset: 50,
      });
    }
  };

  const handleStickerPress = (sticker: Sticker) => {
    handleSelect(sticker.imageUrl);
    onClose();
  };

  const handleFavoriteToggle = async (sticker: Sticker, e: any) => {
    e.stopPropagation();
    
    try {
      if (isFavorite(sticker.imageUrl)) {
        const fav = favoriteStickers.find(s => s.imageUrl === sticker.imageUrl);
        if (fav) {
          await removeFavorite(fav.id);
        }
      } else {
        await addFavorite(sticker.imageUrl);
        Toast.show({
          type: 'success',
          text1: 'Adicionado aos favoritos!',
          visibilityTime: 1500,
          topOffset: 50,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao favoritar',
        visibilityTime: 2000,
        topOffset: 50,
      });
    }
  };

  const displayStickers = 
    activeTab === 'my' ? myStickers :
    activeTab === 'recent' ? recentStickers : 
    favoriteStickers;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Stickers</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'my' && styles.activeTab]}
              onPress={() => setActiveTab('my')}
            >
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={activeTab === 'my' ? '#2E7D32' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
                Minhas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
              onPress={() => setActiveTab('recent')}
            >
              <Ionicons 
                name="time-outline" 
                size={20} 
                color={activeTab === 'recent' ? '#2E7D32' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
                Recentes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'favorite' && styles.activeTab]}
              onPress={() => setActiveTab('favorite')}
            >
              <Ionicons 
                name="heart-outline" 
                size={20} 
                color={activeTab === 'favorite' ? '#2E7D32' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === 'favorite' && styles.activeTabText]}>
                Favoritos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} contentContainerStyle={styles.stickersGrid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
              </View>
            ) : displayStickers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name={activeTab === 'my' ? 'images-outline' : activeTab === 'recent' ? 'time-outline' : 'heart-outline'} 
                  size={64} 
                  color="#ccc" 
                />
                <Text style={styles.emptyText}>
                  {activeTab === 'my' 
                    ? 'Nenhum sticker criado' 
                    : activeTab === 'recent'
                    ? 'Nenhum sticker recente'
                    : 'Nenhum favorito ainda'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {activeTab === 'my'
                    ? 'Crie seu primeiro sticker!'
                    : activeTab === 'recent'
                    ? 'Stickers enviados aparecem aqui'
                    : 'Favorite stickers para vê-los aqui'}
                </Text>
              </View>
            ) : (
              displayStickers.map((sticker) => (
                <TouchableOpacity
                  key={sticker.id}
                  style={styles.stickerItem}
                  onPress={() => handleStickerPress(sticker)}
                  onLongPress={(e) => (activeTab === 'my' || activeTab === 'recent') && handleFavoriteToggle(sticker, e)}
                >
                  <Image source={{ uri: sticker.imageUrl }} style={styles.stickerImage} />
                  {(activeTab === 'my' || activeTab === 'recent') && (
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={(e) => handleFavoriteToggle(sticker, e)}
                    >
                      <Ionicons
                        name={isFavorite(sticker.imageUrl) ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFavorite(sticker.imageUrl) ? '#E63946' : '#fff'}
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Add Button (apenas na aba minhas figurinhas) */}
          {activeTab === 'my' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddSticker}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="add" size={24} color="#fff" />
                  <Text style={styles.addButtonText}>Adicionar Sticker</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#2E7D32',
  },
  content: {
    flex: 1,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  stickerItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    width: '100%',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
