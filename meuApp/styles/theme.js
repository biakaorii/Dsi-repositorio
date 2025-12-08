// app/styles/theme.js

import { StyleSheet } from 'react-native';

const Colors = {
  // Fundos
  background: '#F8F9FA',        // Cinza muito claro (fundo suave)
  surface: '#FFFFFF',           // Branco puro (cards, botões)
  
  // Textos
  onBackground: '#212529',      // Preto suave (texto principal)
  onSurface: '#495057',         // Cinza escuro (texto secundário)
  disabled: '#ADB5BD',          // Cinza médio (itens desabilitados)

  // Acento principal (azul suave, profissional)
  primary: '#3498DB',
  primaryVariant: '#2980B9',
  
  // Avisos / destaques
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',

  // Bordas e sombras leves
  border: '#DEE2E6',
  shadow: '#00000020',          // Preto com 12% de opacidade
};

// --- ESTILOS GLOBAIS REUTILIZÁVEIS ---
const GlobalStyles = StyleSheet.create({
  // Layout principal
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Card de livro
  bookCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Títulos
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 6,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onBackground,
    marginVertical: 16,
    textAlign: 'center',
  },

  // Textos descritivos
  bodyText: {
    fontSize: 15,
    color: Colors.onSurface,
    lineHeight: 22,
    marginBottom: 4,
  },
  caption: {
    fontSize: 13,
    color: Colors.disabled,
    fontStyle: 'italic',
  },

  // Botões (primário)
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Separador visual
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },

  // Loading ou estado vazio
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // Gênero/tag
  genreTag: {
    backgroundColor: Colors.primary + '20', // 12% de opacidade
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  genreText: {
    color: Colors.primaryVariant,
    fontSize: 13,
    fontWeight: '600',
  },
});

export { Colors, GlobalStyles };