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

const ReaderFormScreen = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const genres = [
    'romance',
    'fantasia',
    'ficção',
    'suspense',
    'terror',
    'ação',
    'drama',
    'mistério',
    'literatura brasileira',
    'literatura estrangeira',
  ];

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = () => {
    if (!name || !age) {
      Alert.alert('Atenção', 'Preencha nome e idade!');
      return;
    }

    console.log({
      name,
      age,
      genres: selectedGenres,
      profileType: 'leitor',
    });

    Alert.alert('Sucesso!', 'Cadastro finalizado com sucesso!');
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações adicionais</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Idade"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <Text style={styles.subtitle}>Insira suas preferências de gêneros para leitura</Text>

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
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // ✅ Centraliza verticalmente
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
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
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
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  genreText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReaderFormScreen;