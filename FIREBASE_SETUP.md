# Configuração do Firebase para Upload de Imagens

## Pré-requisitos

1. Conta no Firebase Console
2. Firebase SDK já instalado (✅ concluído)

## Configuração

### 1. Criar projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga o assistente de criação

### 2. Configurar Storage

1. No painel do projeto, vá em "Storage"
2. Clique em "Começar"
3. Escolha o modo de produção ou teste (recomendo teste para desenvolvimento)
4. Escolha a localização (recomendo us-central1 para menor latência)

### 3. Configurar regras de segurança

No Storage, vá em "Rules" e configure:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir upload e leitura de avatars de usuários autenticados
    match /users/avatars/{allPaths=**} {
      allow read: if true; // Imagens públicas para visualização
      allow write: if request.auth != null; // Apenas usuários autenticados podem fazer upload
    }
  }
}
```

### 4. Obter configurações do projeto

1. No painel do projeto, vá em "Configurações do projeto" (ícone de engrenagem)
2. Na aba "Geral", role até "Seus aplicativos"
3. Clique no ícone "</>" para adicionar um app web
4. Registre o app e copie as configurações

### 5. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Database (sua URL existente)
DATABASE_URL="sua_database_url_aqui"
```

## Funcionalidades Implementadas

### Upload de Imagem
- ✅ Validação de tipo de arquivo (JPEG, PNG, WebP)
- ✅ Validação de tamanho (máximo 5MB)
- ✅ Upload seguro para Firebase Storage
- ✅ Atualização automática no banco de dados
- ✅ Remoção da imagem anterior
- ✅ Feedback visual de carregamento
- ✅ Tratamento de erros

### Interface do Usuário
- ✅ Botão "Editar foto" com ícone de câmera
- ✅ Preview da imagem atual
- ✅ Indicador de loading durante upload
- ✅ Mensagens de erro
- ✅ Atualização em tempo real após upload

## Estrutura de Arquivos Criados

```
src/
├── lib/
│   ├── firebase.ts              # Configuração do Firebase
│   ├── uploadImage.ts           # Funções de upload e delete
│   └── actions/
│       └── updateUserImage.ts   # Server action para atualizar imagem
└── components/
    └── SettingsModal.tsx        # Modal atualizado com upload
```

## Como Usar

1. Configure as variáveis de ambiente
2. O usuário clica em "Editar foto" no modal de configurações
3. Seleciona uma imagem
4. A imagem é validada, enviada para o Firebase e salva no banco
5. A interface é atualizada automaticamente

## Segurança

- ✅ Validação de tipo e tamanho de arquivo
- ✅ Upload apenas para usuários autenticados
- ✅ Nomenclatura única de arquivos (userId + timestamp)
- ✅ Remoção automática de imagens antigas
- ✅ Tratamento seguro de erros
