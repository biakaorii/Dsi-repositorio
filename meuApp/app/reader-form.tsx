// app/reader-form.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext'; // ✅ Caminho correto

const ReaderFormScreen = () => {
  const router = useRouter();
  const { updateUser, user } = useAuth(); // ✅ Pega updateUser e user

  const [readingGoal, setReadingGoal] = useState('');
  const [age, setAge] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const genres = [
    'Romance',
    'Fantasia',
    'Ficção',
    'Suspense',
    'Terror',
    'Aventura',
    'Drama',
    'Mistério',
    'Literatura brasileira',
    'Literatura estrangeira',
    'Religião e espiritualidade',
  ];

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = async () => {
    if (!readingGoal || !age) {
      Alert.alert('Atenção', 'Preencha seu objetivo de leitura e idade!');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    // ✅ Dados a serem salvos
    const dataToSave = {
      readingGoal,
      age,
      genres: selectedGenres, // ← array de strings
      profileType: 'leitor' as const,
    };

    try {
      const result = await updateUser(dataToSave); // ✅ Chama updateUser

      if (result.success) {
        Alert.alert('Sucesso!', 'Seu perfil foi atualizado!');
        router.replace('/home');
      } else {
        Alert.alert('Erro', result.error || 'Falha ao salvar.');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      Alert.alert('Erro', 'Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações adicionais</Text>

      <TextInput
        style={styles.input}
        placeholder="Qual seu objetivo com a leitura?"
        value={readingGoal}
        onChangeText={setReadingGoal}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
      />

      <TextInput
        style={styles.input}
        placeholder="Idade"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <Text style={styles.subtitle}>Seus gêneros favoritos</Text>

      <View style={styles.genresContainer}>
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.genreChip,
              selectedGenres.includes(genre) && styles.selectedGenre,
            ]}
            onPress={() => toggleGenre(genre)}
          >
            <Text
              style={[
                styles.genreText,
                selectedGenres.includes(genre) && styles.selectedText,
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Salvar Perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centraliza verticalmente
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 15,
  },
  genreChip: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedGenre: {
    backgroundColor: '#2E8B57',
    borderColor: '#2E8B57',
  },
  genreText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  button: {
    width: 312,
    height: 45,
    alignSelf: 'center',
    backgroundColor: "#2E8B57",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReaderFormScreen;