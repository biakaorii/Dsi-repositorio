import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shelf, ShelfResponse, Book } from '../utils/types';

const SHELVES_STORAGE_KEY = '@app_shelves';

export const useShelf = () => {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar estantes do AsyncStorage ao montar o componente
  const loadShelves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AsyncStorage.getItem(SHELVES_STORAGE_KEY);
      if (data) {
        setShelves(JSON.parse(data));
      } else {
        setShelves([]);
      }
    } catch (err) {
      setError('Erro ao carregar estantes');
      console.error('Erro ao carregar estantes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar estantes no AsyncStorage
  const saveShelves = useCallback(async (newShelves: Shelf[]) => {
    try {
      await AsyncStorage.setItem(SHELVES_STORAGE_KEY, JSON.stringify(newShelves));
      setShelves(newShelves);
    } catch (err) {
      setError('Erro ao salvar estantes');
      console.error('Erro ao salvar estantes:', err);
    }
  }, []);

  // Criar nova estante
  const createShelf = useCallback(
    async (name: string, description?: string): Promise<ShelfResponse> => {
      if (!name.trim()) {
        return { success: false, message: 'Nome da estante é obrigatório' };
      }

      try {
        const newShelf: Shelf = {
          id: Date.now().toString(),
          name: name.trim(),
          description: description?.trim() || '',
          createdAt: new Date().toISOString(),
          books: [],
        };

        const newShelves = [...shelves, newShelf];
        await saveShelves(newShelves);

        return {
          success: true,
          message: 'Estante criada com sucesso',
          data: newShelf,
        };
      } catch (err) {
        return { success: false, message: 'Erro ao criar estante' };
      }
    },
    [shelves, saveShelves]
  );

  // Atualizar estante
  const updateShelf = useCallback(
    async (id: string, name: string, description?: string): Promise<ShelfResponse> => {
      if (!name.trim()) {
        return { success: false, message: 'Nome da estante é obrigatório' };
      }

      try {
        const updatedShelves = shelves.map((shelf) =>
          shelf.id === id
            ? {
                ...shelf,
                name: name.trim(),
                description: description?.trim() || '',
              }
            : shelf
        );

        await saveShelves(updatedShelves);

        return {
          success: true,
          message: 'Estante atualizada com sucesso',
        };
      } catch (err) {
        return { success: false, message: 'Erro ao atualizar estante' };
      }
    },
    [shelves, saveShelves]
  );

  // Deletar estante
  const deleteShelf = useCallback(
    async (id: string): Promise<ShelfResponse> => {
      try {
        const updatedShelves = shelves.filter((shelf) => shelf.id !== id);
        await saveShelves(updatedShelves);

        return {
          success: true,
          message: 'Estante deletada com sucesso',
        };
      } catch (err) {
        return { success: false, message: 'Erro ao deletar estante' };
      }
    },
    [shelves, saveShelves]
  );

  // Obter estante por ID com resposta padronizada
  const getShelf = useCallback(
    async (id: string): Promise<ShelfResponse> => {
      try {
        const shelf = shelves.find((s) => s.id === id);
        
        if (!shelf) {
          return { success: false, message: 'Estante não encontrada' };
        }

        return {
          success: true,
          message: 'Estante carregada com sucesso',
          data: shelf,
        };
      } catch (err) {
        return { success: false, message: 'Erro ao carregar estante' };
      }
    },
    [shelves]
  );

  // Adicionar livro à estante (recebe objeto Book completo)
  const addBookToShelf = useCallback(
    async (shelfId: string, book: Book): Promise<ShelfResponse> => {
      try {
        const shelf = shelves.find((s) => s.id === shelfId);
        if (!shelf) {
          return { success: false, message: 'Estante não encontrada' };
        }

        // Verificar se o livro já existe na estante
        if (shelf.books.some((b) => b.id === book.id)) {
          return { success: false, message: 'Este livro já está nesta estante' };
        }

        const updatedShelves = shelves.map((s) =>
          s.id === shelfId ? { ...s, books: [...s.books, book] } : s
        );

        await saveShelves(updatedShelves);

        return {
          success: true,
          message: 'Livro adicionado à estante com sucesso',
        };
      } catch (err) {
        return { success: false, message: 'Erro ao adicionar livro' };
      }
    },
    [shelves, saveShelves]
  );

  // Remover livro da estante (por bookId)
  const removeBookFromShelf = useCallback(
    async (shelfId: string, bookId: string): Promise<ShelfResponse> => {
      try {
        const updatedShelves = shelves.map((s) =>
          s.id === shelfId
            ? { ...s, books: s.books.filter((b) => b.id !== bookId) }
            : s
        );

        await saveShelves(updatedShelves);

        return {
          success: true,
          message: 'Livro removido da estante com sucesso',
        };
      } catch (err) {
        return { success: false, message: 'Erro ao remover livro' };
      }
    },
    [shelves, saveShelves]
  );

  // Carregar estantes na primeira renderização
  useEffect(() => {
    loadShelves();
  }, [loadShelves]);

  return {
    shelves,
    loading,
    error,
    loadShelves,
    createShelf,
    updateShelf,
    deleteShelf,
    getShelf,
    addBookToShelf,
    removeBookFromShelf,
  };
};
