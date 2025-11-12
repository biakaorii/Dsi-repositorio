// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser as firebaseDeleteUser,
  User as FirebaseUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

interface UserData {
  uid: string;
  name: string;
  email: string;
  profileType?: 'leitor' | 'empreendedor' | 'critico';
  age?: string;
  genres?: string[]; // Gêneros favoritos (APENAS para leitores)
  readingGoal?: string;
  // Campos do negócio (empreendedores)
  businessName?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  bio?: string; // História do empreendedor OU bio do leitor
  businessDescription?: string; // Descrição curta do negócio
  mission?: string; // Missão da livraria
  foundedYear?: string; // Ano de fundação
  businessType?: 'fisica' | 'online' | 'hibrida'; // Tipo de negócio
  workingHours?: string; // Horário de funcionamento
  phoneWhatsApp?: string; // WhatsApp comercial
  website?: string; // Site
  instagram?: string; // Instagram
  services?: string[]; // Diferenciais/Serviços oferecidos
  photos?: string[]; // URLs das fotos da galeria
  profilePhotoUrl?: string;
  createdAt: string;
}

interface AuthContextData {
  user: UserData | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<UserData>) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitorar estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Carregar dados do usuário do Firestore
  async function loadUserData(firebaseUser: FirebaseUser) {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      // Primeiro, carregar os dados uma vez
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUser(userDoc.data() as UserData);
        
        // Configurar listener para atualizações em tempo real
        onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            console.log('🔄 Dados do usuário atualizados em tempo real');
            setUser(doc.data() as UserData);
          }
        });
      } else {
        // Criar documento básico se não existir
        const userData: UserData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email || '',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }

  // Criar nova conta
  async function signUp(name: string, email: string, password: string) {
    try {
      console.log('🔵 Iniciando cadastro:', { name, email });
      
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Usuário criado no Auth:', userCredential.user.uid);
      
      // Atualizar nome do perfil
      await updateProfile(userCredential.user, { displayName: name });
      console.log('✅ Nome atualizado no perfil');

      // Criar documento no Firestore
      const userData: UserData = {
        uid: userCredential.user.uid,
        name,
        email,
        createdAt: new Date().toISOString(),
      };

      console.log('🔵 Salvando no Firestore:', userData);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, userData);
      console.log('✅ Documento criado no Firestore');
      
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Erro ao criar conta:', error);
      console.error('❌ Código do erro:', error.code);
      console.error('❌ Mensagem do erro:', error.message);
      
      let errorMessage = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está cadastrado';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Erro de permissão. Verifique as regras do Firestore';
      }

      return { success: false, error: errorMessage };
    }
  }

  // Login
  async function signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await loadUserData(userCredential.user);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      }

      return { success: false, error: errorMessage };
    }
  }

  // Logout
  async function signOut() {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // Atualizar dados do usuário
  async function updateUser(data: Partial<UserData>) {
    try {
      if (!user) {
        console.error('❌ Usuário não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Remover campos undefined, null ou vazios antes de enviar ao Firestore
      const sanitizedData: any = {};
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        // Apenas adiciona se o valor não for undefined, null ou string vazia
        if (value !== undefined && value !== null && value !== '') {
          sanitizedData[key] = value;
        }
      });

      console.log('🔵 Atualizando usuário no Firestore...');
      console.log('🔵 ID do usuário:', user.uid);
      console.log('🔵 Dados originais:', JSON.stringify(data, null, 2));
      console.log('🔵 Dados sanitizados:', JSON.stringify(sanitizedData, null, 2));

      // Verificar se há dados para atualizar
      if (Object.keys(sanitizedData).length === 0) {
        console.error('❌ Nenhum dado válido para atualizar');
        return { success: false, error: 'Nenhum dado válido para atualizar' };
      }

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, sanitizedData);

      console.log('✅ Firestore atualizado com sucesso');
      
      // Atualizar estado local
      const updatedUser = { ...user, ...sanitizedData };
      setUser(updatedUser);
      console.log('✅ Estado local atualizado');

      return { success: true };
    } catch (error: any) {
      console.error('❌ ERRO CRÍTICO ao atualizar usuário:', error);
      console.error('❌ Código do erro:', error.code);
      console.error('❌ Mensagem do erro:', error.message);
      console.error('❌ Stack completo:', error.stack);
      
      let errorMessage = 'Erro ao atualizar perfil';
      
      // Mensagens mais específicas baseadas no código do erro
      if (error.code === 'permission-denied') {
        errorMessage = 'Permissão negada. Verifique as regras do Firestore.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Documento do usuário não encontrado.';
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // Deletar conta
  async function deleteAccount() {
    try {
      if (!user || !auth.currentUser) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Deletar documento do Firestore
      await deleteDoc(doc(db, 'users', user.uid));

      // Deletar usuário do Firebase Auth
      await firebaseDeleteUser(auth.currentUser);

      setUser(null);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      
      let errorMessage = 'Erro ao deletar conta';
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por segurança, faça login novamente antes de deletar a conta';
      }

      return { success: false, error: errorMessage };
    }
  }

  // Resetar senha
  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      
      let errorMessage = 'Erro ao enviar email';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email não encontrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }

      return { success: false, error: errorMessage };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        updateUser,
        deleteAccount,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}