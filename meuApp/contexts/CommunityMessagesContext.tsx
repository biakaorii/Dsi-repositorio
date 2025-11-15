import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

export interface CommunityMessage {
  id: string;
  comunidadeId: string;
  message: string;
  userId: string;
  userName: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface CommunityMessagesContextData {
  getMessages: (communityId: string) => CommunityMessage[];
  startListening: (communityId: string) => void;
  stopListening: (communityId: string) => void;
  isListening: (communityId: string) => boolean;
  sendMessage: (
    communityId: string,
    message: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateMessage: (
    communityId: string,
    messageId: string,
    message: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteMessage: (
    communityId: string,
    messageId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const CommunityMessagesContext = createContext<CommunityMessagesContextData>(
  {} as CommunityMessagesContextData
);

export function CommunityMessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messagesByCommunity, setMessagesByCommunity] = useState<
    Record<string, CommunityMessage[]>
  >({});
  const listenersRef = useRef<Record<string, () => void>>({});

  const stopAllListeners = useCallback(() => {
    Object.values(listenersRef.current).forEach((unsubscribe) => unsubscribe());
    listenersRef.current = {};
    setMessagesByCommunity({});
  }, []);

  useEffect(() => stopAllListeners, [stopAllListeners]);

  useEffect(() => {
    if (!user) {
      stopAllListeners();
    }
  }, [user, stopAllListeners]);

  const startListening = useCallback((communityId: string) => {
    if (!communityId || listenersRef.current[communityId]) {
      return;
    }

    const messagesRef = collection(db, 'comunidades', communityId, 'mensagens');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: CommunityMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            comunidadeId: communityId,
            message: data.message || '',
            userId: data.userId || '',
            userName: data.userName || 'Usuário',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.(),
          });
        });
        setMessagesByCommunity((prev) => ({
          ...prev,
          [communityId]: items,
        }));
      },
      (error) => {
        console.error('Erro ao escutar mensagens:', error);
      }
    );

    listenersRef.current[communityId] = unsubscribe;
  }, []);

  const stopListening = useCallback((communityId: string) => {
    if (!communityId) {
      return;
    }

    const unsubscribe = listenersRef.current[communityId];
    if (unsubscribe) {
      unsubscribe();
      delete listenersRef.current[communityId];
      setMessagesByCommunity((prev) => {
        if (!(communityId in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[communityId];
        return next;
      });
    }
  }, []);

  const getMessages = useCallback(
    (communityId: string) => messagesByCommunity[communityId] || [],
    [messagesByCommunity]
  );

  const sendMessage = useCallback(
    async (communityId: string, message: string) => {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const trimmed = message.trim();
      if (!trimmed) {
        return { success: false, error: 'Mensagem vazia' };
      }

      try {
        const messagesRef = collection(db, 'comunidades', communityId, 'mensagens');
        await addDoc(messagesRef, {
          message: trimmed,
          userId: user.uid,
          userName: user.name || 'Usuário',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return { success: true };
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return { success: false, error: 'Erro ao enviar mensagem' };
      }
    },
    [user]
  );

  const updateMessage = useCallback(
    async (communityId: string, messageId: string, message: string) => {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const trimmed = message.trim();
      if (!trimmed) {
        return { success: false, error: 'Mensagem vazia' };
      }

      try {
        const messageRef = doc(db, 'comunidades', communityId, 'mensagens', messageId);
        await updateDoc(messageRef, {
          message: trimmed,
          updatedAt: serverTimestamp(),
        });
        return { success: true };
      } catch (error) {
        console.error('Erro ao atualizar mensagem:', error);
        return { success: false, error: 'Erro ao atualizar mensagem' };
      }
    },
    [user]
  );

  const deleteMessage = useCallback(
    async (communityId: string, messageId: string) => {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      try {
        const messageRef = doc(db, 'comunidades', communityId, 'mensagens', messageId);
        await deleteDoc(messageRef);
        return { success: true };
      } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
        return { success: false, error: 'Erro ao deletar mensagem' };
      }
    },
    [user]
  );

  const isListening = useCallback(
    (communityId: string) => Boolean(listenersRef.current[communityId]),
    []
  );

  return (
    <CommunityMessagesContext.Provider
      value={{
        getMessages,
        startListening,
        stopListening,
        isListening,
        sendMessage,
        updateMessage,
        deleteMessage,
      }}
    >
      {children}
    </CommunityMessagesContext.Provider>
  );
}

export function useCommunityMessages() {
  const context = useContext(CommunityMessagesContext);
  if (!context) {
    throw new Error('useCommunityMessages deve ser usado dentro de CommunityMessagesProvider');
  }
  return context;
}
