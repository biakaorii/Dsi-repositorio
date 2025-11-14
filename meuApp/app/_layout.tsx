import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { Dimensions } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ReviewsProvider } from '../contexts/ReviewsContext';
import { ComunidadesProvider } from '../contexts/ComunidadesContext';
import { LivrosProvider } from '../contexts/LivrosContext';
import { ReactNode } from 'react';

const { height } = Dimensions.get('window');

// Wrapper que usa useAuth e passa userId ao LivrosProvider
function LivrosProviderWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <LivrosProvider userId={user?.uid}>{children}</LivrosProvider>;
}

export default function Layout() {
  return (
    <AuthProvider>
      <ReviewsProvider>
        <ComunidadesProvider>
          <LivrosProviderWrapper>
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
              <Stack.Screen name="cadastroLivro"/>
              <Stack.Screen name="book-details"/>
              <Stack.Screen name="comunidades"/>
              <Stack.Screen name="criar-comunidade"/>
              <Stack.Screen name="chat-comunidade"/>
              <Stack.Screen name="detalhes-comunidade"/>
              <Stack.Screen name="perfil-usuario" />
            </Stack>
            <Toast topOffset={height / 2 - 60} />
          </LivrosProviderWrapper>
        </ComunidadesProvider>
      </ReviewsProvider>
    </AuthProvider>
  );
}
