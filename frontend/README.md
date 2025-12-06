# Frontend - Sanca Brechó

Este diretório contém a aplicação web do projeto **Sanca Brechó**, desenvolvida em Next.js (React).

## ⬇️ Baixando o Projeto e Dependências

1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado (recomendamos usar o nvm).
2. Acesse o diretório do *frontend* e instale as dependências:
   ```sh
   cd frontend
   npm install
   ```

### Atualizando o Next.js

Para atualizar o Next.js para a versão mais recente, execute o seguinte comando nesse diretório:
```
npx @next/codemod@canary upgrade latest
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend (`/frontend/.env`) seguindo o padrão do `.env.example`.

*Os dados desse arquivo vêm do Firebase. Durante o desenvolvimento eles podem ser encontrados no ClickUp do projeto. Solicite o acesso ao ClickUp se necessário.*

**Não compartilhe nem faça commit destes arquivos.**

## 🏃‍♂️ Rodando o Frontend

Para iniciar o frontend:
```sh
npm run dev
```
Acesse em [localhost:3000](http://localhost:3000).

Para parar, use `ctrl + c` no terminal.

## Contribuindo

Veja o README principal para mais informações sobre o projeto e como contribuir.