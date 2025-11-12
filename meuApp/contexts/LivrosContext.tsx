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

export type Livro = {
  id: string;
  titulo: string;
  autor: string;
  genero?: string;
  paginas?: number;
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

export function LivrosProvider({ children }: { children: ReactNode }) {
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
    carregarDoStorage();
  }, [carregarDoStorage]);

  const atualizarLista = async (updater: (lista: Livro[]) => Livro[]) => {
    let novaLista: Livro[] = [];
    setLivros((prev) => {
      novaLista = updater(prev);
      return novaLista;
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
  };

  const adicionarLivro = async (livro: Livro) => {
    await atualizarLista((prev) => [livro, ...prev]);
  };

  const atualizarLivro = async (livroAtualizado: Livro) => {
    await atualizarLista((prev) =>
      prev.map((livro) => (livro.id === livroAtualizado.id ? livroAtualizado : livro))
    );
  };

  const removerLivro = async (livroId: string) => {
    await atualizarLista((prev) => prev.filter((livro) => livro.id !== livroId));
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
