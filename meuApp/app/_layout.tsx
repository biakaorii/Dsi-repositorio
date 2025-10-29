// app/_layout.tsx
import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { Dimensions } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { ReviewsProvider } from '../contexts/ReviewsContext';
import { ComunidadesProvider } from '../contexts/ComunidadesContext';

const { height } = Dimensions.get('window');

export default function Layout() {
  return (
    <AuthProvider>
      <ReviewsProvider>
        <ComunidadesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="home" />
            <Stack.Screen name="cadastro" />
            <Stack.Screen name="recuperar_senha" />
            <Stack.Screen name="usuario" />
            <Stack.Screen name="search"/>
            <Stack.Screen name="select-profile"/>
            <Stack.Screen name="reader-form"/>
            <Stack.Screen name="entrepreneur-form"/>
            <Stack.Screen name="editarPerfil"/>
            <Stack.Screen name="progresso"/>
            <Stack.Screen name="book-details"/>
            <Stack.Screen name="detalhe_livro"/>
            <Stack.Screen name="comunidades"/>
            <Stack.Screen name="criar-comunidade"/>
            <Stack.Screen name="chat-comunidade"/>
          </Stack>
          <Toast topOffset={height / 2 - 60} />
        </ComunidadesProvider>
      </ReviewsProvider>
    </AuthProvider>
  );
}