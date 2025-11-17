// app/cadastroLivro.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { useLivros, Livro as LivroModel } from "@/contexts/LivrosContext";

type FormState = {
  titulo: string;
  autor: string;
  genero: string;
  paginas: string;
  descricao: string;
};

const initialForm: FormState = {
  titulo: "",
  autor: "",
  genero: "",
  paginas: "",
  descricao: "",
};

export default function CadastroLivroScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { livros, carregandoLivros, adicionarLivro, atualizarLivro, removerLivro } = useLivros();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [capaUri, setCapaUri] = useState<string | undefined>(undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const showToast = (type: "success" | "error", text1: string, text2?: string) => {
    Toast.show({
      type,
      text1,
      text2,
      visibilityTime: 2500,
      autoHide: true,
      topOffset: 60,
    });
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast("error", "Permissão negada", "Autorize o acesso às fotos para escolher a capa.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setCapaUri(result.assets[0]?.uri);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setCapaUri(undefined);
    setEditingId(null);
  };

  // Verificar se já existe livro similar (título + autor)
  const checkDuplicateBook = (titulo: string, autor: string): LivroModel | null => {
    const tituloNorm = titulo.trim().toLowerCase();
    const autorNorm = autor.trim().toLowerCase();

    const duplicate = livros.find(
      (livro) =>
        livro.titulo.toLowerCase() === tituloNorm &&
        livro.autor.toLowerCase() === autorNorm
    );

    return duplicate || null;
  };

  const handleSubmit = async () => {
    const { titulo, autor, paginas } = form;

    if (!titulo.trim() || !autor.trim()) {
      showToast("error", "Campos obrigatórios", "Informe pelo menos título e autor.");
      return;
    }

    if (paginas && Number(paginas) <= 0) {
      showToast("error", "Número de páginas inválido", "Use um valor maior que zero.");
      return;
    }

    if (!user) {
      showToast("error", "Sessão expirada", "Faça login novamente para cadastrar livros.");
      return;
    }

    const existing = editingId ? livros.find((livro) => livro.id === editingId) : null;
    if (editingId && !existing) {
      showToast("error", "Livro não encontrado", "Recarregue a lista e tente novamente.");
      resetForm();
      return;
    }

    if (editingId && existing && existing.ownerId !== user.uid) {
      showToast("error", "Sem permissão", "Apenas quem cadastrou pode editar este livro.");
      return;
    }

    // Validação anti-duplicatas (apenas para novo cadastro, não para edição)
    if (!editingId) {
      const duplicate = checkDuplicateBook(titulo, autor);
      if (duplicate) {
        Alert.alert(
          "Livro duplicado",
          `Você já tem "${duplicate.titulo}" de ${duplicate.autor} cadastrado. Deseja criar uma cópia mesmo assim?`,
          [
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () => {
                showToast("info", "Cadastro cancelado", "Nenhuma alteração foi feita.");
              },
            },
            {
              text: "Criar cópia",
              onPress: () => saveBook(),
            },
          ]
        );
        return;
      }
    }

    saveBook();
  };

  const saveBook = async () => {
    const { titulo, autor, paginas } = form;

    if (!user) return;

    const existing = editingId ? livros.find((livro) => livro.id === editingId) : null;

    try {
      setSubmitting(true);
      const timestamp = new Date().toISOString();
      const payload: LivroModel = {
        id: editingId ?? Date.now().toString(),
        titulo: titulo.trim(),
        autor: autor.trim(),
        genero: form.genero.trim() || undefined,
        paginas: paginas ? Number(paginas) : undefined,
        capaUri,
        descricao: form.descricao.trim() || undefined,
        ownerId: user.uid,
        ownerName: user.name,
        createdAt: editingId && existing ? existing.createdAt : timestamp,
        updatedAt: timestamp,
      };

      if (editingId) {
        await atualizarLivro(payload);
      } else {
        await adicionarLivro(payload);
      }

      showToast(
        "success",
        editingId ? "Livro atualizado!" : "Livro cadastrado!",
        "Agora ele aparece na lista abaixo."
      );
      resetForm();
    } catch (error) {
      console.error("Erro ao cadastrar livro:", error);
      showToast("error", "Ops!", "Não conseguimos salvar o livro. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBook = (livro: LivroModel) => {
    setForm({
      titulo: livro.titulo,
      autor: livro.autor,
      genero: livro.genero || "",
      paginas: livro.paginas ? String(livro.paginas) : "",
      descricao: livro.descricao || "",
    });
    setCapaUri(livro.capaUri);
    setEditingId(livro.id);
  };

  const deleteBook = async (livro: LivroModel) => {
    if (!user) {
      showToast("error", "Sessão expirada", "Faça login novamente para remover livros.");
      return;
    }

    if (livro.ownerId !== user.uid) {
      showToast("error", "Sem permissão", "Você não pode remover livros cadastrados por outra pessoa.");
      return;
    }

    try {
      await removerLivro(livro.id);
      if (editingId === livro.id) {
        resetForm();
      }
      showToast("success", "Livro removido", "Ele não aparece mais na lista.");
    } catch (error) {
      console.error("Erro ao remover livro:", error);
      showToast("error", "Erro", "Não conseguimos remover este livro agora.");
    }
  };

  const handleDeleteBook = (livro: LivroModel) => {
    Alert.alert(
      "Remover livro",
      `Deseja realmente remover "${livro.titulo}" dos livros cadastrados?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => deleteBook(livro),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cadastrar Livro</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={styles.sectionSubtitle}>
          Preencha os campos abaixo para adicionar um novo livro à sua coleção.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: A Revolução dos Bichos"
            value={form.titulo}
            onChangeText={(value) => handleChange("titulo", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Autor *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: George Orwell"
            value={form.autor}
            onChangeText={(value) => handleChange("autor", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Gênero</Text>
          <TextInput
            style={styles.input}
            placeholder="Fantasia, Suspense, Romance..."
            value={form.genero}
            onChangeText={(value) => handleChange("genero", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Número de páginas</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: 320"
            value={form.paginas}
            onChangeText={(value) => handleChange("paginas", value.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Capa do livro</Text>
          <View style={styles.coverRow}>
            {capaUri ? (
              <Image source={{ uri: capaUri }} style={styles.coverPreview} />
            ) : (
              <View style={[styles.coverPreview, styles.coverPlaceholder]}>
                <Ionicons name="image-outline" size={28} color="#999" />
                <Text style={styles.coverPlaceholderText}>Sem capa</Text>
              </View>
            )}
            <TouchableOpacity style={styles.coverButton} onPress={pickImage}>
              <Ionicons name="cloud-upload-outline" size={18} color="#2E7D32" />
              <Text style={styles.coverButtonText}>
                {capaUri ? "Trocar capa" : "Selecionar capa"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conte um pouco sobre o livro..."
            value={form.descricao}
            onChangeText={(value) => handleChange("descricao", value)}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.submitText}>
            {submitting ? "Salvando..." : editingId ? "Atualizar livro" : "Salvar livro"}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionListTitle}>Livros cadastrados</Text>
        {carregandoLivros ? (
          <View style={styles.loadingList}>
            <ActivityIndicator size="small" color="#2E7D32" />
            <Text style={styles.loadingListText}>Carregando livros salvos...</Text>
          </View>
        ) : livros.length === 0 ? (
          <Text style={styles.emptyListText}>
            Nenhum livro cadastrado ainda. Cadastre o primeiro usando o formulário acima.
          </Text>
        ) : (
          livros.map((livro) => {
            const isOwner = user?.uid === livro.ownerId;
            return (
              <View key={livro.id} style={styles.bookCard}>
                <View style={styles.bookInfo}>
                  {livro.capaUri ? (
                    <Image source={{ uri: livro.capaUri }} style={styles.bookThumb} />
                  ) : (
                    <View style={[styles.bookThumb, styles.coverPlaceholder]}>
                      <Ionicons name="book-outline" size={20} color="#999" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookTitle}>{livro.titulo}</Text>
                    <Text style={styles.bookAuthor}>{livro.autor}</Text>
                    <Text style={styles.bookOwner}>
                      Cadastrado por {livro.ownerName ?? "outro leitor"}
                    </Text>
                    {livro.genero && (
                      <Text style={styles.bookMeta}>
                        {livro.genero}
                        {livro.paginas ? ` • ${livro.paginas} páginas` : ""}
                      </Text>
                    )}
                  </View>
                </View>
                {livro.descricao ? (
                  <Text style={styles.bookDescription}>{livro.descricao}</Text>
                ) : null}

                {isOwner ? (
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.cardButton, styles.editButton]}
                      onPress={() => handleEditBook(livro)}
                    >
                      <Ionicons name="create-outline" size={18} color="#2E7D32" />
                      <Text style={styles.cardButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cardButton, styles.deleteButton]}
                      onPress={() => handleDeleteBook(livro)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#2E7D32" />
                      <Text style={styles.cardButtonText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.readOnlyNote}>
                    Apenas quem cadastrou pode editar ou remover este livro.
                  </Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: "#2E7D32",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DCE5DD",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#F9FBF9",
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  coverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  coverPreview: {
    width: 80,
    height: 110,
    borderRadius: 8,
    backgroundColor: "#F1F1F1",
  },
  coverPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  coverPlaceholderText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  coverButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    backgroundColor: "#F5FBF5",
  },
  coverButtonText: {
    marginLeft: 8,
    color: "#2E7D32",
    fontWeight: "600",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  submitText: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 30,
  },
  sectionListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
  },
  emptyListText: {
    color: "#666",
    fontStyle: "italic",
  },
  loadingList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingListText: {
    color: "#666",
    fontSize: 13,
  },
  bookCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#FAFFFA",
  },
  bookInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  bookThumb: {
    width: 60,
    height: 80,
    borderRadius: 6,
    backgroundColor: "#EDEDED",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#666",
  },
  bookOwner: {
    fontSize: 12,
    color: "#2E7D32",
    marginTop: 2,
  },
  bookMeta: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  bookDescription: {
    fontSize: 13,
    color: "#555",
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cardButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  editButton: {
    borderColor: "#C8E6C9",
    backgroundColor: "#F5FBF5",
  },
  deleteButton: {
    borderColor: "#F8D7DA",
    backgroundColor: "#FFF5F5",
  },
  cardButtonText: {
    marginLeft: 6,
    color: "#2E7D32",
    fontWeight: "600",
  },
  readOnlyNote: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});
