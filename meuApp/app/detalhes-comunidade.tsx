import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useComunidades } from "../contexts/ComunidadesContext";
import { useAuth } from "../contexts/AuthContext";
import Toast from "react-native-toast-message";

export default function DetalhesComunidadeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { comunidades, isOwner } = useComunidades();

  // Buscar comunidade pelos parâmetros
  const comunidadeId = params.id as string;
  const comunidade = comunidades.find((c) => c.id === comunidadeId);

  const [editMode, setEditMode] = useState(false);
  const [nome, setNome] = useState(comunidade?.nome || "");
  const [descricao, setDescricao] = useState(comunidade?.descricao || "");
  const [loading, setLoading] = useState(false);

  if (!comunidade || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Comunidade não encontrada</Text>
      </View>
    );
  }

  const isAdmin = isOwner(comunidadeId, user.uid);

  const handleSaveChanges = async () => {
    // Implementar quando adicionar UPDATE no contexto
    Toast.show({
      type: "info",
      text1: "Em breve",
      text2: "Funcionalidade de edição será implementada em breve",
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
    setEditMode(false);
  };

  const handleLeaveCommunity = () => {
    Alert.alert(
      "Sair da comunidade",
      "Tem certeza que deseja sair desta comunidade?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            Toast.show({
              type: "info",
              text1: "Em breve",
              text2: "Funcionalidade de sair será implementada em breve",
              visibilityTime: 3000,
              autoHide: true,
              topOffset: 50,
            });
          },
        },
      ]
    );
  };

  const handleDeleteCommunity = () => {
    Alert.alert(
      "Deletar comunidade",
      "Tem certeza que deseja deletar esta comunidade? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: () => {
            Toast.show({
              type: "info",
              text1: "Em breve",
              text2: "Funcionalidade de deletar será implementada em breve",
              visibilityTime: 3000,
              autoHide: true,
              topOffset: 50,
            });
          },
        },
      ]
    );
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      "Remover membro",
      `Tem certeza que deseja remover ${memberName} da comunidade?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            Toast.show({
              type: "info",
              text1: "Em breve",
              text2: "Funcionalidade de remover membros será implementada em breve",
              visibilityTime: 3000,
              autoHide: true,
              topOffset: 50,
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Comunidade</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Informações da Comunidade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>

          {isAdmin && editMode ? (
            <>
              <Text style={styles.label}>Nome *</Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Nome da comunidade"
                maxLength={50}
              />

              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descrição da comunidade"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={300}
              />

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setNome(comunidade.nome);
                    setDescricao(comunidade.descricao);
                    setEditMode(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveChanges}
                >
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="people" size={20} color="#2E7D32" />
                <Text style={styles.infoLabel}>Nome:</Text>
                <Text style={styles.infoValue}>{comunidade.nome}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={20} color="#2E7D32" />
                <Text style={styles.infoLabel}>Descrição:</Text>
              </View>
              <Text style={styles.descriptionText}>{comunidade.descricao}</Text>

              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color="#2E7D32" />
                <Text style={styles.infoLabel}>Criador:</Text>
                <Text style={styles.infoValue}>{comunidade.ownerName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#2E7D32" />
                <Text style={styles.infoLabel}>Criada em:</Text>
                <Text style={styles.infoValue}>
                  {comunidade.createdAt.toLocaleDateString("pt-BR")}
                </Text>
              </View>

              {isAdmin && (
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() => setEditMode(true)}
                >
                  <Ionicons name="create-outline" size={24} color="#2E7D32" />
                  <Text style={styles.editIconText}>Editar informações</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Lista de Membros */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Membros ({comunidade.membros.length})
          </Text>

          {comunidade.membros.map((membroId, index) => {
            const isCurrentUser = membroId === user.uid;
            const isCommunityOwner = membroId === comunidade.ownerId;
            const memberName = isCommunityOwner
              ? comunidade.ownerName
              : isCurrentUser
              ? user.name
              : `Membro ${index + 1}`;

            return (
              <View key={membroId} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <Ionicons name="person-circle" size={40} color="#2E7D32" />
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{memberName}</Text>
                    {isCommunityOwner && (
                      <Text style={styles.adminBadge}>Administrador</Text>
                    )}
                    {isCurrentUser && !isCommunityOwner && (
                      <Text style={styles.youBadge}>Você</Text>
                    )}
                  </View>
                </View>
                {isAdmin && !isCommunityOwner && (
                  <TouchableOpacity
                    onPress={() => handleRemoveMember(membroId, memberName)}
                  >
                    <Ionicons name="close-circle" size={24} color="#E63946" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Ações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>

          {!isAdmin && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLeaveCommunity}
            >
              <Ionicons name="exit-outline" size={24} color="#E63946" />
              <Text style={[styles.actionText, { color: "#E63946" }]}>
                Sair da comunidade
              </Text>
            </TouchableOpacity>
          )}

          {isAdmin && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteCommunity}
            >
              <Ionicons name="trash-outline" size={24} color="#E63946" />
              <Text style={[styles.actionText, { color: "#E63946" }]}>
                Deletar comunidade
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  editButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
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
  saveButton: {
    backgroundColor: "#2E8B57",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  descriptionText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
    marginLeft: 28,
    lineHeight: 22,
  },
  editIconButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    gap: 8,
  },
  editIconText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  adminBadge: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
    marginTop: 2,
  },
  youBadge: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
});
