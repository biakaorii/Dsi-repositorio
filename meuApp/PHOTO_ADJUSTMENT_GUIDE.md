# 📸 Guia de Ajuste de Foto de Perfil

## Como Funciona o Ajuste de Imagem

Quando o usuário seleciona "Alterar Foto", ele pode ajustar a imagem antes de confirmar.

### ✨ Recursos Implementados

#### 1. **Editor Nativo do Sistema**
O `expo-image-picker` usa o editor nativo do dispositivo:
- **iOS**: Editor integrado com gestos de pinça para zoom e arrasto
- **Android**: Editor nativo com controles de zoom e posicionamento

#### 2. **Formato Circular Automático**
```typescript
aspect: [1, 1]  // Força proporção 1:1 (quadrado)
```
- A imagem é cortada em formato quadrado
- No app, é exibida em círculo com `borderRadius: 60`
- O usuário vê exatamente como ficará no perfil

#### 3. **Controles do Editor**

**No iOS:**
- 🔍 Pinça com dois dedos: Zoom in/out
- 👆 Arraste: Reposiciona a imagem
- ✂️ Cantos: Ajusta o enquadramento
- ✅ Botão "Choose": Confirma a seleção

**No Android:**
- 🔍 Botões +/- ou pinça: Zoom
- 👆 Arraste: Reposiciona
- ✂️ Bordas: Ajusta área de corte
- ✅ Botão "OK" ou "Done": Confirma

#### 4. **Preview Interativo**

Após selecionar a foto:
```
┌─────────────────────┐
│  ┌───────────────┐  │
│  │               │  │
│  │   ┌─────┐     │  │
│  │   │ ✓   │     │  │  ← Badge verde indica foto nova
│  │   └─────┘     │  │
│  │   (Foto)      │  │
│  └───────────────┘  │
│                     │
│  [📷 Alterar Foto]  │
│                     │
│  "A foto será       │
│   ajustada..."      │
└─────────────────────┘
```

- ✅ Badge verde: Mostra que há uma nova foto selecionada
- 🔄 Botão "Alterar Foto": Permite escolher outra imagem
- 💾 Botão "Salvar" (topo): Confirma e faz upload

### 🎯 Fluxo Completo

```
1. Usuário clica "Alterar Foto"
   ↓
2. Sistema pede permissão da galeria
   ↓
3. Usuário seleciona uma foto
   ↓
4. Editor nativo abre automaticamente
   │
   ├─→ Usuário ajusta zoom
   ├─→ Usuário reposiciona
   └─→ Usuário confirma com "Choose/OK"
   ↓
5. Preview atualiza com a foto ajustada
   ↓
6. Badge verde aparece (nova foto)
   ↓
7. Toast: "Foto Selecionada - Clique em Salvar"
   ↓
8. Usuário clica "Salvar" (topo ou botão)
   ↓
9. Upload para Supabase
   ↓
10. Foto aparece no perfil ✅
```

### 🎨 Experiência Visual

#### Antes de Selecionar
```
┌─────────────────┐
│   (👤 Padrão)   │  ← Ícone padrão
│                 │
│ [📷 Alterar]    │
└─────────────────┘
```

#### Após Selecionar (não salvo)
```
┌─────────────────┐
│   ┌─────┐       │
│   │ ✓   │       │  ← Badge verde
│   └─────┘       │
│   (Sua Foto)    │
│                 │
│ [📷 Alterar]    │
│                 │
│ "Clique em      │
│  Salvar..."     │
└─────────────────┘
```

#### Durante Upload
```
┌─────────────────┐
│   (Sua Foto)    │
│                 │
│ [⏳ Enviando]   │  ← Botão desabilitado
└─────────────────┘
```

#### Após Salvar
```
┌─────────────────┐
│   (Sua Foto)    │  ← Sem badge (já salva)
│                 │
│ [📷 Alterar]    │
└─────────────────┘
```

### ⚙️ Configurações Técnicas

```typescript
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,              // 🔑 Ativa editor nativo
  aspect: [1, 1],                   // 🔑 Força formato quadrado
  quality: 0.8,                     // 🔑 Compressão 80%
  allowsMultipleSelection: false,   // 🔑 Apenas uma foto
});
```

### 📱 Compatibilidade

- ✅ iOS 11+
- ✅ Android 5.0+
- ✅ Tablets
- ✅ Modo retrato e paisagem

### 🚀 Melhorias Futuras (Opcionais)

Se quiser adicionar recursos avançados:

1. **Editor Personalizado**
   - Biblioteca: `react-native-image-crop-picker`
   - Mais controle sobre UI

2. **Filtros e Efeitos**
   - Biblioteca: `expo-image-manipulator`
   - Aplicar filtros antes do upload

3. **Captura pela Câmera**
   - Adicionar opção: "Tirar Foto" vs "Escolher da Galeria"
   
4. **Limite de Tamanho**
   - Redimensionar imagens muito grandes
   - Prevenir uploads pesados

## 💡 Dicas para o Usuário

Você pode adicionar essas dicas na tela:

- 📌 "Use fotos de boa qualidade"
- 📌 "Centralize seu rosto na imagem"
- 📌 "Evite fotos muito escuras"
- 📌 "Fotos quadradas funcionam melhor"

## 🎓 Para Desenvolvedores

### Testando o Editor

1. Instale o app no dispositivo físico (emuladores podem ter limitações)
2. Vá para "Editar Perfil"
3. Clique em "Alterar Foto"
4. Teste zoom e arrasto
5. Confirme e verifique o preview
6. Salve e veja no perfil

### Debug

Se o editor não aparecer:
```typescript
// Verifique se allowsEditing está true
console.log('Editor habilitado:', result.allowsEditing);

// Verifique se a imagem foi editada
console.log('URI original vs editada:', result.uri);
```

## 📄 Resumo

✅ **Editor nativo** ativado automaticamente  
✅ **Formato circular** garantido  
✅ **Preview em tempo real** antes de salvar  
✅ **Feedback visual** com badge e toasts  
✅ **Ajuste intuitivo** com zoom e arrasto  

A experiência de ajuste está completa e profissional! 🎨
