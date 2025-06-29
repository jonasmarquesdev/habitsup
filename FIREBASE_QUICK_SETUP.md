# ⚡ Configuração Rápida do Firebase Storage

## 🚨 Erro: "No default bucket found"

Este erro significa que o Firebase Storage não está configurado. Siga os passos abaixo:

## 📋 Passos para Resolver

### 1. Criar Projeto no Firebase
1. Acesse https://console.firebase.google.com/
2. Clique em "Criar um projeto" 
3. Digite o nome do projeto (ex: "habitup-storage")
4. Desabilite Google Analytics (não é necessário)
5. Clique em "Criar projeto"

### 2. Ativar o Storage
1. No painel lateral, clique em "Storage"
2. Clique em "Começar"
3. **IMPORTANTE**: Escolha "Começar no modo de teste" (regras mais permissivas)
4. Escolha uma localização (recomendo `us-central1`)
5. Clique em "Concluído"

### 3. Obter as Configurações
1. No painel lateral, clique no ícone de engrenagem ⚙️
2. Clique em "Configurações do projeto"
3. Role até "Seus aplicativos" 
4. Clique no ícone `</>` (adicionar app web)
5. Digite um nome (ex: "habitup-web")
6. **NÃO marque** "Configurar o Firebase Hosting"
7. Clique em "Registrar app"
8. **COPIE** as configurações que aparecem

### 4. Configurar o .env.local
Substitua as configurações no arquivo `.env.local`:

```bash
# Firebase Configuration (substitua pelos seus valores)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Database (mantenha a sua URL existente)
DATABASE_URL="sua_database_url_atual"
```

### 5. Configurar Regras de Segurança (Opcional)
No Firebase Console, vá em Storage > Rules e cole:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/avatars/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 6. Reiniciar o Servidor
```bash
npm run dev
```

## ✅ Como Testar
1. Abra o modal de configurações
2. Clique em "Editar foto"
3. Selecione uma imagem
4. Se configurado corretamente, a imagem será enviada

## 🆘 Problemas Comuns

### "Firebase: Configurações faltando"
- Verifique se todas as variáveis estão no `.env.local`
- Certifique-se que não há espaços em branco
- Reinicie o servidor após alterar o `.env.local`

### "storageBucket não pode estar vazio"
- A variável `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` deve terminar com `.appspot.com`
- Exemplo: `meu-projeto.appspot.com`

### Imagem não aparece após upload
- Verifique se as regras do Storage permitem leitura pública
- Teste a URL da imagem diretamente no navegador

## 📞 Precisa de Ajuda?
Se ainda tiver problemas, me envie:
1. O erro exato que aparece no console
2. Uma captura de tela das configurações do Firebase
3. O conteúdo do seu `.env.local` (sem mostrar os valores reais)
