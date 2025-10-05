import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProgressoScreen() {
  const router = useRouter();
  

  const [categoriaAtiva, setCategoriaAtiva] = useState<'lendo' | 'lidos' | 'queroLer'>('lendo');
  

  const [livros, setLivros] = useState({
    lendo: [
      { id: 1, titulo: "O Senhor dos Anéis", paginasLidas: 240, totalPaginas: 400 },
      { id: 2, titulo: "1984", paginasLidas: 75, totalPaginas: 300 },
      { id: 3, titulo: "Dom Casmurro", paginasLidas: 160, totalPaginas: 200 },
    ],
    lidos: [
      { id: 4, titulo: "Harry Potter", paginasLidas: 450, totalPaginas: 450 },
      { id: 5, titulo: "O Pequeno Príncipe", paginasLidas: 120, totalPaginas: 120 },
      { id: 6, titulo: "Orgulho e Preconceito", paginasLidas: 280, totalPaginas: 280 },
    ],
    queroLer: [
      { id: 7, titulo: "Cem Anos de Solidão", paginasLidas: 0, totalPaginas: 350 },
      { id: 8, titulo: "O Nome do Vento", paginasLidas: 0, totalPaginas: 680 },
      { id: 9, titulo: "Neuromancer", paginasLidas: 0, totalPaginas: 320 },
    ]
  });
 
  const atualizarPaginas = (id: number, incremento: number, categoria: 'lendo' | 'lidos' | 'queroLer') => {
    setLivros(prevLivros => ({
      ...prevLivros,
      [categoria]: prevLivros[categoria].map(livro => {
        if (livro.id === id) {
          const novasPaginas = Math.max(0, Math.min(livro.totalPaginas, livro.paginasLidas + incremento));
          return { ...livro, paginasLidas: novasPaginas };
        }
        return livro;
      })
    }));
  };

  return (
    <View style={styles.container}>
    
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acompanhar Progresso</Text>
        <View style={{ width: 24 }} />
      </View>

    
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Resumo de Leitura</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{livros.lidos.length}</Text>
            <Text style={styles.summaryLabel}>Livros Lidos</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{livros.lendo.length}</Text>
            <Text style={styles.summaryLabel}>Lendo</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{livros.queroLer.length}</Text>
            <Text style={styles.summaryLabel}>Quero Ler</Text>
          </View>
        </View>
      </View>

     
      <View style={styles.categoryButtons}>
        <TouchableOpacity 
          style={[styles.categoryButton, categoriaAtiva === 'lendo' && styles.categoryButtonActive]}
          onPress={() => setCategoriaAtiva('lendo')}
        >
          <Text style={[styles.categoryButtonText, categoriaAtiva === 'lendo' && styles.categoryButtonTextActive]}>
            Lendo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.categoryButton, categoriaAtiva === 'lidos' && styles.categoryButtonActive]}
          onPress={() => setCategoriaAtiva('lidos')}
        >
          <Text style={[styles.categoryButtonText, categoriaAtiva === 'lidos' && styles.categoryButtonTextActive]}>
            Lidos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.categoryButton, categoriaAtiva === 'queroLer' && styles.categoryButtonActive]}
          onPress={() => setCategoriaAtiva('queroLer')}
        >
          <Text style={[styles.categoryButtonText, categoriaAtiva === 'queroLer' && styles.categoryButtonTextActive]}>
            Quero Ler
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
      
        <View style={styles.section}>
          {categoriaAtiva === 'lendo' && (
            <>
              {livros.lendo.map((livro) => {
                const progresso = (livro.paginasLidas / livro.totalPaginas) * 100;
                return (
                  <View key={livro.id} style={styles.bookProgress}>
                    <View style={styles.bookHeader}>
                      <Text style={styles.bookTitle}>{livro.titulo}</Text>
                      <View style={styles.pageControls}>
                        <TouchableOpacity 
                          style={styles.controlButton}
                          onPress={() => atualizarPaginas(livro.id, -5, 'lendo')}
                        >
                          <Ionicons name="remove" size={16} color="#2E7D32" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.controlButton}
                          onPress={() => atualizarPaginas(livro.id, 5, 'lendo')}
                        >
                          <Ionicons name="add" size={16} color="#2E7D32" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progresso}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      Página {livro.paginasLidas} de {livro.totalPaginas} ({Math.round(progresso)}%)
                    </Text>
                  </View>
                );
              })}
            </>
          )}

          {categoriaAtiva === 'lidos' && (
            <>
              {livros.lidos.map((livro) => (
                <View key={livro.id} style={[styles.bookProgress, styles.completedBook]}>
                  <View style={styles.bookHeader}>
                    <Text style={styles.bookTitle}>{livro.titulo}</Text>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '100%', backgroundColor: '#4CAF50' }]} />
                  </View>
                  <Text style={styles.progressText}>Concluído!</Text>
                </View>
              ))}
            </>
          )}

          {categoriaAtiva === 'queroLer' && (
            <>
              {livros.queroLer.map((livro) => (
                <View key={livro.id} style={[styles.bookProgress, styles.wishlistBook]}>
                  <View style={styles.bookHeader}>
                    <Text style={styles.bookTitle}>{livro.titulo}</Text>
                    <Ionicons name="bookmark-outline" size={20} color="#FF9800" />
                  </View>
                  <Text style={styles.progressText}>{livro.totalPaginas} páginas</Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meta Anual</Text>
          <View style={styles.goalContainer}>
            <Text style={styles.goalText}>12 de 15 livros lidos</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
            <Text style={styles.progressText}>80% da meta atingida!</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Este Mês</Text>
          <View style={styles.monthlyStats}>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={20} color="#2E7D32" />
              <Text style={styles.statText}>2 livros finalizados</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#2E7D32" />
              <Text style={styles.statText}>45 horas de leitura</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },

  summaryContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
  },
  summaryTitle: { fontSize: 18, fontWeight: "bold", color: "#2E7D32", marginBottom: 15 },
  summaryStats: { flexDirection: "row", justifyContent: "space-around" },
  summaryCard: { alignItems: "center" },
  summaryNumber: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },
  summaryLabel: { fontSize: 11, color: "#666", textAlign: "center" },

  section: { margin: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 15 },

  bookProgress: {
    backgroundColor: "#F1F8E9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bookTitle: { fontSize: 14, fontWeight: "600", color: "#333", flex: 1 },
  pageControls: {
    flexDirection: "row",
    gap: 8,
  },
  controlButton: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  completedBook: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  wishlistBook: {
    backgroundColor: "#FFF8E1",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },

  categoryButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryButtonActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 4,
  },
  progressText: { fontSize: 12, color: "#666" },

  goalContainer: {
    backgroundColor: "#F1F8E9",
    padding: 15,
    borderRadius: 10,
  },
  goalText: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 10 },

  monthlyStats: { gap: 12 },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8E9",
    padding: 12,
    borderRadius: 8,
  },
  statText: { marginLeft: 10, fontSize: 14, color: "#333" },
});
