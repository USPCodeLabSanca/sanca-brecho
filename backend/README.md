# Backend - Sanca Brechó

Este diretório contém a API do projeto **Sanca Brechó**, desenvolvida em Go.

## ⬇️ Baixando o Projeto e Dependências

1. Certifique-se de ter o [Docker](https://www.docker.com/) instalado (ou Docker Desktop).
2. As dependências restantes do backend são instaladas automaticamente via Docker Compose.

## 🔐 Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do backend (`/backend/.env`) seguindo o padrão do `.env.example`. (Ou copie a partir do ClickUp)

2. Também é necessário o arquivo `credentials.json` do Firebase. Baixe em Configurações do projeto > Contas de serviço > Gerar nova chave privada e coloque em `/backend/credentials.json`.

**Não compartilhe nem faça commit destes arquivos.**

## 🏃‍♂️ Rodando o Backend

Para iniciar o backend: *(Se estiver usando, Docker Desktop deve estar aberto)*
```sh
docker compose up -d
```
O banco de dados e o *pgweb* estarão disponíveis automaticamente. Para acessar o *pgweb*, use [localhost:8081](http://localhost:8081).

Para parar:
```sh
docker compose down
```

## 🏃‍♂️ Rodando o Backend em Produção!

Para buildar o backend em produção:
```sh
docker compose -f docker-compose.prod.yaml build
```

Para iniciar o backend em produção:
```sh
docker compose -f docker-compose.prod.yaml up -d
```

Para parar:
```sh
docker compose -f docker-compose.prod.yaml down
```

**Atenção**
Periodicamente, rodar:
```
docker system prune
```
para descartar imagens desatualizadas e não utilizadas

## Contribuindo

Veja o README principal para mais informações sobre o projeto e como contribuir.