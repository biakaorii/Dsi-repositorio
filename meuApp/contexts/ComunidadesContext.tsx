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
  arrayUnion,
  arrayRemove,
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
  moderadores: string[]; // Array de IDs dos moderadores
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
  joinComunidade: (
    comunidadeId: string
  ) => Promise<{ success: boolean; error?: string }>;
  leaveComunidade: (
    comunidadeId: string
  ) => Promise<{ success: boolean; error?: string }>;
  removeMember: (
    comunidadeId: string,
    memberId: string
  ) => Promise<{ success: boolean; error?: string }>;
  promoteToModerator: (
    comunidadeId: string,
    memberId: string
  ) => Promise<{ success: boolean; error?: string }>;
  demoteFromModerator: (
    comunidadeId: string,
    memberId: string
  ) => Promise<{ success: boolean; error?: string }>;
  getComunidadesByUser: (userId: string) => Comunidade[];
  isMember: (comunidadeId: string, userId: string) => boolean;
  isOwner: (comunidadeId: string, userId: string) => boolean;
  isModerator: (comunidadeId: string, userId: string) => boolean;
  canModerate: (comunidadeId: string, userId: string) => boolean;
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
            moderadores: data.moderadores || [],
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
        moderadores: [], // Inicialmente sem moderadores
      };

      await addDoc(collection(db, 'comunidades'), comunidadeData);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao criar comunidade:', error);
      return { success: false, error: 'Erro ao criar comunidade' };
    }
  }

  // Atualizar comunidade (admin ou moderador)
  async function updateComunidade(comunidadeId: string, nome: string, descricao: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se o usuário é o dono ou moderador
      const comunidade = comunidades.find((c) => c.id === comunidadeId);
      if (!comunidade) {
        return { success: false, error: 'Comunidade não encontrada' };
      }

      const isAdminOrMod = comunidade.ownerId === user.uid || comunidade.moderadores.includes(user.uid);
      if (!isAdminOrMod) {
        return { success: false, error: 'Apenas administradores e moderadores podem editar a comunidade' };
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

  // Entrar na comunidade
  async function joinComunidade(comunidadeId: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se a comunidade existe
      const comunidade = comunidades.find((c) => c.id === comunidadeId);
      if (!comunidade) {
        return { success: false, error: 'Comunidade não encontrada' };
      }

      // Verificar se já é membro
      if (comunidade.membros.includes(user.uid)) {
        return { success: false, error: 'Você já é membro desta comunidade' };
      }

      const comunidadeRef = doc(db, 'comunidades', comunidadeId);
      await updateDoc(comunidadeRef, {
        membros: arrayUnion(user.uid),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao entrar na comunidade:', error);
      return { success: false, error: 'Erro ao entrar na comunidade' };
    }
  }

  // Sair da comunidade
  async function leaveComunidade(comunidadeId: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se a comunidade existe
      const comunidade = comunidades.find((c) => c.id === comunidadeId);
      if (!comunidade) {
        return { success: false, error: 'Comunidade não encontrada' };
      }

      // Verificar se é o dono
      if (comunidade.ownerId === user.uid) {
        return { success: false, error: 'O administrador não pode sair da comunidade. Delete a comunidade se desejar.' };
      }

      // Verificar se é membro
      if (!comunidade.membros.includes(user.uid)) {
        return { success: false, error: 'Você não é membro desta comunidade' };
      }

      const comunidadeRef = doc(db, 'comunidades', comunidadeId);
      await updateDoc(comunidadeRef, {
        membros: arrayRemove(user.uid),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao sair da comunidade:', error);
      return { success: false, error: 'Erro ao sair da comunidade' };
    }
  }

  // Remover membro da comunidade (admin ou moderador)
  async function removeMember(comunidadeId: string, memberId: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Verificar se a comunidade existe
      const comunidade = comunidades.find((c) => c.id === comunidadeId);
      if (!comunidade) {
        return { success: false, error: 'Comunidade não encontrada' };
      }

      // Verificar se o usuário pode moderar (admin ou moderador)
      const isAdminOrMod = comunidade.ownerId === user.uid || comunidade.moderadores.includes(user.uid);
      if (!isAdminOrMod) {
        return { success: false, error: 'Apenas administradores e moderadores podem remover membros' };
      }

      // Verificar se está tentando remover a si mesmo
      if (memberId === user.uid) {
        return { success: false, error: 'Você não pode se remover. Use a opção "Sair da comunidade".' };
      }

      // Moderador não pode remover outro moderador ou o admin
      const isMod = comunidade.moderadores.includes(user.uid);
      const isAdmin = comunidade.ownerId === user.uid;
      const targetIsMod = comunidade.moderadores.includes(memberId);
      const targetIsAdmin = comunidade.ownerId === memberId;

      if (isMod && !isAdmin) {
        if (targetIsMod) {
          return { success: false, error: 'Moderadores não podem remover outros moderadores' };
        }
        if (targetIsAdmin) {
          return { success: false, error: 'Moderadores não podem remover o administrador' };
        }
      }

      // Admin não pode se remover
      if (targetIsAdmin) {
        return { success: false, error: 'O administrador não pode ser removido. Delete a comunidade se desejar.' };
      }

      // Verificar se o membro existe na comunidade
      if (!comunidade.membros.includes(memberId)) {
        return { success: false, error: 'Usuário não é membro desta comunidade' };
      }

      const comunidadeRef = doc(db, 'comunidades', comunidadeId);
      
      // Remover do array de membros e também de moderadores (se for)
      const updates: any = {
        membros: arrayRemove(memberId),
      };
      
      if (comunidade.moderadores.includes(memberId)) {
        updates.moderadores = arrayRemove(memberId);
      }
      
      await updateDoc(comunidadeRef, updates);

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao remover membro:', error);
      return { success: false, error: 'Erro ao remover membro' };
    }
  }

  // Promover membro a moderador (apenas admin)
  async function promoteToModerator(comunidadeId: string, memberId: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const comunidade = comunidades.find((c) => c.id === comunidadeId);
      if (!comunidade) {
        return { success: false, error: 'Comunidade não encontrada' };
      }

      // Apenas o dono pode promover
      if (comunidade.ownerId !== user.uid) {
        return { success: false, error: 'Apenas o administrador pode promover moderadores' };
      }

      // Verificar se é membro
      if (!comunidade.membros.includes(memberId)) {
        return { success: false, error: 'Usuário não é membro desta comunidade' };
      }

      // Verificar se já é moderador
      if (comunidade.moderadores.includes(memberId)) {
        return { success: false, error: 'Usuário já é moderador' };
      }

      // Não pode promover a si mesmo (já é admin)
      if (memberId === user.uid) {
        return { success: false, error: 'Você já é o administrador' };
      }

      const comunidadeRef = doc(db, 'comunidades', comunidadeId);
      await updateDoc(comunidadeRef, {
        moderadores: arrayUnion(memberId),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao promover moderador:', error);
      return { success: false, error: 'Erro ao promover moderador' };
    }
  }

  // Remover moderador (apenas admin)
  async function demoteFromModerator(comunidadeId: string, memberId: string) {
    try {
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const comunidade = comunidades.find((c) => c.id === comunidadeId);
      if (!comunidade) {
        return { success: false, error: 'Comunidade não encontrada' };
      }

      // Apenas o dono pode remover moderador
      if (comunidade.ownerId !== user.uid) {
        return { success: false, error: 'Apenas o administrador pode remover moderadores' };
      }

      // Verificar se é moderador
      if (!comunidade.moderadores.includes(memberId)) {
        return { success: false, error: 'Usuário não é moderador' };
      }

      const comunidadeRef = doc(db, 'comunidades', comunidadeId);
      await updateDoc(comunidadeRef, {
        moderadores: arrayRemove(memberId),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao remover moderador:', error);
      return { success: false, error: 'Erro ao remover moderador' };
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

  // Verificar se usuário é moderador
  function isModerator(comunidadeId: string, userId: string): boolean {
    const comunidade = comunidades.find((c) => c.id === comunidadeId);
    return comunidade ? comunidade.moderadores.includes(userId) : false;
  }

  // Verificar se usuário pode moderar (admin ou moderador)
  function canModerate(comunidadeId: string, userId: string): boolean {
    return isOwner(comunidadeId, userId) || isModerator(comunidadeId, userId);
  }

  return (
    <ComunidadesContext.Provider
      value={{
        comunidades,
        loading,
        createComunidade,
        updateComunidade,
        deleteComunidade,
        joinComunidade,
        leaveComunidade,
        removeMember,
        promoteToModerator,
        demoteFromModerator,
        getComunidadesByUser,
        isMember,
        isOwner,
        isModerator,
        canModerate,
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
