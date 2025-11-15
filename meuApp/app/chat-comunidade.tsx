import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useComunidades } from "../contexts/ComunidadesContext";
import { useAuth } from "../contexts/AuthContext";
import {
  useCommunityMessages,
  CommunityMessage,
} from "../contexts/CommunityMessagesContext";
import Toast from "react-native-toast-message";

interface ChatMessage extends CommunityMessage {
  isOwn: boolean;
}

export default function ChatComunidadeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { comunidades, isMember, isOwner } = useComunidades();
  const { user } = useAuth();
  const {
    getMessages,
    startListening,
    stopListening,
    sendMessage: sendCommunityMessage,
    updateMessage: updateCommunityMessage,
    deleteMessage: deleteCommunityMessage,
  } = useCommunityMessages();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const comunidadeId = params.id as string;
  const comunidade = comunidades.find((c) => c.id === comunidadeId);
  const comunidadeNome = comunidade?.nome || "Comunidade";
  const photoURL = (comunidade as any)?.photoURL as string | undefined;
  const userIsMember = user ? isMember(comunidadeId, user.uid) : false;
  const isAdmin = user && comunidade ? isOwner(comunidadeId, user.uid) : false;

  const rawMessages = comunidadeId ? getMessages(comunidadeId) : [];
  const messages = useMemo<ChatMessage[]>(
    () =>
      rawMessages.map((msg) => ({
        ...msg,
        isOwn: user ? msg.userId === user.uid : false,
      })),
    [rawMessages, user?.uid]
  );

  useEffect(() => {
    if (!comunidadeId) return;
    if (!userIsMember) {
      stopListening(comunidadeId);
      return;
    }
    startListening(comunidadeId);
    return () => {
      stopListening(comunidadeId);
    };
  }, [comunidadeId, userIsMember, startListening, stopListening]);

  useEffect(() => {
    if (!listRef.current) return;
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  useEffect(() => {
    if (!editingMessage) {
      return;
    }
    const stillExists = messages.some((msg) => msg.id === editingMessage.id);
    if (!stillExists) {
      setEditingMessage(null);
      setMessage("");
    }
  }, [messages, editingMessage]);

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

  function handleEditStart(item: ChatMessage) {
    setEditingMessage(item);
    setMessage(item.message);
  }

  function handleCancelEdit() {
    setEditingMessage(null);
    setMessage("");
  }

  async function handleSend() {
    const text = message.trim();
    if (!text || !user || !comunidadeId) return;
    try {
      setSending(true);
      if (editingMessage) {
        const result = await updateCommunityMessage(comunidadeId, editingMessage.id, text);
        if (!result.success) {
          Toast.show({
            type: "error",
            text1: "Erro ao editar",
            text2: result.error || "Tente novamente",
            visibilityTime: 2500,
            topOffset: 50,
          });
        } else {
          setEditingMessage(null);
          setMessage("");
        }
      } else {
        const result = await sendCommunityMessage(comunidadeId, text);
        if (!result.success) {
          Toast.show({
            type: "error",
            text1: "Erro ao enviar",
            text2: result.error || "Tente novamente",
            visibilityTime: 2500,
            topOffset: 50,
          });
        } else {
          setMessage("");
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao enviar",
        text2: "Tente novamente",
        visibilityTime: 2500,
        topOffset: 50,
      });
    } finally {
      setSending(false);
    }
  }

  async function deleteMessageById(messageId: string) {
    if (!comunidadeId) return;
    const result = await deleteCommunityMessage(comunidadeId, messageId);
    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Erro ao excluir",
        text2: result.error || "Tente novamente",
        visibilityTime: 2000,
        topOffset: 50,
      });
      return;
    }
    if (editingMessage?.id === messageId) {
      handleCancelEdit();
    }
  }

  async function handleDelete(messageId: string, authorId: string) {
    if (!user) return;
    const canDelete = isAdmin || authorId === user.uid;
    if (!canDelete) return;

    if (Platform.OS === "web") {
      const ok = (globalThis as any)?.confirm?.("Excluir esta mensagem?") ?? true;
      if (ok) {
        await deleteMessageById(messageId);
      }
      return;
    }

    Alert.alert("Excluir mensagem", "Deseja excluir esta mensagem?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          deleteMessageById(messageId);
        },
      },
    ]);
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!item.isOwn && <Text style={styles.userName}>{item.userName}</Text>}
      <Text style={styles.messageText}>{item.message}</Text>
      <View style={styles.messageFooter}>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
        </Text>
        {(item.isOwn || isAdmin) && (
          <View style={styles.messageActions}>
            {item.isOwn && (
              <TouchableOpacity
                onPress={() => handleEditStart(item)}
                style={styles.actionButton}
              >
                <Ionicons name="create-outline" size={18} color="#2E7D32" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleDelete(item.id, item.userId)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={18} color="#E63946" />
            </TouchableOpacity>
          </View>
        )}
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
      <View style={styles.inputWrapper}>
        {editingMessage && (
          <View style={styles.editIndicator}>
            <Text style={styles.editIndicatorText}>Editando mensagem</Text>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Text style={styles.editCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            onKeyPress={(e) => {
              if (Platform.OS === "web" && (e as any).nativeEvent.key === "Enter" && !(e as any).shiftKey) {
                e.preventDefault?.();
                handleSend();
              }
            }}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!message.trim() || sending) && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!message.trim() || sending}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
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
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 12,
  },
  timestamp: {
    fontSize: 11,
    color: "#666",
    alignSelf: "flex-end",
  },
  messageActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  inputWrapper: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  editIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF3E0",
    borderBottomWidth: 1,
    borderBottomColor: "#FFE0B2",
  },
  editIndicatorText: {
    color: "#BF360C",
    fontWeight: "600",
  },
  editCancelText: {
    color: "#E53935",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
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
});

