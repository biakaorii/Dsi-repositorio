// contexts/FavoritesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookImage: string;
  createdAt: Date;
}

interface FavoritesContextData {
  favorites: Favorite[];
  loading: boolean;
  addFavorite: (
    bookId: string,
    bookTitle: string,
    bookAuthor: string,
    bookImage: string
  ) => Promise<{ success: boolean; error?: string }>;
  removeFavorite: (bookId: string) => Promise<{ success: boolean; error?: string }>;
  isFavorite: (bookId: string) => boolean;
  getFavoritesByUser: (userId: string) => Favorite[];
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Listener em tempo real para favoritos do usuário
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const favoritesData: Favorite[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          favoritesData.push({
            id: doc.id,
            userId: data.userId,
            bookId: data.bookId,
            bookTitle: data.bookTitle,
            bookAuthor: data.bookAuthor,
            bookImage: data.bookImage,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        setFavorites(favoritesData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar favoritos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addFavorite = async (
    bookId: string,
    bookTitle: string,
    bookAuthor: string,
    bookImage: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      // Verificar se já existe
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', user.uid),
        where('bookId', '==', bookId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return { success: false, error: 'Livro já está nos favoritos' };
      }

      // Adicionar aos favoritos
      await addDoc(collection(db, 'favorites'), {
        userId: user.uid,
        bookId,
        bookTitle,
        bookAuthor,
        bookImage,
        createdAt: Timestamp.now(),
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      return { success: false, error: 'Erro ao adicionar aos favoritos' };
    }
  };

  const removeFavorite = async (bookId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', user.uid),
        where('bookId', '==', bookId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, error: 'Favorito não encontrado' };
      }

      // Deletar o favorito
      await deleteDoc(doc(db, 'favorites', querySnapshot.docs[0].id));

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return { success: false, error: 'Erro ao remover dos favoritos' };
    }
  };

  const isFavorite = (bookId: string): boolean => {
    return favorites.some((fav) => fav.bookId === bookId);
  };

  const getFavoritesByUser = (userId: string): Favorite[] => {
    return favorites.filter((fav) => fav.userId === userId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addFavorite,
        removeFavorite,
        isFavorite,
        getFavoritesByUser,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
