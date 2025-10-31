import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useComunidades } from "../contexts/ComunidadesContext";
import { useAuth } from "../contexts/AuthContext";

export default function ChatComunidadeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { comunidades, isMember } = useComunidades();
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  // Pegando o ID dos parâmetros e buscando os dados atualizados do contexto
  const comunidadeId = params.id as string;
  const comunidade = comunidades.find((c) => c.id === comunidadeId);
  const comunidadeNome = comunidade?.nome || "Comunidade";

  // Verificar se o usuário é membro
  if (!comunidade || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#E63946" />
          <Text style={styles.errorText}>Comunidade não encontrada</Text>
          <TouchableOpacity
            style={styles.backButton2}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isMember(comunidadeId, user.uid)) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#E63946" />
          <Text style={styles.errorText}>Acesso Negado</Text>
          <Text style={styles.errorSubtext}>
            Você precisa ser membro desta comunidade para acessar o chat
          </Text>
          <TouchableOpacity
            style={styles.backButton2}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderMessage = ({ item }: { item: any }) => (
    <View
      style={[
        styles.messageContainer,
        item.isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!item.isOwn && <Text style={styles.userName}>{item.userName}</Text>}
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
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
          onPress={() => router.push({
            pathname: "/detalhes-comunidade",
            params: { id: comunidadeId }
          })}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {comunidadeNome}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => router.push({
            pathname: "/detalhes-comunidade",
            params: { id: comunidadeId }
          })}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Área de mensagens */}
      <FlatList
        data={[]}
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
      />

      {/* Input de mensagem */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle" size={28} color="#2E7D32" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
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
  timestamp: {
    fontSize: 11,
    color: "#666",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  attachButton: {
    marginRight: 8,
    marginBottom: 8,
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
