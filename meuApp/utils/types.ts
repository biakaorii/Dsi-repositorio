// Interface para representar um livro (básico, apenas para referência)
export interface Book {
  id: string;
  title: string;
  author: string;
  img?: string;
  likes?: number;
  [key: string]: any; // para campos adicionais do dataset
}

// Interface para representar uma estante (shelf)
export interface Shelf {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  books: Book[]; // Array de objetos livro completos
}

// Response type para operações de estante
export interface ShelfResponse {
  success: boolean;
  message: string;
  data?: Shelf | Shelf[] | Book[];
}
