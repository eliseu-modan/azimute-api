# Nexo CRM API

Backend REST em NestJS 11, Prisma ORM 7 e PostgreSQL. A API usa prefixo `/api/v1`, valida DTOs com `class-validator`, publica documentação Swagger em `/api/docs` e autentica sessões por cookie `HttpOnly`.

## Iniciar localmente

1. Instale Node.js 22 ou superior e PostgreSQL 14 ou superior.
2. Copie `.env.example` para `.env` e defina `DATABASE_URL` com a senha do PostgreSQL.
3. Instale dependências: `npm install`.
4. Gere o client: `npx prisma generate`.
5. Aplique as migrations: `npx prisma migrate deploy`.
6. (Opcional) Defina `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `ADMIN_NAME` para criar o primeiro administrador; execute `npx prisma db seed`.
7. Inicie: `npm run start:dev`.

`docker compose up -d` inicia PostgreSQL; configure `POSTGRES_PASSWORD` antes. Para produção, use HTTPS e `COOKIE_SAME_SITE=None` quando frontend e API estiverem em sites diferentes. Configure também `FRONTEND_URL` para a origem exata do frontend. O frontend deve enviar cookies com `credentials: 'include'`.

## Autenticação e permissões

- `POST /api/v1/auth/login` recebe `email`, `password` e, quando necessário, `workspaceSlug`; cria sessão no cookie `nexo_session`.
- `POST /api/v1/auth/logout`, `GET /api/v1/auth/session` e `POST /api/v1/auth/change-password`.
- `POST /api/v1/auth/forgot-password` responde sem revelar se o usuário existe. A entrega de e-mail para recuperação ainda precisa de um provedor; `POST /api/v1/auth/reset-password` retorna `501` até que esse provedor seja configurado.
- Sessões expiram em 12 horas. Senhas novas usam bcrypt; hashes scrypt legados são migrados ao autenticar com sucesso.
- Dados de CRM são limitados ao workspace da sessão. Rotas administrativas usam funções ADMIN/DEVELOPER conforme o módulo.

## Módulos e rotas

As rotas protegidas exigem a sessão por cookie. Coleções usam paginação `page` e `pageSize` (máximo 100); respostas incluem `{ data, meta }`.

| Módulo | Rotas principais |
| --- | --- |
| Auth | `/auth/*` sessão, login, logout e senha |
| Usuários | `/users` CRUD e função (ADMIN) |
| Empresas e contatos | `/companies`, `/companies/:companyId/contacts` |
| Pipeline e leads | `/pipeline/stages`, `/leads`, `/leads/:id/status`, `/leads/:id/history`, `/leads/:id/convert` |
| Atividades e follow-ups | `/activities`, `/follow-ups` |
| Propostas | `/proposals`, `/proposals/:id/items`, `/proposals/:id/send`, `/proposals/:id/approve`, `/proposals/:id/reject`, `/proposals/:id/pdf` |
| Pesquisa e requisitos | `/surveys`, `/surveys/:id/diagnosis`, `/surveys/:id/suggest-requirements`, `/surveys/:id/approve-suggestions`, `/requirements` |
| Projetos e tarefas | `/projects`, `/projects/:projectId/tasks`, `/tasks` |
| Arquivos | `/files` upload multipart, download e remoção; limite de 10 MB |
| Dashboard e relatórios | `/dashboard`, `/reports/leads`, `/reports/proposals` |
| Configuração e acesso | `/settings`, `/settings/lead-sources`, `/roles`, `/permissions` |
| Notificações e auditoria | `/notifications`, `/audit` (ADMIN/DEVELOPER) |

Consulte `/api/docs` para os métodos, DTOs, parâmetros e formatos de resposta completos. Cada módulo mantém seus DTOs em sua própria pasta `dto/`.

## Banco e migrações

`prisma/schema.prisma` é a fonte dos modelos. A migration `20261024190000_nexo_crm_foundation` acrescenta workspace/membership, sessões e os domínios de pesquisa, requisitos, projetos, tarefas, arquivos, auditoria e configurações; ela também cria o workspace padrão e vincula usuários já existentes a ele. Revise o SQL e faça backup antes de aplicar em um banco com dados existentes. O seed cria papéis e permissões e só cria administrador quando as variáveis acima forem fornecidas.

## Configurações

`DATABASE_URL` é necessário. `FRONTEND_URL` define a origem permitida; `COOKIE_SAME_SITE` aceita `Lax`, `Strict` ou `None`; `UPLOAD_DIR` define armazenamento privado local de arquivos. A API usa o prefixo `/api/v1` e limita tentativas de login a 5 por minuto e chamadas gerais a 120 por minuto por endereço.
