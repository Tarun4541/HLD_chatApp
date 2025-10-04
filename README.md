**HLD Chat App**

A **real-time one-to-one messaging application** built with Node.js, Redis Pub/Sub, MongoDB, and WebSockets.
The app uses Docker for containerization and supports horizontal scaling with multiple backend instances.

## 🏗 Architecture

```mermaid
graph TD
  subgraph Clients
    C1["Client :3000"]
    C2["Client_2 :3001"]
  end

  GW["API Gateway"]
  AUTH["Auth Service :8080"]
  BE1["Chat Backend :8081"]
  BE2["Chat Backend 2 :8084"]
  REDIS["Redis / Valkey (Pub/Sub)"]
  MONGO["MongoDB Atlas"]

  %% Auth flow
  C1 -->|"Login / Sign up (REST)"| GW
  C2 -->|"Login / Sign up (REST)"| GW
  GW -->|"route auth/*"| AUTH
  AUTH -->|"Set-Cookie: JWT (HttpOnly, Secure, SameSite=Lax)"| C1
  AUTH -->|"Set-Cookie: JWT (HttpOnly, Secure, SameSite=Lax)"| C2

  %% App traffic (REST + WebSocket) with cookie attached
  C1 -->|"REST + WS handshake (JWT cookie)"| GW
  C2 -->|"REST + WS handshake (JWT cookie)"| GW

  %% Gateway verifies token (via Auth or cached/public key) and routes
  GW -->|"verify JWT"| AUTH
  GW -->|"route /api, /ws"| BE1
  GW -. load-balance .-> BE2

  %% Realtime + persistence
  BE1 <-->|"Pub/Sub"| REDIS
  BE2 <-->|"Pub/Sub"| REDIS
  BE1 -->|"Persist"| MONGO
  BE2 -->|"Persist"| MONGO

  %% WS events to clients
  BE1 <-->|"WS events"| C1
  BE2 <-->|"WS events"| C2
```
> Notes  
> - **JWT is issued by Auth** and stored as **HttpOnly Secure cookie**.  
> - **API Gateway** verifies JWT (via **Auth** or using a **cached public key**) and routes to **BE1 / BE2**.  
> - **BE1/BE2** exchange chat events via **Redis Pub/Sub** and persist to **MongoDB Atlas**.  
> - WebSocket handshakes include cookies, so the gateway/backends can validate the session.

### 📩 Message Flow
- 1.User connects from the frontend (React/Next.js) to backend over WebSocket & REST.
- 2.Authentication handled by the Auth service issuing JWT tokens.
- 3.Messages are published to Redis channels → consumed by all backend instances for horizontal scalability.
- 4.Persistence: Messages and user data stored in MongoDB Atlas.
- 5.Clients receive real-time updates via WebSocket events.

### 📝 Features
- Real-time messaging using WebSockets
- Redis Pub/Sub for inter-service communication (scale-out support)
- MongoDB for message persistence
- Two front-end clients (client & client_2) for testing horizontal scaling
- Auth microservice for user authentication
- Containerized with Docker & orchestrated with docker-compose
- Deployable on AWS EC2 or ECS

### 🐳 Docker Images
Pre-built images are available on Docker Hub:
| Service   | Docker Hub Image                    |
| --------- | ----------------------------------- |
| Backend 1 | `tarun309/hld-chat-backend:latest`  |
| Backend 2 | `tarun309/hld-chat-backend2:latest` |
| Auth      | `tarun309/hld-chat-auth:latest`     |
| Client 1  | `tarun309/hld-chat-client:latest`   |
| Client 2  | `tarun309/hld-chat-client2:latest`  |

### 🚀 Running Locally with Docker Compose
- #Clone this repository
  - git clone https://github.com/Tarun4541/HLD_chatApp.git
  - cd HLD_chatApp
- #Make sure your .env file exists 
- #Build & run containers
  - docker-compose up --build

**This will start:**
  - Client on http://localhost:3000
  - Client2 on http://localhost:3001
  - Backend on http://localhost:8081
  - Backend2 on http://localhost:8084
  - Auth backend on http://localhost:8080

### 📈 Scaling
  - Multiple backend instances (BE1 & BE2) connected via Redis Pub/Sub for horizontal scaling.
  - JWT authentication handled by a dedicated Auth service.
  - Future enhancement: TLS termination with Nginx/Traefik + Let’s Encrypt.

### SequenceDiagram
```mermaid
sequenceDiagram
  participant C1 as Client
  participant GW as API Gateway
  participant AUTH as Auth Service
  participant BE1 as Backend 1
  participant BE2 as Backend 2
  participant REDIS as Redis/Valkey
  participant DB as MongoDB Atlas

  Note over C1,AUTH: Login
  C1->>GW: POST /auth/login (email, password)
  GW->>AUTH: /auth/login
  AUTH-->>GW: 200 {user} + Set-Cookie: jwt=...
  GW-->>C1: 200 + Set-Cookie

  Note over C1,BE1: WebSocket connect
  C1->>GW: WS handshake (Cookie: jwt=...)
  GW->>AUTH: verify JWT (or verify locally via public key)
  AUTH-->>GW: valid
  GW->>BE1: route WS connection

  Note over C1,DB: Send message
  C1->>GW: POST /messages {to, text} (cookie attached)
  GW->>BE1: /messages
  BE1->>DB: insert message
  BE1->>REDIS: publish chat event
  REDIS-->>BE2: broadcast
  BE2-->>C2: emit "chat:msg"
```
