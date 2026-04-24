# AI Agent Orchestrator Platform

A production-ready platform that converts natural language use-cases into multi-agent AI workflows.

## Overview

Users submit natural language prompts describing complex tasks, and the system automatically:
1. Understands intent using GPT-4
2. Breaks down into tasks
3. Creates specialized AI agents (Planner, Executor, Reviewer, Notifier)
4. Orchestrates multi-agent workflows using a DAG execution model
5. Executes and tracks execution in real-time via WebSockets

## Tech Stack

**Frontend:**
- Next.js 14 with React 18
- Tailwind CSS
- Zustand for state management
- React Flow for workflow visualization
- Socket.io-client for real-time updates

**Backend:**
- NestJS (Node.js)
- PostgreSQL with Prisma ORM
- JWT authentication
- BullMQ for job queues
- Redis for caching/queues

**AI Layer:**
- OpenAI API (GPT-4)
- Custom multi-agent orchestration engine

## Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- OpenAI API key (optional - falls back to mock responses)

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/Umakant98/ai-agent-orchestrator.git
cd ai-agent-orchestrator
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key (optional)
```

3. Start all services:
```bash
docker-compose up -d
```

4. The platform will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - API Health: http://localhost:3001/api/health

### Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, REDIS_HOST

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env.local
# Edit .env.local if needed

# Start development server
npm run dev
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflows/generate-agents` | Parse prompt and generate agents |
| POST | `/api/workflows` | Create workflow |
| GET | `/api/workflows` | List user workflows |
| GET | `/api/workflows/:id` | Get workflow details |
| DELETE | `/api/workflows/:id` | Delete workflow |

### Executions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/executions/workflow/:workflowId` | Start workflow execution |
| GET | `/api/executions` | List user executions |
| GET | `/api/executions/:id` | Get execution status |
| GET | `/api/executions/:id/logs` | Get execution logs |

## Frontend Pages

- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Overview of workflows and executions
- `/workflows` - List all workflows
- `/workflows/create` - Create new workflow from prompt
- `/workflows/:id` - View workflow details and graph
- `/executions/:id` - Monitor execution with live logs

## Database Schema

```
users             - User accounts
workflows         - Workflow definitions with JSON config
agents            - Agent definitions per workflow
executions        - Workflow execution records
execution_logs    - Per-agent execution log entries
```

## WebSocket Events

Connect to `ws://localhost:3001/ws` and subscribe to executions:

```javascript
socket.emit('subscribe:execution', { executionId: 'xxx' });

// Events received:
socket.on('execution:started', handler);
socket.on('execution:completed', handler);
socket.on('execution:failed', handler);
socket.on('agent:started', handler);
socket.on('agent:completed', handler);
socket.on('agent:failed', handler);
socket.on('log', handler);
```

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_agent_orchestrator
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=sk-your-openai-key   # Optional - uses mock if not set
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## Architecture

```
┌─────────────────┐    ┌──────────────────────────────────────────────┐
│   Next.js UI    │    │              NestJS Backend                   │
│                 │    │                                               │
│  - Dashboard    │───▶│  Auth Module    → JWT + bcrypt               │
│  - Workflow     │    │  Workflows      → CRUD + AI generation       │
│    Creator      │    │  Agents         → Base + Specialized agents  │
│  - Exec Monitor │◀───│  Executions     → DAG orchestrator           │
│  - React Flow   │ WS │  AI Service     → OpenAI + mock fallback     │
│    Graphs       │    │  BullMQ Queue   → Async execution            │
└─────────────────┘    │  WebSocket GW   → Real-time updates          │
                       └──────────────────────────────────────────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          │          PostgreSQL          │
                          │          + Redis             │
                          └─────────────────────────────┘
```

## Agent Execution Flow

```
User Prompt
    │
    ▼
AI Service (GPT-4 or mock)
    │ Generates structured workflow JSON
    ▼
Workflow saved to DB with agents
    │
    ▼
BullMQ Job Queue
    │
    ▼
OrchestratorService
    │ Topological sort of DAG
    ▼
For each agent in order:
  Planner → Executor → Reviewer → Notifier
    │
    ▼
Real-time events via WebSocket
```

## License

MIT
