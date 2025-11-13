import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";

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
  const { bookId } = useLocalSearchParams<{ bookId?: string }>(); // Novo: pega o bookId da URL
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [livrosDisponiveis, setLivrosDisponiveis] = useState<Livro[]>([]);
  const [livrosSelecionados, setLivrosSelecionados] = useState<(number | string)[]>([]);

  useEffect(() => {
    if (user?.uid) {
      carregarLivrosDoUsuario();
    }
  }, [user]);

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

        // Se vier com bookId, pré-seleciona
        if (bookId) {
          setLivrosSelecionados([bookId]);
        }
      } else {
        setLivrosDisponiveis([]);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar seus livros.");
    } finally {
      setLoading(false);
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
      Alert.alert("Erro", "O nome da estante é obrigatório.");
      return;
    }

    const novaEstante: Estante = {
      id: Date.now().toString(),
      nome,
      descricao,
      livros: livrosSelecionados,
    };

    try {
      const docRef = doc(db, "usuarios", user!.uid);
      const docSnap = await getDoc(docRef);

      let estantesAtuais = [];
      if (docSnap.exists()) {
        const dados = docSnap.data();
        estantesAtuais = dados.estantes || [];
      }

      estantesAtuais.push(novaEstante);

      await updateDoc(docRef, {
        estantes: estantesAtuais,
      });

      Alert.alert("Sucesso", "Estante criada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a estante.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Carregando livros...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Nova Estante</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TextInput
          style={styles.input}
          placeholder="Nome da estante"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição (opcional)"
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.sectionTitle}>Selecione os livros:</Text>
        {livrosDisponiveis.length === 0 ? (
          <Text style={styles.emptyText}>Você ainda não tem livros para adicionar à estante.</Text>
        ) : (
          livrosDisponiveis.map((livro) => (
            <TouchableOpacity
              key={livro.id}
              style={[
                styles.livroItem,
                livrosSelecionados.includes(livro.id) && styles.livroSelecionado,
              ]}
              onPress={() => toggleLivro(livro.id)}
            >
              <Text style={styles.livroTitulo}>{livro.titulo}</Text>
              <Ionicons
                name={livrosSelecionados.includes(livro.id) ? "checkbox" : "square-outline"}
                size={24}
                color="#2E7D32"
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.salvarButton} onPress={salvarEstante}>
        <Text style={styles.salvarButtonText}>Salvar Estante</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginVertical: 10 },
  livroItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F1F8E9",
    borderRadius: 8,
    marginBottom: 8,
  },
  livroSelecionado: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
  },
  livroTitulo: { fontSize: 14, fontWeight: "600", color: "#333" },
  salvarButton: {
    backgroundColor: "#2E7D32",
    padding: 16,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  salvarButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
});