// contexts/LivrosContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/config/firebaseConfig";
import { supabase } from "@/config/supabaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

export type Livro = {
  id: string;
  titulo: string;
  autor: string;
  genero?: string;
  paginas?: number;
  editora?: string;
  anoLancamento?: number;
  capaUri?: string;
  descricao?: string;
  ownerId: string;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
};

type LivrosContextData = {
  livros: Livro[];
  carregandoLivros: boolean;
  adicionarLivro: (livro: Livro) => Promise<void>;
  atualizarLivro: (livro: Livro) => Promise<void>;
  removerLivro: (livroId: string) => Promise<void>;
  recarregarLivros: () => Promise<void>;
};

const LivrosContext = createContext<LivrosContextData | undefined>(undefined);
const STORAGE_KEY = "@meuapp_livros";

interface LivrosProviderProps {
  children: ReactNode;
  userId?: string;
}

export function LivrosProvider({ children, userId }: LivrosProviderProps) {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregandoLivros, setCarregandoLivros] = useState(true);

  const carregarDoStorage = useCallback(async () => {
    try {
      setCarregandoLivros(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLivros(JSON.parse(stored));
      } else {
        setLivros([]);
      }
    } catch (error) {
      console.error("Erro ao carregar livros salvos:", error);
    } finally {
      setCarregandoLivros(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      setCarregandoLivros(true);
      try {
        // Buscar TODOS os livros (não apenas do usuário atual)
        const q = query(collection(db, "books"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const remote: Livro[] = snapshot.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
          setLivros(remote);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remote)).catch(() => {});
          setCarregandoLivros(false);
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error("Erro ao escutar livros remotos:", error);
        carregarDoStorage();
      }
    } else {
      carregarDoStorage();
    }
  }, [userId, carregarDoStorage]);

  const atualizarLista = async (updater: (lista: Livro[]) => Livro[]) => {
    let novaLista: Livro[] = [];
    setLivros((prev) => {
      novaLista = updater(prev);
      return novaLista;
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
  };

  const adicionarLivro = async (livro: Livro) => {
    try {
      await atualizarLista((prev) => [livro, ...prev]);

      if (userId) {
        const livroToSave = { ...livro } as any;

        if (livro.capaUri && !livro.capaUri.startsWith("http")) {
          try {
            const fileName = livro.capaUri.split("/").pop();
            const fileExt = fileName?.split(".").pop() || "jpg";
            const filePath = `books/${livro.ownerId}/${livro.id}/cover.${fileExt}`;

            const response = await fetch(livro.capaUri);
            const blob = await response.blob();
            const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as ArrayBuffer);
              reader.onerror = reject;
              reader.readAsArrayBuffer(blob);
            });

            const { error: uploadError } = await supabase.storage
              .from("photos")
              .upload(filePath, arrayBuffer, {
                contentType: `image/${fileExt}`,
                upsert: true,
              });

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from("photos")
                .getPublicUrl(filePath);
              livroToSave.capaUri = publicUrlData.publicUrl;
            } else {
              console.warn("Upload de capa falhou:", uploadError.message || uploadError);
            }
          } catch (err) {
            console.error("Erro ao fazer upload da capa:", err);
          }
        }

        await setDoc(doc(db, "books", livro.id), livroToSave);
      }
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
      throw error;
    }
  };

  const atualizarLivro = async (livroAtualizado: Livro) => {
    try {
      await atualizarLista((prev) =>
        prev.map((livro) => (livro.id === livroAtualizado.id ? livroAtualizado : livro))
      );

      if (userId) {
        const livroToSave = { ...livroAtualizado } as any;

        if (livroAtualizado.capaUri && !livroAtualizado.capaUri.startsWith("http")) {
          try {
            const fileName = livroAtualizado.capaUri.split("/").pop();
            const fileExt = fileName?.split(".").pop() || "jpg";
            const filePath = `books/${livroAtualizado.ownerId}/${livroAtualizado.id}/cover.${fileExt}`;

            const response = await fetch(livroAtualizado.capaUri);
            const blob = await response.blob();
            const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as ArrayBuffer);
              reader.onerror = reject;
              reader.readAsArrayBuffer(blob);
            });

            const { error: uploadError } = await supabase.storage
              .from("photos")
              .upload(filePath, arrayBuffer, {
                contentType: `image/${fileExt}`,
                upsert: true,
              });

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from("photos")
                .getPublicUrl(filePath);
              livroToSave.capaUri = publicUrlData.publicUrl;
            } else {
              console.warn("Upload de capa falhou:", uploadError.message || uploadError);
            }
          } catch (err) {
            console.error("Erro ao fazer upload da capa:", err);
          }
        }

        await setDoc(doc(db, "books", livroAtualizado.id), livroToSave);
      }
    } catch (error) {
      console.error("Erro ao atualizar livro:", error);
      throw error;
    }
  };

  const removerLivro = async (livroId: string) => {
    try {
      await atualizarLista((prev) => prev.filter((livro) => livro.id !== livroId));

      if (userId) {
        await deleteDoc(doc(db, "books", livroId));

        try {
          const listPath = `books/${userId}/${livroId}`;
          const { data: files, error: listError } = await supabase.storage.from("photos").list(listPath);
          if (!listError && files && files.length > 0) {
            const filesToDelete = files.map((f: any) => `${listPath}/${f.name}`);
            const { error: deleteError } = await supabase.storage.from("photos").remove(filesToDelete);
            if (deleteError) console.warn("Erro ao deletar arquivos da capa:", deleteError.message || deleteError);
          }
        } catch (err) {
          console.error("Erro ao remover capa do Supabase:", err);
        }
      }
    } catch (error) {
      console.error("Erro ao remover livro:", error);
      throw error;
    }
  };

  return (
    <LivrosContext.Provider
      value={{
        livros,
        carregandoLivros,
        adicionarLivro,
        atualizarLivro,
        removerLivro,
        recarregarLivros: carregarDoStorage,
      }}
    >
      {children}
    </LivrosContext.Provider>
  );
}

export function useLivros() {
  const context = useContext(LivrosContext);
  if (!context) {
    throw new Error("useLivros deve ser usado dentro de LivrosProvider");
  }
  return context;
}
