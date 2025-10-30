// contexts/ComunidadesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from './AuthContext';

export interface Comunidade {
  id: string;
  nome: string;
  descricao: string;
  ownerId: string;
  ownerName: string;
  createdAt: Date;
  membros: string[];
}

interface ComunidadesContextData {
  comunidades: Comunidade[];
  loading: boolean;
  createComunidade: (
    nome: string,
    descricao: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateComunidade: (
    comunidadeId: string,
    nome: string,
    descricao: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteComunidade: (
    comunidadeId: string
  ) => Promise<{ success: boolean; error?: string }>;
  getComunidadesByUser: (userId: string) => Comunidade[];
  isMember: (comunidadeId: string, userId: string) => boolean;
  isOwner: (comunidadeId: string, userId: string) => boolean;
}

const ComunidadesContext = createContext<ComunidadesContextData>({} as ComunidadesContextData);

export function ComunidadesProvider({ children }: { children: ReactNode }) {
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Listener em tempo real para comunidades
  useEffect(() => {
    // Só inicia o listener se houver usuário autenticado
    if (!user) {
      setComunidades([]);
      setLoading(false);
      return;
    }

    const comunidadesRef = collection(db, 'comunidades');
    const q = query(comunidadesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const comunidadesData: Comunidade[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          comunidadesData.push({
            id: doc.id,
            nome: data.nome,
            descricao: data.descricao,
            ownerId: data.ownerId,
            ownerName: data.ownerName,
            createdAt: data.createdAt?.toDate() || new Date(),
            membros: data.membros || [],
          });
        });
        setComunidades(comunidadesData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar comunidades:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Criar comunidade
  async function createComunidade(nome: string, descricao: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      if (!nome.trim()) {
        return { success: false, error: 'O nome da comunidade é obrigatório' };
      }

      if (!descricao.trim()) {
        return { success: false, error: 'A descrição da comunidade é obrigatória' };
      }

      const comunidadeData = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        ownerId: user.uid,
        ownerName: user.name,
        createdAt: Timestamp.now(),
        membros: [user.uid], // O criador é o primeiro membro
      };

      await addDoc(collection(db, 'comunidades'), comunidadeData);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao criar comunidade:', error);
      return { success: false, error: 'Erro ao criar comunidade' };
    }
  }

  // Atualizar comunidade
  async function updateComunidade(comunidadeId: string, nome: string, descricao: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se o usuário é o dono
      const comunidade = comunidades.find((c) => c.id === comunidadeId);
      if (!comunidade) {
        return { success: false, error: 'Comunidade não encontrada' };
      }

      if (comunidade.ownerId !== user.uid) {
        return { success: false, error: 'Apenas o administrador pode editar a comunidade' };
      }

      if (!nome.trim()) {
        return { success: false, error: 'O nome da comunidade é obrigatório' };
      }

      if (!descricao.trim()) {
        return { success: false, error: 'A descrição da comunidade é obrigatória' };
      }

      const comunidadeRef = doc(db, 'comunidades', comunidadeId);
      await updateDoc(comunidadeRef, {
        nome: nome.trim(),
        descricao: descricao.trim(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar comunidade:', error);
      return { success: false, error: 'Erro ao atualizar comunidade' };
    }
  }

  // Deletar comunidade
  async function deleteComunidade(comunidadeId: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se o usuário é o dono
      const comunidade = comunidades.find((c) => c.id === comunidadeId);
      if (!comunidade) {
        return { success: false, error: 'Comunidade não encontrada' };
      }

      if (comunidade.ownerId !== user.uid) {
        return { success: false, error: 'Apenas o administrador pode deletar a comunidade' };
      }

      const comunidadeRef = doc(db, 'comunidades', comunidadeId);
      await deleteDoc(comunidadeRef);

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar comunidade:', error);
      return { success: false, error: 'Erro ao deletar comunidade' };
    }
  }

  // Buscar comunidades por usuário (onde ele é membro)
  function getComunidadesByUser(userId: string): Comunidade[] {
    return comunidades
      .filter((c) => c.membros.includes(userId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Verificar se usuário é membro
  function isMember(comunidadeId: string, userId: string): boolean {
    const comunidade = comunidades.find((c) => c.id === comunidadeId);
    return comunidade ? comunidade.membros.includes(userId) : false;
  }

  // Verificar se usuário é dono
  function isOwner(comunidadeId: string, userId: string): boolean {
    const comunidade = comunidades.find((c) => c.id === comunidadeId);
    return comunidade ? comunidade.ownerId === userId : false;
  }

  return (
    <ComunidadesContext.Provider
      value={{
        comunidades,
        loading,
        createComunidade,
        updateComunidade,
        deleteComunidade,
        getComunidadesByUser,
        isMember,
        isOwner,
      }}
    >
      {children}
    </ComunidadesContext.Provider>
  );
}

export function useComunidades() {
  const context = useContext(ComunidadesContext);
  if (!context) {
    throw new Error('useComunidades deve ser usado dentro de ComunidadesProvider');
  }
  return context;
}
