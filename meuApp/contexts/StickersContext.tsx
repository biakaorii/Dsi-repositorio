// contexts/StickersContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

export interface Sticker {
  id: string;
  imageUrl: string;
  userId: string;
  createdAt: Date;
}

interface StickersContextType {
  myStickers: Sticker[];
  recentStickers: Sticker[];
  favoriteStickers: Sticker[];
  addSticker: (imageUrl: string) => Promise<void>;
  addFavorite: (imageUrl: string) => Promise<void>;
  removeFavorite: (stickerId: string) => Promise<void>;
  isFavorite: (imageUrl: string) => boolean;
  loading: boolean;
}

const StickersContext = createContext<StickersContextType | undefined>(undefined);

export function StickersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [myStickers, setMyStickers] = useState<Sticker[]>([]);
  const [recentStickers, setRecentStickers] = useState<Sticker[]>([]);
  const [favoriteStickers, setFavoriteStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar minhas figurinhas (criadas pelo usuário)
  useEffect(() => {
    if (!user) {
      setMyStickers([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'stickers'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stickers: Sticker[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        stickers.push({
          id: doc.id,
          imageUrl: data.imageUrl,
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      // Ordenar por mais recentes
      stickers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setMyStickers(stickers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Carregar todos os stickers recentes (de todos os usuários)
  useEffect(() => {
    if (!user) {
      setRecentStickers([]);
      return;
    }

    const q = query(collection(db, 'stickers'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stickers: Sticker[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        stickers.push({
          id: doc.id,
          imageUrl: data.imageUrl,
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      // Ordenar por mais recentes e limitar aos últimos 50
      stickers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setRecentStickers(stickers.slice(0, 50));
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Carregar stickers favoritos
  useEffect(() => {
    if (!user) {
      setFavoriteStickers([]);
      return;
    }

    const q = query(
      collection(db, 'favoriteStickers'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const favorites: Sticker[] = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        favorites.push({
          id: docSnap.id,
          imageUrl: data.imageUrl,
          userId: data.originalUserId,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      }
      
      setFavoriteStickers(favorites);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const addSticker = async (imageUrl: string) => {
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'stickers'), {
        imageUrl,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao adicionar sticker:', error);
      throw error;
    }
  };

  const addFavorite = async (imageUrl: string) => {
    if (!user || !imageUrl) {
      console.error('User ou imageUrl não definido');
      return;
    }

    try {
      // Verificar se já existe
      const q = query(
        collection(db, 'favoriteStickers'),
        where('userId', '==', user.uid),
        where('imageUrl', '==', imageUrl)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log('Sticker já está nos favoritos');
        return; // Já favoritado
      }

      await addDoc(collection(db, 'favoriteStickers'), {
        userId: user.uid,
        imageUrl: imageUrl,
        originalUserId: user.uid, // Pode ser melhorado para pegar o userId original
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      throw error;
    }
  };

  const removeFavorite = async (stickerId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'favoriteStickers', stickerId));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }
  };

  const isFavorite = (imageUrl: string): boolean => {
    return favoriteStickers.some(s => s.imageUrl === imageUrl);
  };

  return (
    <StickersContext.Provider
      value={{
        myStickers,
        recentStickers,
        favoriteStickers,
        addSticker,
        addFavorite,
        removeFavorite,
        isFavorite,
        loading,
      }}
    >
      {children}
    </StickersContext.Provider>
  );
}

export function useStickers() {
  const context = useContext(StickersContext);
  if (context === undefined) {
    throw new Error('useStickers must be used within a StickersProvider');
  }
  return context;
}
