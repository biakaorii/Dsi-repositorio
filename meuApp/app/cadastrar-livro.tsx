import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export default function CadastrarLivroScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [generos, setGeneros] = useState(''); // separado por vírgula
  const [idioma, setIdioma] = useState('');
  const [paginas, setPaginas] = useState('');
  const [ano, setAno] = useState('');
  const [editora, setEditora] = useState('');
  const [descricao, setDescricao] = useState('');
  const [capaUrl, setCapaUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSalvar() {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Faça login para cadastrar', visibilityTime: 2000, topOffset: 50 });
      return;
    }

    const t = titulo.trim();
    const a = autor.trim();
    const gens = generos.split(',').map((g) => g.trim()).filter(Boolean);
    if (!t) { Toast.show({ type: 'error', text1: 'Título é obrigatório', topOffset: 50 }); return; }
    if (!a) { Toast.show({ type: 'error', text1: 'Autor é obrigatório', topOffset: 50 }); return; }
    if (gens.length === 0) { Toast.show({ type: 'error', text1: 'Informe ao menos um gênero', topOffset: 50 }); return; }

    const p = paginas ? Math.max(1, Number(paginas)) : undefined;
    const y = ano ? Number(ano) : undefined;

    try {
      setLoading(true);
      await addDoc(collection(db, 'livros'), {
        titulo: t,
        autor: a,
        generos: gens,
        idioma: idioma || undefined,
        paginas: p,
        ano: y,
        editora: editora || undefined,
        descricao: descricao || undefined,
        capaUrl: capaUrl || undefined,
        ownerId: user.uid,
        ownerName: (user as any)?.name || '',
        createdAt: Timestamp.now(),
        ativo: true,
        leram: 0, avaliacao: 0, resenha: 0, lendo: 0, abandonos: 0,
      });
      Toast.show({ type: 'success', text1: 'Livro cadastrado', visibilityTime: 1800, topOffset: 50 });
      try { router.back(); } catch {}
    } catch (e) {
      console.error('Erro ao cadastrar livro', e);
      Toast.show({ type: 'error', text1: 'Erro ao cadastrar', visibilityTime: 2200, topOffset: 50 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} disabled={loading}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cadastrar Livro</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Título *</Text>
          <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Título do livro" />

          <Text style={styles.label}>Autor *</Text>
          <TextInput style={styles.input} value={autor} onChangeText={setAutor} placeholder="Autor" />

          <Text style={styles.label}>Gêneros (separe por vírgula) *</Text>
          <TextInput style={styles.input} value={generos} onChangeText={setGeneros} placeholder="Ex.: Fantasia, Aventura" />

          <Text style={styles.label}>Idioma</Text>
          <TextInput style={styles.input} value={idioma} onChangeText={setIdioma} placeholder="Ex.: Português" />

          <Text style={styles.label}>Páginas</Text>
          <TextInput style={styles.input} value={paginas} onChangeText={setPaginas} placeholder="Ex.: 350" keyboardType="numeric" />

          <Text style={styles.label}>Ano</Text>
          <TextInput style={styles.input} value={ano} onChangeText={setAno} placeholder="Ex.: 2022" keyboardType="numeric" />

          <Text style={styles.label}>Editora</Text>
          <TextInput style={styles.input} value={editora} onChangeText={setEditora} placeholder="Editora" />

          <Text style={styles.label}>Descrição</Text>
          <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} placeholder="Descrição" multiline numberOfLines={4} />

          <Text style={styles.label}>URL da Capa</Text>
          <TextInput style={styles.input} value={capaUrl} onChangeText={setCapaUrl} placeholder="https://..." />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={() => router.back()} disabled={loading}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.save]} onPress={handleSalvar} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#E9ECEF' },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#2E7D32', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancel: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF' },
  cancelText: { color: '#666', fontSize: 16, fontWeight: '600' },
  save: { backgroundColor: '#2E7D32' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

