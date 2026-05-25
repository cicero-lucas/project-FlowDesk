# FlowDesk 🎯

Sistema corporativo de gerenciamento de chamados técnicos internos, desenvolvido com **Java Spring Boot** e **Angular**.
<div style="display:flex; gap:6px; justify-content:center;">
  <img src="https://img.shields.io/badge/Java-007396?logo=java&logoColor=white" height="24" />
  <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=white" height="24" />
  <img src="https://img.shields.io/badge/Maven-C71A36?logo=apachemaven&logoColor=white" height="24" />
  <img src="https://img.shields.io/badge/Angular-DD0031?logo=angular&logoColor=white" height="24" />
  <img src="https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white" height="24" />
  <img src="https://img.shields.io/badge/BCrypt-4B8BBE?logo=security&logoColor=white" height="24" />
  <img src="https://img.shields.io/badge/MySQL-00758F?logo=mysql&logoColor=white" height="24" />
</div>

---

## 📋 Descrição

O FlowDesk é uma plataforma completa para abertura, acompanhamento e gerenciamento de chamados técnicos. Oferece controle de acesso por perfil, workflow de status, histórico de alterações, comentários e dashboard com métricas em tempo real.

---

## 🏗️ Arquitetura

```
flowdesk/
├── backend/                    # Spring Boot API
│   └── src/main/java/com/flowdesk/api/
│       ├── controller/         # REST Controllers
│       ├── service/            # Regras de negócio
│       ├── repository/         # Spring Data JPA
│       ├── model/              # Entidades JPA
│       ├── dto/                # Data Transfer Objects
│       ├── security/           # JWT + Spring Security
│       ├── exception/          # Tratamento global de erros
│       └── config/             # Configurações (Security, OpenAPI, DataInit)
│
├── frontend/                   # Angular SPA
│   └── src/app/
│       ├── core/
│       │   ├── services/       # AuthService, TicketService, UserService
│       │   ├── interceptors/   # JWT Interceptor
│       │   ├── guards/         # Auth, Guest, Admin Guards
│       │   └── models/         # Interfaces TypeScript
│       └── features/
│           ├── auth/           # Tela de login
│           ├── dashboard/      # Dashboard com métricas
│           ├── tickets/        # CRUD de chamados
│           └── users/          # Gestão de usuários
│
└── docker-compose.yml
```

---

## 🚀 Tecnologias

### Backend
| Tecnologia | Versão |
|---|---|
| Java | 21 |
| Spring Boot | 3.2.5 |
| Spring Security + JWT | JJWT 0.12.5 |
| Spring Data JPA | 3.2.5 |
| MySQL | 8.0 |
| Springdoc OpenAPI | 2.5.0 |
| Lombok | latest |
| JUnit 5 + Mockito | latest |

### Frontend
| Tecnologia | Versão |
|---|---|
| Angular | 17 |
| Angular Material | 17 |
| TypeScript | 5.4 |
| RxJS | 7.8 |
| SCSS | - |

### DevOps
- Docker + Docker Compose
- Nginx (reverse proxy)
- Multi-stage builds

---

## ⚡ Execução Rápida

### Pré-requisitos
- Docker e Docker Compose instalados

### Com Docker (recomendado)
```bash
# Clone o repositório
git clone <url-do-repo>
cd flowdesk

# Suba todos os serviços
docker-compose up --build

# Acesse:
# Frontend: http://localhost:4200
# Backend:  http://localhost:8080/api
# Swagger:  http://localhost:8080/api/swagger-ui.html
```

### Desenvolvimento Local

**Backend:**
```bash
cd backend
# Configure MySQL local no application.yml
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm start
# Acesse: http://localhost:4200
```

---

## 🔐 Credenciais de Acesso

| Perfil | E-mail | Senha |
|---|---|---|
| ADMIN | admin@flowdesk.com | admin123 |
| ANALISTA | analista@flowdesk.com | analista123 |
| USUARIO | usuario@flowdesk.com | usuario123 |

---

## 📡 Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Autenticar e obter JWT |

### Usuários
| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/users` | ADMIN | Criar usuário |
| GET | `/api/users` | ADMIN, ANALISTA | Listar usuários |
| GET | `/api/users/{id}` | Autenticado | Buscar por ID |
| PUT | `/api/users/{id}` | ADMIN | Atualizar usuário |
| PATCH | `/api/users/{id}/toggle-active` | ADMIN | Ativar/desativar |

### Chamados
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/tickets` | Criar chamado |
| GET | `/api/tickets` | Listar (filtros: status, priority, page, size) |
| GET | `/api/tickets/{id}` | Buscar por ID |
| PUT | `/api/tickets/{id}` | Atualizar chamado |
| PATCH | `/api/tickets/{id}/status` | Atualizar status |
| POST | `/api/tickets/{id}/comments` | Adicionar comentário |
| GET | `/api/tickets/{id}/comments` | Listar comentários |
| GET | `/api/tickets/{id}/history` | Histórico de alterações |
| GET | `/api/tickets/dashboard` | Métricas do dashboard |

---

## 🔄 Workflow de Status

```
ABERTO → EM_ANALISE → AGUARDANDO_CLIENTE → RESOLVIDO → FECHADO
```

---

## 🔒 Regras de Negócio

- Apenas **ANALISTA** e **ADMIN** podem alterar status para RESOLVIDO ou FECHADO
- **USUARIO** não pode alterar a prioridade de um chamado
- Toda alteração gera registro no histórico automaticamente
- Usuários inativos não conseguem autenticar

---

## 🔐 Fluxo de Autenticação

```
1. POST /api/auth/login  →  { email, password }
2. Resposta: { token: "JWT...", user: {...} }
3. Frontend armazena token no localStorage
4. Todas as requisições incluem: Authorization: Bearer <token>
5. JwtAuthFilter valida o token em cada request
6. Em caso de 401, o interceptor Angular faz logout automático
```

---

## 🗄️ Banco de Dados

```sql
users           -- Usuários do sistema
tickets         -- Chamados técnicos
comments        -- Comentários nos chamados
ticket_history  -- Histórico de alterações
```

---

## 📖 Documentação Swagger

Após subir o backend, acesse:
```
http://localhost:8080/api/swagger-ui.html
```

---

## 🧪 Testes

```bash
cd backend
mvn test
```

Cobertura: `TicketService` com JUnit 5 + Mockito validando regras de negócio críticas.
