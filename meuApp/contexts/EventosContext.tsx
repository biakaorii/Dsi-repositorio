import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

export type Evento = {
  id: string;
  titulo: string;
  descricao?: string;
  local: string;
  cidade: string;
  estado: string;
  pais: string;
  latitude: number;
  longitude: number;
  dataInicio: Date;
  dataFim?: Date;
  categoria: 'lancamento' | 'encontro' | 'feira' | 'outro';
  linkIngressos?: string;
  userId: string;
  userName: string;
  selecionado?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type EventosContextType = {
  eventos: Evento[];
  loading: boolean;
  addEvento: (evento: Omit<Evento, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateEvento: (id: string, updates: Partial<Omit<Evento, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>>) => Promise<{ success: boolean; error?: string }>;
  deleteEvento: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleSelecionado: (id: string) => Promise<{ success: boolean; error?: string }>;
  getEventosByUser: (userId: string) => Evento[];
  getEventosByCategoria: (categoria: string) => Evento[];
};

const EventosContext = createContext<EventosContextType | undefined>(undefined);

export const EventosProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar todos os eventos em tempo real
  useEffect(() => {
    const eventosRef = collection(db, 'eventos');
    const q = query(eventosRef, orderBy('dataInicio', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventosData: Evento[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titulo: data.titulo,
          descricao: data.descricao,
          local: data.local,
          cidade: data.cidade,
          estado: data.estado,
          pais: data.pais,
          latitude: data.latitude,
          longitude: data.longitude,
          dataInicio: data.dataInicio?.toDate() || new Date(),
          dataFim: data.dataFim?.toDate(),
          categoria: data.categoria,
          linkIngressos: data.linkIngressos,
          userId: data.userId,
          userName: data.userName,
          selecionado: data.selecionado || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
      setEventos(eventosData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar eventos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Adicionar novo evento
  const addEvento = async (evento: Omit<Evento, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const eventosRef = collection(db, 'eventos');
      
      // Remover campos undefined para evitar erros do Firestore
      const eventoLimpo: any = {
        titulo: evento.titulo,
        local: evento.local,
        cidade: evento.cidade,
        estado: evento.estado,
        pais: evento.pais,
        latitude: evento.latitude,
        longitude: evento.longitude,
        dataInicio: evento.dataInicio,
        categoria: evento.categoria,
        userId: user.uid,
        userName: user.name || user.email || 'Usuário',
        selecionado: evento.selecionado || false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Adicionar campos opcionais apenas se existirem
      if (evento.descricao) eventoLimpo.descricao = evento.descricao;
      if (evento.dataFim) eventoLimpo.dataFim = evento.dataFim;
      if (evento.linkIngressos) eventoLimpo.linkIngressos = evento.linkIngressos;

      const docRef = await addDoc(eventosRef, eventoLimpo);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Erro ao adicionar evento:', error);
      return { success: false, error: error.message || 'Erro ao adicionar evento' };
    }
  };

  // Atualizar evento
  const updateEvento = async (id: string, updates: Partial<Omit<Evento, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>>) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const eventoRef = doc(db, 'eventos', id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(eventoRef, updateData);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar evento:', error);
      return { success: false, error: error.message || 'Erro ao atualizar evento' };
    }
  };

  // Deletar evento
  const deleteEvento = async (id: string) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const eventoRef = doc(db, 'eventos', id);
      await deleteDoc(eventoRef);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar evento:', error);
      return { success: false, error: error.message || 'Erro ao deletar evento' };
    }
  };

  // Toggle selecionado
  const toggleSelecionado = async (id: string) => {
    const evento = eventos.find(e => e.id === id);
    if (!evento) {
      return { success: false, error: 'Evento não encontrado' };
    }

    return updateEvento(id, { selecionado: !evento.selecionado });
  };

  // Buscar eventos por usuário
  const getEventosByUser = (userId: string) => {
    return eventos.filter(evento => evento.userId === userId);
  };

  // Buscar eventos por categoria
  const getEventosByCategoria = (categoria: string) => {
    return eventos.filter(evento => evento.categoria === categoria);
  };

  return (
    <EventosContext.Provider
      value={{
        eventos,
        loading,
        addEvento,
        updateEvento,
        deleteEvento,
        toggleSelecionado,
        getEventosByUser,
        getEventosByCategoria,
      }}
    >
      {children}
    </EventosContext.Provider>
  );
};

export const useEventos = () => {
  const context = useContext(EventosContext);
  if (!context) {
    throw new Error('useEventos deve ser usado dentro de um EventosProvider');
  }
  return context;
};
