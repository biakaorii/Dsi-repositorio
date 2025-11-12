# 🔥 Verificar Regras do Firestore

## Problema: "Não foi possível salvar as alterações"

Este erro geralmente ocorre quando as **regras do Firestore** não permitem a atualização dos documentos.

## ✅ PASSO 1: Verificar Regras Atuais

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Firestore Database** (no menu lateral)
4. Clique na aba **Regras** (Rules)

## ✅ PASSO 2: Regras Recomendadas

Cole estas regras no Firestore (substituindo as existentes):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para coleção de usuários
    match /users/{userId} {
      // Permitir leitura para usuários autenticados
      allow read: if request.auth != null;
      
      // Permitir criação apenas se for o próprio usuário
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Permitir atualização apenas se for o próprio usuário
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // Permitir deleção apenas se for o próprio usuário
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para outras coleções (reviews, favorites, etc)
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## ✅ PASSO 3: Publicar as Regras

Clique em **Publicar** (Publish) para aplicar as novas regras.

## ✅ PASSO 4: Testar Novamente

1. Abra seu app
2. Tente editar o perfil novamente
3. Verifique os logs no console do navegador ou terminal

## 🔍 Logs para Verificar

Quando você tentar salvar o perfil, procure por estas mensagens no console:

### ✅ Sucesso:
```
🔵 Atualizando usuário no Firestore...
🔵 ID do usuário: [seu-user-id]
🔵 Dados a atualizar: {...}
✅ Firestore atualizado com sucesso
✅ Estado local atualizado
✅ Perfil atualizado com sucesso!
```

### ❌ Erro de Permissão:
```
❌ ERRO CRÍTICO ao atualizar usuário: FirebaseError
❌ Código do erro: permission-denied
❌ Mensagem do erro: Missing or insufficient permissions
```

Se aparecer `permission-denied`, o problema são as regras do Firestore.

## 🆘 Solução Alternativa (Temporária)

Se precisar testar rapidamente, use estas regras TEMPORÁRIAS (ATENÇÃO: Inseguras!):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ APENAS PARA TESTES!
    }
  }
}
```

**IMPORTANTE**: Estas regras permitem que qualquer pessoa leia/escreva no seu banco! 
Use APENAS para testes e volte para as regras seguras depois!

## 📝 Outros Possíveis Erros

### Erro: "Documento do usuário não encontrado"
- Verifique se o usuário está autenticado
- Confirme que o documento existe no Firestore em `users/[userId]`

### Erro: "Dados inválidos fornecidos"
- Verifique se não está tentando salvar `undefined` em campos
- O código foi atualizado para filtrar campos vazios

### Erro: "Usuário não autenticado"
- Faça logout e login novamente
- Verifique se o Firebase Auth está funcionando

## 🎯 Próximos Passos

1. **Atualize as regras do Firestore**
2. **Tente salvar o perfil novamente**
3. **Copie os logs do console** e me envie se o erro persistir
4. **Tire um print das regras atuais** se não souber quais estão ativas
