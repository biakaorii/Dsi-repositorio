// app/_layout.tsx
import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { Dimensions } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { ReviewsProvider } from '../contexts/ReviewsContext';
import { ComunidadesProvider } from '../contexts/ComunidadesContext';
import { CommunityMessagesProvider } from '../contexts/CommunityMessagesContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';

const { height } = Dimensions.get('window');

export default function Layout() {
  return (
    <AuthProvider>
      <ReviewsProvider>
        <ComunidadesProvider>
          <CommunityMessagesProvider>
            <FavoritesProvider>
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
                <Stack.Screen name="comunidades"/>
                <Stack.Screen name="criar-comunidade"/>
                <Stack.Screen name="chat-comunidade"/>
                <Stack.Screen name="detalhes-comunidade"/>
                <Stack.Screen name="perfil-usuario"/>
                <Stack.Screen name="favoritos"/>
              </Stack>
              <Toast topOffset={height / 2 - 60} />
            </FavoritesProvider>
          </CommunityMessagesProvider>
        </ComunidadesProvider>
      </ReviewsProvider>
    </AuthProvider>
  );
}