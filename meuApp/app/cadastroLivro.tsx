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
import { useTheme } from "../contexts/ThemeContext";

type FormState = {
  titulo: string;
  autor: string;
  genero: string;
  paginas: string;
  editora: string;
  anoLancamento: string;
  descricao: string;
};

const initialForm: FormState = {
  titulo: "",
  autor: "",
  genero: "",
  paginas: "",
  editora: "",
  anoLancamento: "",
  descricao: "",
};

export default function CadastroLivroScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { livros, carregandoLivros, adicionarLivro, atualizarLivro, removerLivro } = useLivros();
  const { colors } = useTheme();
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
    const { titulo, autor, paginas, anoLancamento } = form;

    if (!titulo.trim() || !autor.trim()) {
      showToast("error", "Campos obrigatórios", "Informe pelo menos título e autor.");
      return;
    }

    if (paginas && Number(paginas) <= 0) {
      showToast("error", "Número de páginas inválido", "Use um valor maior que zero.");
      return;
    }

    if (anoLancamento) {
      const ano = Number(anoLancamento);
      const anoAtual = new Date().getFullYear();
      if (isNaN(ano) || ano < 1000 || ano > anoAtual) {
        showToast("error", "Ano inválido", `Digite um ano entre 1000 e ${anoAtual}.`);
        return;
      }
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
    const { titulo, autor, paginas, editora, anoLancamento } = form;

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
        editora: editora.trim() || undefined,
        anoLancamento: anoLancamento ? Number(anoLancamento) : undefined,
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
      editora: livro.editora || "",
      anoLancamento: livro.anoLancamento ? String(livro.anoLancamento) : "",
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
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Cadastrar Livro</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Preencha os campos abaixo para adicionar um novo livro à sua coleção.
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Título *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Ex.: A Revolução dos Bichos"
            placeholderTextColor={colors.placeholder}
            value={form.titulo}
            onChangeText={(value) => handleChange("titulo", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Autor *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Ex.: George Orwell"
            placeholderTextColor={colors.placeholder}
            value={form.autor}
            onChangeText={(value) => handleChange("autor", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Gênero</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Fantasia, Suspense, Romance..."
            placeholderTextColor={colors.placeholder}
            value={form.genero}
            onChangeText={(value) => handleChange("genero", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Número de páginas</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Ex.: 320"
            placeholderTextColor={colors.placeholder}
            value={form.paginas}
            onChangeText={(value) => handleChange("paginas", value.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Editora</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Ex.: Companhia das Letras"
            placeholderTextColor={colors.placeholder}
            value={form.editora}
            onChangeText={(value) => handleChange("editora", value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Ano de lançamento</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Ex.: 2020"
            placeholderTextColor={colors.placeholder}
            value={form.anoLancamento}
            onChangeText={(value) => handleChange("anoLancamento", value.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Capa do livro</Text>
          <View style={styles.coverRow}>
            {capaUri ? (
              <Image source={{ uri: capaUri }} style={styles.coverPreview} />
            ) : (
              <View style={[styles.coverPreview, styles.coverPlaceholder, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Ionicons name="image-outline" size={28} color={colors.placeholder} />
                <Text style={[styles.coverPlaceholderText, { color: colors.placeholder }]}>Sem capa</Text>
              </View>
            )}
            <TouchableOpacity style={[styles.coverButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={pickImage}>
              <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
              <Text style={[styles.coverButtonText, { color: colors.primary }]}>
                {capaUri ? "Trocar capa" : "Selecionar capa"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Conte um pouco sobre o livro..."
            placeholderTextColor={colors.placeholder}
            value={form.descricao}
            onChangeText={(value) => handleChange("descricao", value)}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: submitting ? colors.border : colors.success }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Ionicons name="save-outline" size={20} color={colors.card} />
          <Text style={[styles.submitText, { color: colors.card }]}>
            {submitting ? "Salvando..." : editingId ? "Atualizar livro" : "Salvar livro"}
          </Text>
        </TouchableOpacity>

        <View style={[styles.divider, { borderBottomColor: colors.border }]} />

        <Text style={[styles.sectionListTitle, { color: colors.text }]}>Livros cadastrados</Text>
        {carregandoLivros ? (
          <View style={styles.loadingList}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingListText, { color: colors.textSecondary }]}>Carregando livros salvos...</Text>
          </View>
        ) : livros.length === 0 ? (
          <Text style={[styles.emptyListText, { color: colors.textSecondary }]}>
            Nenhum livro cadastrado ainda. Cadastre o primeiro usando o formulário acima.
          </Text>
        ) : (
          livros.map((livro) => {
            const isOwner = user?.uid === livro.ownerId;
            return (
              <View key={livro.id} style={[styles.bookCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.bookInfo}>
                  {livro.capaUri ? (
                    <Image source={{ uri: livro.capaUri }} style={styles.bookThumb} />
                  ) : (
                    <View style={[styles.bookThumb, styles.coverPlaceholder, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                      <Ionicons name="book-outline" size={20} color={colors.placeholder} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bookTitle, { color: colors.text }]}>{livro.titulo}</Text>
                    <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>{livro.autor}</Text>
                    <Text style={[styles.bookOwner, { color: colors.textSecondary }]}>
                      Cadastrado por {livro.ownerName ?? "outro leitor"}
                    </Text>
                    {(livro.genero || livro.paginas || livro.editora || livro.anoLancamento) && (
                      <Text style={[styles.bookMeta, { color: colors.textSecondary }]}>
                        {livro.genero}
                        {livro.paginas ? ` • ${livro.paginas} páginas` : ""}
                        {livro.editora ? ` • ${livro.editora}` : ""}
                        {livro.anoLancamento ? ` • ${livro.anoLancamento}` : ""}
                      </Text>
                    )}
                  </View>
                </View>
                {livro.descricao ? (
                  <Text style={[styles.bookDescription, { color: colors.textSecondary }]}>{livro.descricao}</Text>
                ) : null}

                {isOwner ? (
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.cardButton, styles.editButton, { borderColor: colors.border }]}
                      onPress={() => handleEditBook(livro)}
                    >
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                      <Text style={[styles.cardButtonText, { color: colors.primary }]}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cardButton, styles.deleteButton, { borderColor: colors.border }]}
                      onPress={() => handleDeleteBook(livro)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.primary} />
                      <Text style={[styles.cardButtonText, { color: colors.primary }]}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={[styles.readOnlyNote, { color: colors.textSecondary }]}>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 25,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
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
  },
  coverPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  coverPlaceholderText: {
    fontSize: 12,
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
  },
  coverButtonText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  submitText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 30,
  },
  sectionListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  emptyListText: {
    fontStyle: "italic",
  },
  loadingList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingListText: {
    fontSize: 13,
  },
  bookCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
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
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  bookAuthor: {
    fontSize: 14,
  },
  bookOwner: {
    fontSize: 12,
    marginTop: 2,
  },
  bookMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  bookDescription: {
    fontSize: 13,
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
  editButton: {},
  deleteButton: {},
  cardButtonText: {
    marginLeft: 6,
    fontWeight: "600",
  },
  readOnlyNote: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
