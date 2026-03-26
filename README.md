# Catálogo E-commerce — Laravel + React + MySQL (Docker)

Teste técnico: API REST em **Laravel** (Service & Repository, API Resources, **Laravel Sanctum**), frontend **React (Vite)**, banco **MySQL**, tudo orquestrado com **Docker Compose**.

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
| `backend/.env` | **Laravel** (APP_KEY, DB_*, Sanctum, etc.) |

### Dois arquivos `.env`

1. **Raiz do projeto** — copie o exemplo e ajuste portas se precisar:

   ```bash
   cp .env.example .env
   ```

   Contém apenas `DB_*`, `APP_PORT`, `FRONTEND_PORT` e `VITE_API_URL` para o Docker Compose.

2. **Backend Laravel** — na primeira vez (ou após clonar sem `backend/.env`):

   ```bash
   cp backend/.env.example backend/.env
   ```

   Dentro do container o MySQL é alcançado em `DB_HOST=mysql` e `DB_PORT=3306`. Para rodar `php artisan` **no host** (sem Docker), use `DB_HOST=127.0.0.1` e `DB_PORT=3307` (porta publicada do MySQL).

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

Valores alteráveis em `.env`: `APP_PORT`, `FRONTEND_PORT`, `DB_PORT`, `VITE_API_URL`.

**Importante:** o navegador chama a API em **`VITE_API_URL`** (ex.: `http://localhost:8000`). Mantenha igual à URL onde o Nginx do Laravel responde no seu host.

### Node na raiz (opcional)

Serviço com profile `tools` para rodar comandos Node na raiz do repositório (ex.: `npm install` de ferramentas):

```bash
docker compose --profile tools run --rm node bash
```

## Testes automatizados (backend)

```bash
docker compose exec backend php artisan test
```

## Arquitetura (resumo)

- **API:** rotas em `backend/routes/api.php`.
- **Padrões:** **Repository** (acesso a dados) + **Service** (regras/orquestração); controllers finos.
- **Respostas:** **API Resources** (`JsonResource`) com envelope `data`; listagens paginadas com `links` e `meta`.
- **Autenticação:** **Laravel Sanctum** — token pessoal (`Authorization: Bearer …`); não é JWT, mas atende ao requisito de token da API.
- **Frontend:** axios com interceptor; token em `localStorage`.

## Publicar no GitHub / GitLab / Bitbucket

1. Crie um repositório **vazio** (sem README) no provedor.
2. Na máquina local:

   ```bash
   git init
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git add .
   git commit -m "Adiciona catálogo e-commerce com Docker"
   git push -u origin main
   ```

3. **Nunca** faça commit de `.env` com segredos reais — o `.gitignore` já ignora `.env`. Revise antes do push.

## Checklist de entrega (QA — edital)

Marque ao validar antes de enviar o teste.

### Docker

- [x] `docker compose up -d` sobe **mysql**, **backend**, **nginx**, **frontend** sem erro.
- [x] Migrações e seed executam conforme seção acima.

### Backend (API)

- [x] `GET /api/products` — listagem paginada.
- [x] `GET /api/products/{id}` — detalhe; 404 se inválido.
- [x] `GET /api/products?category={id}` — filtro por categoria.
- [x] `GET /api/products?search={query}` — busca em nome/descrição.
- [x] `GET /api/categories` — lista categorias.
- [x] `POST /api/register` e `POST /api/login` — retorno com token utilizável.
- [x] `POST/PUT/PATCH/DELETE` em produtos e categorias — **apenas com** `Authorization: Bearer` (Sanctum).

### Frontend

- [x] Listagem com imagem, nome, descrição, preço; paginação; filtro de categoria; busca.
- [x] Página de detalhe do produto.
- [x] Cadastro e login; token persistido e enviado nas requisições protegidas.

### Qualidade

- [x] Código organizado (Service/Repository, Resources).
- [x] README permite reproduzir o projeto só com este arquivo.

---

## Licença

MIT (ajuste conforme o repositório final).
