import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

export type Citacao = {
  id: string;
  texto: string;
  pagina: number;
  livroId: string;
  livroTitulo: string;
  livroAutor: string;
  livroImagem?: string;
  contexto?: string;
  userId: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
};

type CitacoesContextType = {
  citacoes: Citacao[];
  loading: boolean;
  addCitacao: (citacao: Omit<Citacao, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  updateCitacao: (id: string, updates: Partial<Pick<Citacao, 'texto' | 'pagina' | 'contexto'>>) => Promise<{ success: boolean; error?: string }>;
  deleteCitacao: (id: string) => Promise<{ success: boolean; error?: string }>;
  getCitacoesByLivro: (livroId: string) => Citacao[];
  getCitacoesByUser: (userId: string) => Citacao[];
};

const CitacoesContext = createContext<CitacoesContextType | undefined>(undefined);

export const CitacoesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [citacoes, setCitacoes] = useState<Citacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar todas as citações em tempo real
  useEffect(() => {
    const citacoesRef = collection(db, 'citacoes');
    const q = query(citacoesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const citacoesData: Citacao[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          texto: data.texto,
          pagina: data.pagina,
          livroId: data.livroId,
          livroTitulo: data.livroTitulo,
          livroAutor: data.livroAutor,
          livroImagem: data.livroImagem,
          contexto: data.contexto,
          userId: data.userId,
          userName: data.userName,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
      setCitacoes(citacoesData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar citações:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Adicionar nova citação
  const addCitacao = async (citacao: Omit<Citacao, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const citacoesRef = collection(db, 'citacoes');
      const novaCitacao = {
        ...citacao,
        userId: user.uid,
        userName: user.name || user.email || 'Usuário',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(citacoesRef, novaCitacao);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao adicionar citação:', error);
      return { success: false, error: error.message || 'Erro ao adicionar citação' };
    }
  };

  // Atualizar citação
  const updateCitacao = async (id: string, updates: Partial<Pick<Citacao, 'texto' | 'pagina' | 'contexto'>>) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const citacaoRef = doc(db, 'citacoes', id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(citacaoRef, updateData);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar citação:', error);
      return { success: false, error: error.message || 'Erro ao atualizar citação' };
    }
  };

  // Deletar citação
  const deleteCitacao = async (id: string) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const citacaoRef = doc(db, 'citacoes', id);
      await deleteDoc(citacaoRef);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar citação:', error);
      return { success: false, error: error.message || 'Erro ao deletar citação' };
    }
  };

  // Buscar citações por livro
  const getCitacoesByLivro = (livroId: string) => {
    return citacoes.filter(citacao => citacao.livroId === livroId);
  };

  // Buscar citações por usuário
  const getCitacoesByUser = (userId: string) => {
    return citacoes.filter(citacao => citacao.userId === userId);
  };

  return (
    <CitacoesContext.Provider
      value={{
        citacoes,
        loading,
        addCitacao,
        updateCitacao,
        deleteCitacao,
        getCitacoesByLivro,
        getCitacoesByUser,
      }}
    >
      {children}
    </CitacoesContext.Provider>
  );
};

export const useCitacoes = () => {
  const context = useContext(CitacoesContext);
  if (!context) {
    throw new Error('useCitacoes deve ser usado dentro de um CitacoesProvider');
  }
  return context;
};
