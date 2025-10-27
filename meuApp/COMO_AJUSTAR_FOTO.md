# 🎯 Como Funciona o Editor de Fotos de Perfil

## ✨ O que acontece quando você clica em "Escolher e Ajustar Foto"

### Passo a Passo

1. **Clique no botão** "Escolher e Ajustar Foto"
2. **Galeria abre** mostrando suas fotos
3. **Selecione uma foto**
4. **✨ EDITOR AUTOMÁTICO ABRE** ← Aqui você ajusta!
5. **Ajuste a foto** como quiser
6. **Confirme** a seleção
7. **Preview aparece** com badge verde
8. **Salve** para fazer upload

## 📱 Como Usar o Editor Nativo

### No iOS (iPhone/iPad)

Quando você seleciona uma foto, o editor abre automaticamente com:

#### Controles Disponíveis:
- 🔍 **Zoom**: Pinça com dois dedos (abrir = zoom in, fechar = zoom out)
- 👆 **Mover**: Arraste a imagem com um dedo
- 🖼️ **Enquadrar**: Arraste os cantos da moldura quadrada
- ↔️ **Rotacionar**: Gire com dois dedos (se a foto estiver torta)

#### Botões:
- **Cancel**: Volta para a galeria
- **Choose**: Confirma a foto ajustada

```
┌─────────────────────────────┐
│  ← Cancel    Choose →       │
├─────────────────────────────┤
│  ┌─────────────────────┐    │
│  │                     │    │
│  │   ┌───────────┐     │    │
│  │   │           │     │    │ ← Área da foto
│  │   │   FOTO    │     │    │
│  │   │           │     │    │
│  │   └───────────┘     │    │ ← Moldura quadrada
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  Move and Scale             │ ← Instruções
└─────────────────────────────┘
```

### No Android

O editor Android funciona assim:

#### Controles:
- 🔍 **Zoom**: Botões +/- ou pinça com dois dedos
- 👆 **Mover**: Arraste a imagem
- ✂️ **Recortar**: Ajuste as bordas da área de corte
- 🔄 **Girar**: Botão de rotação (se disponível)

#### Botões:
- **Cancelar / Back**: Volta sem salvar
- **OK / Done / Concluir**: Confirma o ajuste

```
┌─────────────────────────────┐
│  [+]  [OK]  [-]  [Girar]    │ ← Ferramentas
├─────────────────────────────┤
│                             │
│     ┌───────────────┐       │
│     │               │       │
│     │     FOTO      │       │ ← Área de corte
│     │               │       │
│     └───────────────┘       │
│                             │
│  Arraste para mover         │
└─────────────────────────────┘
```

## 🎨 Exemplo de Ajuste

### Cenário: Foto de corpo inteiro, mas quer mostrar só o rosto

**Antes do ajuste:**
```
┌───────────────┐
│   🌤️ Céu     │
│               │
│   😊 Rosto    │
│   👔 Corpo    │
│   👖 Pernas   │
│               │
└───────────────┘
```

**Durante o ajuste (com zoom e reposição):**
```
┌───────────────┐
│ ┌─────────┐   │ ← Moldura quadrada
│ │         │   │
│ │ 😊 Zoom │   │ ← Rosto em destaque
│ │ no rosto│   │
│ └─────────┘   │
│               │
└───────────────┘
```

**Resultado final (círculo no perfil):**
```
    ┌─────┐
   │  😊  │ ← Perfeito!
    └─────┘
```

## 🔧 Dicas para Melhor Resultado

### ✅ Faça:
- Use fotos com **boa iluminação**
- Centralize seu **rosto** na moldura
- Use **zoom** para destacar o que importa
- Ajuste até ficar **satisfeito**

### ❌ Evite:
- Fotos muito **escuras**
- Imagens **borradas** ou tremidas
- Fotos com **muitas pessoas** (dificulta o enquadramento)
- Imagens muito **pequenas** (ficam pixeladas)

## 🐛 Problemas Comuns

### "O editor não apareceu"

**Possíveis causas:**
1. **Emulador**: Alguns emuladores não têm editor completo
   - ✅ Solução: Teste em **dispositivo real**

2. **Permissões**: App não tem acesso à galeria
   - ✅ Solução: Permita acesso quando solicitado

3. **Versão do SO**: Muito antiga
   - ✅ Solução: Atualize o sistema operacional

### "Não consigo fazer zoom"

- **iOS**: Use dois dedos (pinça)
- **Android**: Use botões +/- ou pinça

### "A foto ficou cortada errada"

- Clique em **"Escolher e Ajustar Foto"** novamente
- Reajuste a posição e zoom
- Confirme novamente

## 📊 Log de Debug

Para ver o que está acontecendo nos bastidores, abra o console:

```javascript
🔵 Abrindo galeria com editor...
  ↓
🔵 Resultado: { canceled: false, hasAssets: true }
  ↓
✅ Imagem selecionada e ajustada!
  ↓
Toast: "Foto Selecionada! ✓"
```

Se aparecer `⚠️ Usuário cancelou a seleção`, significa que você clicou em "Cancel/Cancelar".

## 🎓 Testando

### Teste Básico:
1. Abra o app
2. Vá para "Editar Perfil"
3. Clique em "Escolher e Ajustar Foto"
4. Selecione qualquer foto
5. **Verifique se o editor abre**
6. Ajuste a foto
7. Confirme
8. Veja o preview com badge verde ✓

### Teste Completo:
1. Escolha uma foto de corpo inteiro
2. Use zoom para focar no rosto
3. Reposicione arrastando
4. Confirme
5. Veja no preview
6. Clique em "Salvar"
7. Aguarde upload
8. Volte ao perfil
9. ✅ Sua foto está lá!

## 🚀 Próximos Passos

Se o editor nativo não funcionar bem no seu dispositivo, posso implementar:

1. **Editor Customizado** com mais controles visuais
2. **Opção de tirar foto** direto pela câmera
3. **Filtros** e ajustes de cor
4. **Rotação manual** mais intuitiva

Basta me avisar!

## 📞 Suporte

Se o editor não aparecer após seguir todos os passos:
1. Verifique os logs no console (procure por 🔵 e ❌)
2. Teste em dispositivo real (não emulador)
3. Confirme que `allowsEditing: true` está no código
4. Me avise que posso implementar solução alternativa!
