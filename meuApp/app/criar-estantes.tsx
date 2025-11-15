import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Toast from 'react-native-toast-message';

// Importar Firebase
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

interface Livro {
  id: number | string;
  titulo: string;
  paginasLidas: number;
  totalPaginas: number;
  imagem: string;
  salvo?: boolean;
}

interface Estante {
  id: string;
  nome: string;
  descricao?: string;
  livros: (number | string)[];
}

export default function CriarEstanteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookId?: string; editId?: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [livrosDisponiveis, setLivrosDisponiveis] = useState<Livro[]>([]);
  const [livrosSelecionados, setLivrosSelecionados] = useState<(number | string)[]>([]);

  const isEditing = !!params.editId;

  useEffect(() => {
    if (user?.uid) {
      carregarLivrosDoUsuario();
      if (isEditing) {
        carregarEstante();
      } else {
        setLoading(false);
      }
    }
  }, [user, params.editId]);

  const carregarEstante = async () => {
    if (!user?.uid || !params.editId) return;

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        const estantes = dados.estantes || [];
        const estante = estantes.find((e: any) => e.id === params.editId);

        if (estante) {
          setNome(estante.nome);
          setDescricao(estante.descricao || "");
          setLivrosSelecionados(estante.livros);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Estante não encontrada.',
            visibilityTime: 3000,
          });
          router.back();
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar a estante.',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarLivrosDoUsuario = async () => {
    if (!user?.uid) return;

    try {
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        const todosLivros = [
          ...(dados.lendo || []),
          ...(dados.lidos || []),
          ...(dados.queroLer || []),
        ];
        setLivrosDisponiveis(todosLivros);

        // Se veio de uma busca de livro, seleciona ele
        if (params.bookId && !isEditing) {
          setLivrosSelecionados([params.bookId]);
        }
      } else {
        setLivrosDisponiveis([]);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar seus livros.',
        visibilityTime: 3000,
      });
    }
  };

  const toggleLivro = (id: number | string) => {
    if (livrosSelecionados.includes(id)) {
      setLivrosSelecionados(livrosSelecionados.filter((lid) => lid !== id));
    } else {
      setLivrosSelecionados([...livrosSelecionados, id]);
    }
  };

  const salvarEstante = async () => {
    if (!nome.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O nome da estante é obrigatório.',
        visibilityTime: 3000,
      });
      return;
    }

    setSaving(true);

    try {
      const docRef = doc(db, "usuarios", user!.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dados = docSnap.data();
        let estantesAtuais = Array.isArray(dados.estantes) ? dados.estantes : [];

        if (isEditing && params.editId) {
          // Editar estante existente
          const index = estantesAtuais.findIndex((e: any) => e.id === params.editId);
          if (index === -1) {
            Toast.show({
              type: 'error',
              text1: 'Erro',
              text2: 'Estante não encontrada para edição.',
              visibilityTime: 3000,
            });
            return;
          }
          estantesAtuais[index] = {
            id: params.editId,
            nome,
            descricao,
            livros: livrosSelecionados,
          };
        } else {
          // Criar nova estante
          const novaEstante: Estante = {
            id: Date.now().toString(),
            nome,
            descricao,
            livros: livrosSelecionados,
          };
          estantesAtuais.push(novaEstante);
        }

        await updateDoc(docRef, {
          estantes: estantesAtuais,
        });

        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: isEditing ? 'Estante atualizada com sucesso!' : 'Estante criada com sucesso!',
          visibilityTime: 3000,
        });

        setTimeout(() => {
          router.back();
        }, 1000);
      }
    } catch (error) {
      console.error('Erro completo ao salvar estante:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar a estante.',
        visibilityTime: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Editar Estante" : "Criar Nova Estante"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Campo Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da estante *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Clássicos da Literatura"
              value={nome}
              onChangeText={setNome}
              placeholderTextColor="#bbb"
              maxLength={50}
            />
            <Text style={styles.charCount}>{nome.length}/50</Text>
          </View>

          {/* Campo Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva sua estante..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
              placeholderTextColor="#bbb"
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{descricao.length}/200</Text>
          </View>

          {/* Seleção de Livros */}
          <Text style={styles.sectionTitle}>Selecione os livros:</Text>
          {livrosDisponiveis.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Você ainda não tem livros para adicionar à estante.</Text>
            </View>
          ) : (
            <View style={styles.livrosContainer}>
              {livrosDisponiveis.map((livro) => (
                <TouchableOpacity
                  key={livro.id}
                  style={[
                    styles.livroItem,
                    livrosSelecionados.includes(livro.id) && styles.livroSelecionado,
                  ]}
                  onPress={() => toggleLivro(livro.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.livroContent}>
                    <Text style={styles.livroTitulo} numberOfLines={2}>
                      {livro.titulo}
                    </Text>
                  </View>
                  <Ionicons
                    name={livrosSelecionados.includes(livro.id) ? "checkbox" : "square-outline"}
                    size={24}
                    color="#2E7D32"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Info Badge */}
          <View style={styles.infoBadge}>
            <Ionicons name="information-circle" size={20} color="#2E7D32" />
            <Text style={styles.infoText}>
              {livrosSelecionados.length} livro{livrosSelecionados.length !== 1 ? 's' : ''} selecionado{livrosSelecionados.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.salvarButton, saving && styles.buttonDisabled]}
          onPress={salvarEstante}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.salvarButtonText}>
              {isEditing ? "Atualizar" : "Criar"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#2E7D32" 
  },
  scrollContent: {
    paddingBottom: 100,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    textAlign: "right",
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#333", 
    marginBottom: 12,
    marginTop: 8,
  },
  livrosContainer: {
    marginBottom: 16,
  },
  livroItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F1F8E9",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  livroSelecionado: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  livroContent: {
    flex: 1,
  },
  livroTitulo: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#333" 
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 12,
    fontSize: 14,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  salvarButton: {
    backgroundColor: '#2E7D32',
  },
  salvarButtonText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '700' 
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});