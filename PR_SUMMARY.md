# Pull Request: Sincronizar Cadastro de Livros com Firestore/Supabase

## 📋 Resumo Executivo

Esta PR implementa sincronização remota do cadastro de livros com Firebase Firestore e Supabase Storage, além de reorganizar a UX movendo o botão "Cadastrar" para dentro da aba "Pesquisar".

---

## 🎯 Alterações Principais

### 1️⃣ Sincronização com Firestore/Supabase (`meuApp/contexts/LivrosContext.tsx`)

**O que mudou:**
- Contexto agora recebe `userId` como prop (evita uso de `useAuth` dentro de Provider)
- Ao detectar usuário logado, cria listener `onSnapshot` na coleção Firestore `books`
- Sincroniza livros remotos em tempo real com estado local (também cacheados em AsyncStorage)
- Uploads de capa: detecta URIs locais e faz upload para Supabase Storage, persistindo URL pública
- Deleção: remove documentos Firestore e arquivos Supabase correspondentes

**Funções mantidas:**
- `adicionarLivro(livro: Livro)`
- `atualizarLivro(livroAtualizado: Livro)`
- `removerLivro(livroId: string)`
- `recarregarLivros()`

---

### 2️⃣ Redesign da UX de Cadastro (`meuApp/app/search.tsx`)

**O que mudou:**
- Importa `useAuth` para validar usuário logado
- Botão "Cadastrar" no header da tela (visível apenas se `user` existir)
- Ao clicar: navega para `/cadastroLivro`
- Integra melhor a funcionalidade dentro da flow de busca

---

### 3️⃣ Layout com Wrapper para Contextos (`meuApp/app/_layout.tsx`)

**O que mudou:**
- Criado componente `LivrosProviderWrapper` que usa `useAuth()`
- Passa `userId` extraído do contexto de Auth para o `LivrosProvider`
- Evita erro de "user is not defined" que ocorria antes
- Ordem correta de providers: `AuthProvider` → `LivrosProviderWrapper` → Stack

---

### 4️⃣ Limpeza do BottomNavBar (`meuApp/components/BottomNavBar.tsx`)

**O que mudou:**
- Removido item `{ route: "/cadastroLivro", icon: "add-circle-outline", ... }`
- NavBar mantém 5 itens principais:
  - Home
  - Pesquisar (com botão de cadastro dentro)
  - Comunidades
  - Progresso
  - Usuário

---

## 📊 Commits Incluídos

```
3fc54cbd - feat(navbar): remover 'Cadastrar Livro' do BottomNavBar (movido para aba Pesquisar)
b3ddc525 - feat(livros): sincronizar com Firestore/Supabase via userId prop; botão 'Cadastrar' para usuário logado
26fc6371 - chore: resolve merge leftovers and fix TS issues (perfil, layout)
28f1cd92 - chore: resolve merge conflicts (layout, BottomNavBar, usuario) - keep cadastro remote flow and perfil-usuario
00cac1c1 - fix: add critic-form placeholder and fix select-profile route typing
44ec4d70 - chore: resolve merge conflicts for BottomNavBar, usuario, _layout - preserve Firebase/Supabase flows
4d1fe963 - feat: adicionar fluxo completo de cadastro de livros
```

---

## ✅ Validações Realizadas

- ✅ `npx tsc --noEmit` passou sem erros
- ✅ Sem referências a providers/contextos ausentes
- ✅ Sem ciclos de dependência de hooks
- ✅ Preserva compatibilidade com código existente
- ✅ Commits bem documentados e incrementais

---

## 🔐 Considerações de Segurança

> ⚠️ **Importante para o merge:**
> 
> As seguintes rules do Firestore/Supabase devem estar configuradas antes do merge:
> 
> **Firestore (`books` collection):**
> ```
> match /books/{bookId} {
>   allow read: if request.auth.uid != null;
>   allow create, update: if request.auth.uid == request.resource.data.ownerId;
>   allow delete: if request.auth.uid == resource.data.ownerId;
> }
> ```
> 
> **Supabase Storage (`photos/books/`):**
> ```
> - Usuário autenticado pode fazer upload em `books/{uid}/{*}`
> - Usuário autenticado pode deletar em `books/{uid}/{*}`
> ```

---

## 🚀 Próximos Passos (Pós-Merge)

1. **Testes E2E**: Validar fluxo completo de cadastro/edição/remoção
2. **Error Handling**: Implementar tratamento robusto de falhas de conexão
3. **Retry Logic**: Auto-retry em falhas de upload
4. **Performance**: Otimizar queries Firestore (indexação)
5. **Offline Support**: Melhorar suporte offline com sincronização ao reconectar

---

## 📝 Como Testar Localmente

1. Esteja na branch `teste`
2. Execute: `cd meuApp && npm install` (se necessário)
3. Execute: `npx expo start`
4. Teste os seguintes cenários:
   - Login com usuário
   - Navegue para "Pesquisar" → clique em "Cadastrar"
   - Cadastre um livro com capa
   - Verifique no Firestore se o livro foi criado
   - Verifique no Supabase Storage se a capa foi salva
   - Edite e remova o livro
   - Faça logout e login novamente → livros devem estar lá

---

## 🔗 Referência

- **Issue relacionada**: #19 (feat: cadastro de livros com CRUD)
- **Branch**: `teste` → `main`
- **Último commit local**: `3fc54cbd`

---

**Criado em**: 14 de novembro de 2025  
**Status**: Pronto para revisão por membros do time
