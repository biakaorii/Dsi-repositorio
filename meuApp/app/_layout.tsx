// app/_layout.tsx
import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { Dimensions } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ReviewsProvider } from '../contexts/ReviewsContext';
import { ComunidadesProvider } from '../contexts/ComunidadesContext';
import { CommunityMessagesProvider } from '../contexts/CommunityMessagesContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { LivrosProvider } from '../contexts/LivrosContext';
import { CitacoesProvider } from '../contexts/CitacoesContext';
import { EventosProvider } from '../contexts/EventosContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { StickersProvider } from '../contexts/StickersContext';
import { ReactNode } from 'react';

const { height } = Dimensions.get('window');

// Wrapper que usa useAuth e passa userId ao LivrosProvider
function LivrosProviderWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <LivrosProvider userId={user?.uid}>{children}</LivrosProvider>;
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ReviewsProvider>
          <ComunidadesProvider>
            <CommunityMessagesProvider>
              <FavoritesProvider>
                <CitacoesProvider>
                  <EventosProvider>
                    <StickersProvider>
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
                        <Stack.Screen name="book-details-local"/>
                        <Stack.Screen name="book-preview-local"/>
                        <Stack.Screen name="comunidades"/>
                        <Stack.Screen name="criar-comunidade"/>
                        <Stack.Screen name="chat-comunidade"/>
                        <Stack.Screen name="detalhes-comunidade"/>
                        <Stack.Screen name="perfil-usuario"/>
                        <Stack.Screen name="favoritos"/>
                        <Stack.Screen name="citacoes"/>
                        <Stack.Screen name="adicionar-citacao"/>
                        <Stack.Screen name="editar-citacao"/>
                        <Stack.Screen name="eventos-mapa"/>
                        <Stack.Screen name="criar-evento"/>
                        <Stack.Screen name="selecionar-localizacao"/>
                      </Stack>
                      <Toast topOffset={height / 2 - 60} />
                    </LivrosProviderWrapper>
                  </StickersProvider>
                </EventosProvider>
              </CitacoesProvider>
            </FavoritesProvider>
          </CommunityMessagesProvider>
        </ComunidadesProvider>
      </ReviewsProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}
