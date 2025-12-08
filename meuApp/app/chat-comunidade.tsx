import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useComunidades } from "../contexts/ComunidadesContext";
import { useAuth } from "../contexts/AuthContext";
import Toast from "react-native-toast-message";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { uploadChatImage } from "../utils/uploadChatImage";

interface ChatMessage {
  id: string;
  message: string;
  userId: string;
  userName: string;
  createdAt: Date;
  isOwn: boolean;
  edited?: boolean;
  imageUrl?: string;
}

export default function ChatComunidadeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { comunidades, isMember, isOwner } = useComunidades();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  // Contexto da comunidade
  const comunidadeId = params.id as string;
  const comunidade = comunidades.find((c) => c.id === comunidadeId);
  const comunidadeNome = comunidade?.nome || "Comunidade";
  const photoURL = (comunidade as any)?.photoURL as string | undefined;
  const userIsMember = user ? isMember(comunidadeId, user.uid) : false;
  const isAdmin = user && comunidade ? isOwner(comunidadeId, user.uid) : false;

  // Listener em tempo real (sempre declarar hooks antes de returns)
  useEffect(() => {
    if (!comunidadeId) return;
    let unsubscribe: undefined | (() => void);
    if (userIsMember) {
      const ref = collection(db, "comunidades", comunidadeId, "mensagens");
      const q = query(ref, orderBy("createdAt", "asc"));
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          const list: ChatMessage[] = [];
          snap.forEach((d) => {
            const data = d.data() as any;
            const createdAt: Date = data.createdAt?.toDate?.() || new Date();
            list.push({
              id: d.id,
              message: data.message || "",
              userId: data.userId || "",
              userName: data.userName || "Usuário",
              createdAt,
              isOwn: user ? data.userId === user.uid : false,
              edited: !!data.edited,
              imageUrl: data.imageUrl || undefined,
            });
          });
          setMessages(list);
        },
        (err) => {
          console.error("Erro ao carregar mensagens:", err);
        }
      );
    } else {
      setMessages([]);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, [comunidadeId, userIsMember, user?.uid]);

  // Auto-scroll ao final quando mensagens mudam
  useEffect(() => {
    if (!listRef.current) return;
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  // Guards após hooks para manter ordem estável
  if (!comunidade || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#E63946" />
          <Text style={styles.errorText}>Comunidade não encontrada</Text>
          <TouchableOpacity style={styles.backButton2} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!userIsMember) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#E63946" />
          <Text style={styles.errorText}>Acesso Negado</Text>
          <Text style={styles.errorSubtext}>Você precisa ser membro desta comunidade para acessar o chat</Text>
          <TouchableOpacity style={styles.backButton2} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Solicitar permissões de galeria
  async function requestGalleryPermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'É necessário permitir o acesso à galeria para enviar fotos.');
      return false;
    }
    return true;
  }

  // Solicitar permissões de câmera
  async function requestCameraPermission() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Negada', 'É necessário permitir o acesso à câmera para tirar fotos.');
      return false;
    }
    return true;
  }

  // Selecionar imagem da galeria
  async function pickImageFromGallery() {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro ao selecionar imagem', 
        visibilityTime: 2000, 
        topOffset: 50 
      });
    }
  }

  // Tirar foto com a câmera
  async function takePhoto() {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Erro ao tirar foto', 
        visibilityTime: 2000, 
        topOffset: 50 
      });
    }
  }

  // Mostrar opções de imagem
  function showImageOptions() {
    if (Platform.OS === 'web') {
      pickImageFromGallery();
      return;
    }
    Alert.alert(
      'Enviar Foto',
      'Escolha uma opção:',
      [
        { text: 'Tirar Foto', onPress: takePhoto },
        { text: 'Escolher da Galeria', onPress: pickImageFromGallery },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  }

  async function handleSend() {
    const text = message.trim();
    if (!text && !selectedImage) return;
    if (!user) return;
    try {
      setSending(true);
      if (editingMessageId) {
        const msg = messages.find((m) => m.id === editingMessageId);
        if (!msg || msg.userId !== (user?.uid || "")) {
          return;
        }
        const refDoc = doc(db, "comunidades", comunidadeId, "mensagens", editingMessageId);
        await updateDoc(refDoc, {
          message: text,
          edited: true,
          updatedAt: Timestamp.now(),
        } as any);
        setEditingMessageId(null);
        setMessage("");
        return;
      }

      let imageUrl: string | undefined = undefined;
      
      // Se tem imagem selecionada, fazer upload primeiro
      if (selectedImage) {
        setUploading(true);
        const tempId = `${Date.now()}_${user.uid}`;
        imageUrl = await uploadChatImage(selectedImage, comunidadeId, tempId) || undefined;
        setUploading(false);
        
        if (!imageUrl) {
          Toast.show({ 
            type: 'error', 
            text1: 'Erro ao enviar imagem', 
            text2: 'Tente novamente',
            visibilityTime: 2500, 
            topOffset: 50 
          });
          setSending(false);
          return;
        }
      }

      const ref = collection(db, "comunidades", comunidadeId, "mensagens");
      await addDoc(ref, {
        message: text || "",
        userId: user.uid,
        userName: (user as any)?.name || "Usuário",
        createdAt: Timestamp.now(),
        ...(imageUrl && { imageUrl }),
      });
      setMessage("");
      setSelectedImage(null);
    } catch (e) {
      console.error("Erro ao enviar mensagem:", e);
      Toast.show({ type: "error", text1: "Erro ao enviar", text2: "Tente novamente", visibilityTime: 2500, topOffset: 50 });
    } finally {
      setSending(false);
      setUploading(false);
    }
  }

  async function handleDelete(messageId: string, authorId: string) {
    if (!user) return;
    const canDelete = isAdmin || authorId === user.uid;
    if (!canDelete) return;
    if (Platform.OS === "web") {
      const ok = (globalThis as any)?.confirm?.("Excluir esta mensagem?") ?? true;
      if (!ok) return;
      try { await deleteDoc(doc(db, "comunidades", comunidadeId, "mensagens", messageId)); }
      catch { Toast.show({ type: "error", text1: "Erro ao excluir", visibilityTime: 2000, topOffset: 50 }); }
      return;
    }
    Alert.alert("Excluir mensagem", "Deseja excluir esta mensagem?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
        try { await deleteDoc(doc(db, "comunidades", comunidadeId, "mensagens", messageId)); }
        catch { Toast.show({ type: "error", text1: "Erro ao excluir", visibilityTime: 2000, topOffset: 50 }); }
      }}
    ]);
  }

  const renderMessage = ({ item }: { item: any }) => (
    <View
      style={[
        styles.messageContainer,
        item.isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!item.isOwn && <Text style={styles.userName}>{item.userName}</Text>}
      
      {/* Renderizar imagem se existir */}
      {item.imageUrl && (
        <TouchableOpacity onPress={() => setViewingImage(item.imageUrl)}>
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.messageImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
      
      {/* Renderizar texto se existir */}
      {item.message ? (
        <Text style={styles.messageText}>{item.message}</Text>
      ) : null}
      
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
          {item.edited ? " • editada" : ""}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {item.isOwn && !item.imageUrl && (
            <TouchableOpacity onPress={() => { setEditingMessageId(item.id); setMessage(item.message); }} style={{ marginRight: 12 }}>
              <Ionicons name="create-outline" size={18} color="#2E7D32" />
            </TouchableOpacity>
          )}
          {(item.isOwn || isAdmin) && (
            <TouchableOpacity onPress={() => handleDelete(item.id, item.userId)}>
              <Ionicons name="trash-outline" size={18} color="#2E7D32" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header da comunidade */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => router.push({ pathname: "/detalhes-comunidade", params: { id: comunidadeId } })}
        >
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.communityAvatar} />
          ) : (
            <View style={styles.communityAvatarPlaceholder}>
              <Ionicons name="people" size={20} color="#fff" />
            </View>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {comunidadeNome}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => router.push({ pathname: "/detalhes-comunidade", params: { id: comunidadeId } })}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Área de mensagens */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma mensagem ainda</Text>
            <Text style={styles.emptySubtext}>Seja o primeiro a enviar uma mensagem!</Text>
          </View>
        }
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input de mensagem */}
      <View style={styles.inputContainer}>
        {/* Preview da imagem selecionada */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={24} color="#E63946" />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputRow}>
          {/* Botão de adicionar imagem */}
          <TouchableOpacity
            style={styles.attachButton}
            onPress={showImageOptions}
            disabled={sending || uploading || editingMessageId !== null}
          >
            <Ionicons name="camera" size={24} color={editingMessageId ? "#ccc" : "#2E7D32"} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder={editingMessageId ? "Edite sua mensagem..." : "Digite uma mensagem..."}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            onKeyPress={(e) => {
              if (Platform.OS === 'web' && (e as any).nativeEvent.key === 'Enter' && !((e as any).shiftKey)) {
                e.preventDefault?.();
                handleSend();
              }
            }}
          />
          {editingMessageId && (
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: '#A5A5A5' }]}
              onPress={() => { setEditingMessageId(null); setMessage(""); }}
              disabled={sending}
            >
              <Ionicons name="close-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.sendButton, ((!message.trim() && !selectedImage) || sending || uploading) && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={(!message.trim() && !selectedImage) || sending || uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name={editingMessageId ? "checkmark" : "send"} size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de visualização de imagem */}
      <Modal
        visible={viewingImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewingImage(null)}
      >
        <Pressable 
          style={styles.imageViewModal}
          onPress={() => setViewingImage(null)}
        >
          <View style={styles.imageViewContainer}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setViewingImage(null)}
            >
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            {viewingImage && (
              <Image
                source={{ uri: viewingImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  communityAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },
  communityAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#E8F5E9",
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
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
  messageContainer: {
    maxWidth: "80%",
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#C8E6C9",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  userName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 11,
    color: "#666",
    alignSelf: "flex-end",
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  attachButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E63946",
    marginTop: 20,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 15,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
    lineHeight: 22,
  },
  backButton2: {
    marginTop: 30,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imageViewModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  fullImage: {
    width: "90%",
    height: "80%",
  },
});

