**Resumo Rápido**
- **Contexto**: Projeto full-stack — backend Node/Express com MySQL e frontend Expo (React Native). Serviços se comunicam via REST JSON em `http://localhost:3000/api` durante desenvolvimento.

**Arquitetura & Fluxo**
- **Backend**: `backend/server.js` monta prefixos de rota (`/api/users`, `/api/admin`, `/api/tasks`, ...). Rotas ficam em `backend/src/routes/*` e a lógica em `backend/src/controllers/*`.
- **Database**: `backend/src/config/db.js` usa `mysql2/promise` com `createPool`. Sempre use `pool.query` com placeholders (`?`) — padrão já adotado.
- **Autenticação**: JWT usado em `backend/src/controllers/userController.js`. Middleware `authMiddleware.js` e `authorize.js` aplicam proteção por token e roles.
- **Frontend**: Expo app em `frontend/`. Entrada `frontend/App.tsx`. Estado de autenticação em `frontend/src/pages/src/UserContext.tsx` (AsyncStorage com chaves `@loggedUser` e `@authToken`). Chamadas HTTP centralizadas em `frontend/src/services/api.js` (variável `BASE_URL`).

**Comandos de desenvolvimento**
- **Backend (local)**:
  - instalar: `cd backend; npm install`
  - rodar: `cd backend; npm start` (executa `node server.js`).
- **Frontend (Expo)**:
  - instalar: `cd frontend; npm install`
  - rodar: `cd frontend; npm start` (ou `npm run android` / `npm run ios`).

**Variáveis de ambiente essenciais**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` — usadas por `backend/src/config/db.js`.
- `JWT_SECRET` — usado ao assinar tokens no `userController`.
- `PORT` — porta do servidor (padrão 3000).

**Padrões e convenções do projeto**
- **Organização de responsabilidades**: rotas apenas registram endpoints (`routes/*`); controllers contêm lógica e interagêm com `pool`.
- **Erros e respostas**: controllers retornam objetos JSON com `message` em erros; para conflitos de email usam `ER_DUP_ENTRY` (ver `userController.registerUser`). Mantenha esse padrão ao adicionar novos endpoints.
- **Autorização por roles**: usar `authorize(['ALUNO'])` (por exemplo) antes do controller quando for necessário limitar acesso por role.
- **SQL parameterizado**: use sempre `?` para valores e passe array de parâmetros para `pool.query` (ex.: `pool.query('SELECT * FROM users WHERE email = ?', [email])`).

**Frontend padrões e pontos importantes**
- **Token e autenticação**: `UserContext` guarda `token` e `user` em AsyncStorage; componentes consomem `useUser()` para obter `token` e `login()`/`logout()`.
- **API helpers inconsistente**: `frontend/src/services/api.js` mistura duas abordagens:
  - algumas funções aceitam `token` como parâmetro;
  - outras chamam `createAuthHeaders()` (essa função NÃO está definida no repositório).
  Recomenda-se, ao modificar `api.js`, ou (A) padronizar para passar `token` vindo de `useUser()`, ou (B) implementar `createAuthHeaders()` que leia `@authToken` do `AsyncStorage`.
- **BASE_URL**: atualmente `http://localhost:3000/api`. Em emuladores Android/iOS e dispositivos físicos, ajuste para o IP da máquina dev quando necessário.

**Como adicionar um novo endpoint (backend)**
- 1) Criar arquivo de rota em `backend/src/routes/newXxxRoutes.js` e exportar `router`.
- 2) Criar controller correspondente em `backend/src/controllers/newXxxController.js` que use `const { pool } = require('../config/db');` e `pool.query`.
- 3) Proteger rota com `authMiddleware` e `authorize` quando necessário.
- 4) Registrar em `backend/server.js`: `app.use('/api/new', newXxxRoutes);`

**Exemplo rápido (registro/login)**
- Backend: `POST /api/users/register` — ver `backend/src/controllers/userController.registerUser`.
- Frontend: `registerUser` em `frontend/src/services/api.js` faz `fetch('${BASE_URL}/users/register', { method: 'POST', body: JSON.stringify(userData) })`.
- Após `login`, o backend retorna `{ token, user }`. Chame `login(user, token)` do `useUser()` para armazenar no AsyncStorage.

**Problemas conhecidos / pontos de atenção**
- `createAuthHeaders()` referenciado em `frontend/src/services/api.js` não existe — isso causa exceções se invocado. Antes de rodar, padronize chamadas de API para passar o `token` explicitamente ou implemente o helper.
- Ao executar o app em dispositivo real, `localhost` não resolve — usar IP do host no `BASE_URL`.
- O pool de MySQL depende das variáveis de ambiente; se o `testConnection()` falhar, o servidor não sobe.

**Arquivos-chave (referência rápida)**
- Backend: `backend/server.js`, `backend/src/routes/`, `backend/src/controllers/`, `backend/src/config/db.js`, `backend/src/middleware/authMiddleware.js`.
- Frontend: `frontend/App.tsx`, `frontend/src/pages/src/UserContext.tsx`, `frontend/src/services/api.js`, `frontend/src/pages/` (telas organizadas por papel).

Peça-me para ajustar algo: quer que eu implemente `createAuthHeaders()` ou padronize `api.js` para usar `token` do `useUser()`? Fico à espera do seu feedback para iterar.
