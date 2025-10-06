import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Slider from '@react-native-community/slider';

export default function ProgressoScreen() {
  const router = useRouter();
  

  const [categoriaAtiva, setCategoriaAtiva] = useState<'lendo' | 'lidos' | 'queroLer'>('lendo');
  

  const [livros, setLivros] = useState({
    lendo: [
      { 
        id: 1, 
        titulo: "O Senhor dos Anéis", 
        paginasLidas: 240, 
        totalPaginas: 400,
        imagem: "https://m.media-amazon.com/images/I/7125+5E40JL._AC_UF1000,1000_QL80_.jpg"
      },
      { 
        id: 2, 
        titulo: "1984", 
        paginasLidas: 75, 
        totalPaginas: 300,
        imagem: "https://m.media-amazon.com/images/I/819js3EQwbL._AC_UF1000,1000_QL80_.jpg"
      },
      { 
        id: 3, 
        titulo: "Dom Casmurro", 
        paginasLidas: 160, 
        totalPaginas: 200,
        imagem: "https://m.media-amazon.com/images/I/71KCQq8KjbL._AC_UF1000,1000_QL80_.jpg"
      },
    ],
    lidos: [
      { 
        id: 4, 
        titulo: "Harry Potter", 
        paginasLidas: 450, 
        totalPaginas: 450,
        imagem: "https://m.media-amazon.com/images/I/81YOuOGFCJL._AC_UF1000,1000_QL80_.jpg"
      },
      { 
        id: 5, 
        titulo: "O Pequeno Príncipe", 
        paginasLidas: 120, 
        totalPaginas: 120,
        imagem: "https://m.media-amazon.com/images/I/61P1btIal9L._AC_UF1000,1000_QL80_.jpg"
      },
      { 
        id: 6, 
        titulo: "Orgulho e Preconceito", 
        paginasLidas: 280, 
        totalPaginas: 280,
        imagem: "https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg"
      },
    ],
    queroLer: [
      { 
        id: 7, 
        titulo: "Cem Anos de Solidão", 
        paginasLidas: 0, 
        totalPaginas: 350,
        imagem: "https://m.media-amazon.com/images/I/91TvVQS7loL._AC_UF1000,1000_QL80_.jpg",
        salvo: true
      },
      { 
        id: 8, 
        titulo: "O Nome do Vento", 
        paginasLidas: 0, 
        totalPaginas: 680,
        imagem: "https://m.media-amazon.com/images/I/91dJ3j2WhUL._AC_UF1000,1000_QL80_.jpg",
        salvo: true
      },
      { 
        id: 9, 
        titulo: "Neuromancer", 
        paginasLidas: 0, 
        totalPaginas: 320,
        imagem: "https://m.media-amazon.com/images/I/51fULh2zYDL._AC_UF1000,1000_QL80_.jpg",
        salvo: false
      },
    ]
  });
 
  const atualizarPorcentagem = (id: number, porcentagem: number, categoria: 'lendo' | 'lidos' | 'queroLer') => {
    setLivros(prevLivros => ({
      ...prevLivros,
      [categoria]: prevLivros[categoria].map(livro => {
        if (livro.id === id) {
          const novasPaginas = Math.round((porcentagem / 100) * livro.totalPaginas);
          return { ...livro, paginasLidas: novasPaginas };
        }
        return livro;
      })
    }));
  };

  const atualizarPaginasNumero = (id: number, paginas: number, categoria: 'lendo' | 'lidos' | 'queroLer') => {
    setLivros(prevLivros => ({
      ...prevLivros,
      [categoria]: prevLivros[categoria].map(livro => {
        if (livro.id === id) {
          const novasPaginas = Math.max(0, Math.min(livro.totalPaginas, paginas));
          return { ...livro, paginasLidas: novasPaginas };
        }
        return livro;
      })
    }));
  };



  const moverLivroParaLidos = (id: number) => {
    setLivros(prevLivros => {
      const livroParaMover = prevLivros.lendo.find(livro => livro.id === id);
      if (livroParaMover) {
        return {
          ...prevLivros,
          lendo: prevLivros.lendo.filter(livro => livro.id !== id),
          lidos: [...prevLivros.lidos, { ...livroParaMover, paginasLidas: livroParaMover.totalPaginas }]
        };
      }
      return prevLivros;
    });
    // Mostrar automaticamente a categoria "Lidos" após mover o livro
    setCategoriaAtiva('lidos');
  };

  const alternarSalvoQueroLer = (id: number) => {
    setLivros(prevLivros => ({
      ...prevLivros,
      queroLer: prevLivros.queroLer.map(livro => {
        if (livro.id === id) {
          return { ...livro, salvo: !livro.salvo };
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
                const livroCompleto = progresso >= 100;
                
                return (
                  <View key={livro.id} style={[styles.bookProgress, livroCompleto && styles.completedReadingBook]}>
                    <View style={styles.bookHeader}>
                      <View style={styles.bookInfo}>
                        <Image source={{ uri: livro.imagem }} style={styles.bookCover} />
                        <Text style={styles.bookTitle}>{livro.titulo}</Text>
                      </View>
                    </View>
                    
                    {/* Controles de Progresso */}
                    <View style={styles.progressControls}>
                      {/* Input Direto de Páginas */}
                      <View style={styles.pageInputContainer}>
                        <Text style={styles.inputLabel}>Página atual:</Text>
                        <View style={styles.pageInputRow}>
                          <TextInput
                            style={styles.pageInput}
                            value={livro.paginasLidas.toString()}
                            onChangeText={(text) => {
                              const paginas = parseInt(text) || 0;
                              atualizarPaginasNumero(livro.id, paginas, 'lendo');
                            }}
                            keyboardType="numeric"
                            maxLength={4}
                          />
                          <Text style={styles.totalPages}>/ {livro.totalPaginas}</Text>
                        </View>
                      </View>



                      {/* Slider Visual */}
                      <View style={styles.sliderContainer}>
                        <Slider
                          style={styles.slider}
                          minimumValue={0}
                          maximumValue={livro.totalPaginas}
                          value={livro.paginasLidas}
                          onValueChange={(value) => atualizarPaginasNumero(livro.id, Math.round(value), 'lendo')}
                          minimumTrackTintColor={livroCompleto ? '#4CAF50' : '#2E7D32'}
                          maximumTrackTintColor="#E0E0E0"
                          thumbTintColor={livroCompleto ? '#4CAF50' : '#2E7D32'}
                          step={1}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressText}>
                        {livroCompleto ? 
                          "Livro concluído! " : 
                          `Página ${livro.paginasLidas} de ${livro.totalPaginas} (${Math.round(progresso)}%)`
                        }
                      </Text>
                      
                      {livroCompleto && (
                        <TouchableOpacity 
                          style={styles.moveToReadButton}
                          onPress={() => moverLivroParaLidos(livro.id)}
                        >
                          <Ionicons name="checkmark-circle" size={16} color="#fff" />
                          <Text style={styles.moveToReadButtonText}>Marcar como Lido</Text>
                        </TouchableOpacity>
                      )}
                    </View>
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
                    <View style={styles.bookInfo}>
                      <Image source={{ uri: livro.imagem }} style={styles.bookCover} />
                      <Text style={styles.bookTitle}>{livro.titulo}</Text>
                    </View>
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
                <View key={livro.id} style={[
                  styles.bookProgress, 
                  livro.salvo ? styles.wishlistBook : styles.wishlistBookUnsaved
                ]}>
                  <View style={styles.bookHeader}>
                    <View style={styles.bookInfo}>
                      <Image source={{ uri: livro.imagem }} style={styles.bookCover} />
                      <Text style={styles.bookTitle}>{livro.titulo}</Text>
                    </View>
                    <TouchableOpacity onPress={() => alternarSalvoQueroLer(livro.id)}>
                      <Ionicons 
                        name={livro.salvo ? "bookmark" : "bookmark-outline"} 
                        size={20} 
                        color={livro.salvo ? "#FF9800" : "#CCC"} 
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.wishlistInfo}>
                    <Text style={styles.progressText}>
                      {livro.totalPaginas} páginas
                    </Text>
                    <Text style={[
                      styles.wishlistStatus,
                      { color: livro.salvo ? "#FF9800" : "#999" }
                    ]}>
                      {livro.salvo ? "Na lista de desejos" : "Clique no ícone para salvar"}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
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
  bookInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bookCover: {
    width: 40,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
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
  wishlistBookUnsaved: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#CCC",
  },
  wishlistInfo: {
    gap: 4,
  },
  wishlistStatus: {
    fontSize: 11,
    fontStyle: "italic",
  },
  completedReadingBook: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  progressInfo: {
    gap: 8,
  },
  moveToReadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  moveToReadButtonText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
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

  progressControls: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  
  pageInputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  pageInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pageInput: {
    borderWidth: 2,
    borderColor: "#2E7D32",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 45,
    maxWidth: 45,
    backgroundColor: "#fff",
  },
  totalPages: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
    fontWeight: "500",
  },



  sliderContainer: {
    paddingHorizontal: 5,
  },
  slider: {
    width: "100%",
    height: 30,
  },


});
