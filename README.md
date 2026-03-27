# Catálogo E-commerce — Laravel + React + MySQL (Docker)

Teste técnico: API REST em **Laravel** (Service & Repository, API Resources, **Laravel Sanctum**), frontend **React (Vite)** com **MUI**, banco **MySQL**, orquestrado com **Docker Compose**.

## Pré-requisitos

- **Docker** e **Docker Compose** (plugin `docker compose` v2)
- **Opcional:** Node.js 20+ apenas se for rodar o frontend **fora** do container (ex.: `npm run dev` na pasta `frontend/`)

## Estrutura do repositório

| Pasta / arquivo | Função |
|-----------------|--------|
| `backend/` | Laravel (PHP 8.4), API em `/api/*` |
| `frontend/` | React + Vite + MUI |
| `docker-compose.yml` | MySQL, PHP-FPM, Nginx, frontend |
| `docker/nginx/` | Virtual host Nginx → `public/` do Laravel |
| `.env` (raiz) | Variáveis do **Docker Compose** (portas, DB do MySQL, `VITE_API_URL`) |
| `backend/.env` | **Laravel** (`APP_KEY`, `DB_*`, Sanctum, etc.) |

### Dois arquivos `.env`

1. **Raiz do projeto** — copie o exemplo e ajuste portas se precisar:

   ```bash
   cp .env.example .env
   ```

   Contém `DB_*`, `APP_PORT`, `FRONTEND_PORT` e `VITE_API_URL` para o Docker Compose.

2. **Backend Laravel** — na primeira vez (ou após clonar sem `backend/.env`):

   ```bash
   cp backend/.env.example backend/.env
   ```

   Dentro do container o MySQL é alcançado com `DB_HOST=mysql` e `DB_PORT=3306`. Para rodar `php artisan` **no host** (sem Docker), use `DB_HOST=127.0.0.1` e `DB_PORT=3307` (porta publicada do MySQL no host).

   Se o Laravel reclamar de `APP_KEY` ausente:

   ```bash
   docker compose exec backend php artisan key:generate
   ```

## Subir o ambiente (Docker)

Na raiz do projeto:

```bash
cp .env.example .env
# Garanta backend/.env (ver acima)

docker compose build
docker compose run --rm backend composer install --no-interaction
docker compose up -d
```

O `composer install` é necessário após **clone** (a pasta `backend/vendor` não vai no Git).

Aguarde o MySQL ficar **healthy** e o frontend concluir o `npm ci` (primeira execução pode levar alguns minutos).

### Banco de dados e seed

```bash
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
```

(Opcional) Recriar tudo do zero:

```bash
docker compose exec backend php artisan migrate:fresh --seed --force
```

## URLs e portas (padrão)

| Serviço | URL / porta no host |
|---------|---------------------|
| API / Laravel (Nginx) | http://localhost:8000 |
| Frontend (Vite) | http://localhost:5174 |
| MySQL | `localhost:3307` → container `3306` |

Valores alteráveis em `.env` na raiz: `APP_PORT`, `FRONTEND_PORT`, `DB_PORT`, `VITE_API_URL`.

**Importante:** o navegador chama a API em **`VITE_API_URL`** (ex.: `http://localhost:8000`). Depois de mudar a porta da API, atualize `VITE_API_URL` e reinicie o serviço `frontend` (`docker compose up -d frontend` ou `docker compose restart frontend`).

## Como usar a aplicação

1. Abra o **frontend**: http://localhost:5174 (ou a porta definida em `FRONTEND_PORT`).
2. **Catálogo:** na página inicial (`/`) você vê produtos com imagem, nome, descrição e preço; há **paginação**, **filtro por categoria** e **busca** por texto.
3. **Detalhe do produto:** clique em um produto ou acesse `/products/{id}`.
4. **Cadastro e login:** `/register` e `/login`. Após login, o token fica no `localStorage` e é enviado automaticamente nas requisições protegidas (axios).
5. **Categorias (CRUD):** após autenticar, use **Categorias** no menu (`/categories`) para criar, editar e excluir categorias.
6. **Produtos (criar/editar/excluir):** na home, as ações de escrita exigem usuário logado (API protegida com Sanctum).

### API REST (referência rápida)

Base: `http://localhost:8000/api` (ajuste o host/porta conforme seu `.env`).

| Método | Rota | Autenticação |
|--------|------|----------------|
| GET | `/products` | Não (query: `category`, `search`, paginação) |
| GET | `/products/{id}` | Não |
| GET | `/categories` | Não |
| POST | `/register`, `/login` | Não (throttle aplicado) |
| POST/PUT/PATCH/DELETE | `/products`, `/products/{id}` | Sim — `Authorization: Bearer {token}` |
| POST/PUT/PATCH/DELETE | `/categories`, `/categories/{id}` | Sim — `Authorization: Bearer {token}` |
| POST | `/logout` | Sim |

Exemplo com token:

```bash
curl -s -H "Authorization: Bearer SEU_TOKEN" \
  -H "Accept: application/json" \
  http://localhost:8000/api/products
```

## Comandos úteis (Docker)

```bash
# Ver logs
docker compose logs -f

# Parar tudo
docker compose down

# Parar e remover volumes do MySQL (apaga dados locais)
docker compose down -v

# Artisan / Composer dentro do backend
docker compose exec backend php artisan ...
docker compose exec backend composer ...

# Frontend: dependências já vêm do build; em desenvolvimento o volume monta o código
docker compose restart frontend nginx backend
```

### Node na raiz (opcional)

Serviço com profile `tools` para rodar comandos Node na raiz do repositório:

```bash
docker compose --profile tools run --rm node bash
```

### Frontend no host (sem rebuild do container)

Com MySQL/API já no ar:

```bash
cd frontend
cp .env.example .env.local
# Ajuste VITE_API_URL para a URL da API no seu navegador
npm ci
npm run dev -- --host
```

## Testes automatizados (backend)

```bash
docker compose exec backend php artisan test
```

## Arquitetura (resumo)

- **API:** rotas em `backend/routes/api.php`.
- **Padrões:** **Repository** (dados) + **Service** (regras); controllers enxutos.
- **Respostas:** **API Resources** (`JsonResource`) com envelope `data`; listagens paginadas com `links` e `meta`.
- **Autenticação:** **Laravel Sanctum** — token pessoal (`Authorization: Bearer …`).
- **Frontend:** axios com interceptor; token em `localStorage`.

## Segurança e versionamento

- Não faça commit de `.env` com segredos reais — o `.gitignore` já ignora `.env`; revise antes de push.
- Mantenha `backend/.env.example` e `.env.example` na raiz atualizados quando adicionar variáveis novas.

## Licença

MIT (ajuste conforme o repositório).

## Telas

<img width="1886" height="818" alt="Catálogo — listagem de produtos" src="https://github.com/user-attachments/assets/1ce08e50-5f16-4b85-9f16-50a6f336655d" />
<img width="1882" height="609" alt="Interface do projeto" src="https://github.com/user-attachments/assets/74dd6fff-68dd-4998-a9b4-c80a446fb63a" />
<img width="1914" height="621" alt="Interface do projeto" src="https://github.com/user-attachments/assets/2eca6f6c-cb50-4c6d-9b1b-f2388e989c8c" />
<img width="1900" height="775" alt="Interface do projeto" src="https://github.com/user-attachments/assets/74d6c879-09f8-4c94-a5b6-880b92138d44" />
