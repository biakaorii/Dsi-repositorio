# Configuração do Supabase Storage para Fotos de Perfil

Este guia explica como configurar o Supabase Storage para permitir que os usuários façam upload de suas fotos de perfil.

## 🎯 Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Projeto criado no Supabase
- Credenciais já configuradas em `config/supabaseConfig.ts`

## 📦 Configuração do Bucket

### 1. Criar o Bucket "photos"

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Clique no botão **New bucket**
5. Configure o bucket:
   - **Name**: `photos`
   - **Public bucket**: ✅ Marque como público (para URLs públicas)
   - Clique em **Create bucket**

### 2. Configurar Políticas de Acesso (RLS Policies)

Para permitir que os usuários façam upload e visualizem suas fotos, você precisa criar políticas de segurança:

#### Política 1: Permitir Upload (INSERT)

1. Na página do Storage, clique no bucket **photos**
2. Vá para a aba **Policies**
3. Clique em **New Policy**
4. Selecione **Custom policy**
5. Configure:
   - **Policy name**: `Allow users to upload their profile photos`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **Policy definition** (using SQL):

```sql
CREATE POLICY "Allow users to upload their profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

Ou use o builder visual:
- **bucket_id** = `photos`
- **name** começa com `auth.uid()/`

#### Política 2: Permitir Leitura (SELECT)

1. Clique em **New Policy** novamente
2. Configure:
   - **Policy name**: `Allow public to view profile photos`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **Policy definition**:

```sql
CREATE POLICY "Allow public to view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');
```

#### Política 3: Permitir Atualização (UPDATE)

1. Clique em **New Policy** novamente
2. Configure:
   - **Policy name**: `Allow users to update their own photos`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: `authenticated`
   - **Policy definition**:

```sql
CREATE POLICY "Allow users to update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Política 4: Permitir Deleção (DELETE)

1. Clique em **New Policy** novamente
2. Configure:
   - **Policy name**: `Allow users to delete their own photos`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **Policy definition**:

```sql
CREATE POLICY "Allow users to delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 🔧 Estrutura de Arquivos no Bucket

As fotos são organizadas da seguinte forma:

```
photos/
├── {userId}/
│   └── profile.jpg (ou .png, .jpeg)
├── {anotherUserId}/
│   └── profile.png
...
```

Cada usuário tem sua própria pasta identificada pelo `uid` do Firebase Auth.

## ✅ Testando a Configuração

1. Abra o aplicativo
2. Faça login com uma conta
3. Vá para **Editar Perfil**
4. Clique em **Alterar Foto**
5. Selecione uma imagem da galeria
6. Clique em **Salvar**
7. Verifique se a foto aparece no perfil

## 🔍 Verificação no Supabase

1. Vá para **Storage** > **photos**
2. Você deve ver uma pasta com o ID do usuário
3. Dentro dela, o arquivo `profile.jpg` (ou similar)
4. Clique na imagem para visualizar
5. Copie a URL pública e acesse no navegador para confirmar que está acessível

## 🚨 Troubleshooting

### Erro: "new row violates row-level security policy"

- Verifique se as políticas de RLS foram criadas corretamente
- Certifique-se de que o bucket está marcado como **público**
- Confirme que o usuário está autenticado

### Erro: "Failed to upload image"

- Verifique a conexão com a internet
- Confirme que o bucket "photos" existe
- Verifique as permissões do app para acessar a galeria

### Imagem não aparece após upload

- Verifique se a URL está sendo salva no Firestore
- Confirme que o bucket está público
- Limpe o cache do app e tente novamente

## 📝 Notas Importantes

- As imagens são comprimidas para qualidade 0.8 antes do upload
- O formato suportado é 1:1 (quadrado)
- O arquivo é sempre sobrescrito (upsert: true)
- Cada usuário pode ter apenas uma foto de perfil por vez
- As URLs são públicas e podem ser acessadas sem autenticação

## 🔐 Segurança

- Apenas usuários autenticados podem fazer upload
- Usuários só podem fazer upload na sua própria pasta
- Qualquer pessoa pode visualizar as fotos (público)
- Não há limite de tamanho configurado (considere adicionar)

## 📚 Referências

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
