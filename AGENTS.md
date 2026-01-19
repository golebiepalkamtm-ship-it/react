# AGENTS.md
This file provides guidance to Verdent when working with code in this repository.

## Table of Contents
1. Commonly Used Commands
2. High-Level Architecture & Structure
3. Key Rules & Constraints
4. Development Hints

## Commands

### Development
- `npm run dev` - Start both frontend (Vite) and backend (Express) concurrently
- `npm run dev:client` - Start frontend only (port 5173)
- `npm run dev:server` - Start backend only (port 8001)

### Code Quality
- `npm run lint` - Run ESLint with zero warnings policy
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm test` - Run Vitest tests
- `npm run audit` - Security audit (moderate level)

### Build & Deploy
- `npm run build` - Build frontend for production (Vite)
- `cd server ; npm run build` - Build backend for production (TypeScript → dist/)
- `cd server ; npm run start` - Start production server

### Database & Prisma
- `npx prisma generate` - Generate Prisma Client (required after schema changes)
- `npx prisma migrate dev --name <name>` - Create and apply migration
- `npx prisma studio` - Open Prisma Studio database browser
- `cd server ; npm run seed:json` - Seed database from JSON

### Backend Utilities
- `cd server ; npm run type-check` - TypeScript type checking without build
- `cd server ; npm run create-admin` - Create admin account
- `cd server ; npm run create-user` - Create user account

### Scripts (PowerShell)
- `.\scripts\start-dev.ps1` - Alternative dev server launcher
- `.\scripts\verify_security.ps1` - Comprehensive security audit
- `tsx scripts/check-columns.ts` - Verify database columns
- `tsx scripts/force-admin.ts` - Force admin role for user
- `tsx scripts/reset-password.ts` - Reset user password

## Architecture

### System Overview
```mermaid
graph TB
    Client[React 19 SPA<br/>Vite + TypeScript]
    API[Express API Gateway<br/>Port 8001]
    WS[Socket.IO WebSocket<br/>Real-time Bidding]
    DB[(PostgreSQL<br/>Supabase)]
    Auth[Supabase Auth<br/>JWT Tokens]
    
    Client -->|HTTP/REST| API
    Client -->|WebSocket| WS
    Client -->|Auth Flow| Auth
    API --> DB
    WS --> DB
    API --> Auth
    WS --> Auth
    
    subgraph Frontend
        Client
    end
    
    subgraph Backend
        API
        WS
    end
    
    subgraph External Services
        Auth
        DB
    end
```

### Major Subsystems

#### 1. Frontend (`src/`)
- **Framework**: React 19 + TypeScript 5.8.3 + Vite 7.3.0
- **State Management**: 
  - TanStack Query 5.90.12 (server state, caching, invalidation)
  - Zustand 5.0.9 (local UI state)
  - AuthContext (`src/contexts/AuthContext.tsx`) for authentication state
- **Styling**: TailwindCSS 3.4.17 + DaisyUI + Framer Motion 12.23.26
- **3D Graphics**: Three.js + React Three Fiber (champion gallery)
- **Real-time**: Socket.IO Client 4.8.3
- **API Client**: Centralized in `src/services/api.ts` (includes CSRF handling)

Key directories:
- `src/components/` - Reusable React components organized by domain
- `src/pages/` - Route-based page components
- `src/contexts/` - React Context providers (Auth, Session)
- `src/services/` - API client, WebSocket handlers
- `src/hooks/` - Custom React hooks

#### 2. Backend (`server/`)
- **Framework**: Express.js 4.18.2 + Node.js ≥18.0.0
- **ORM**: Prisma 7.2.0 (PostgreSQL adapter)
- **Authentication**: Supabase Auth + JWT (secret from Supabase settings)
- **Real-time**: Socket.IO 4.7.2
- **Validation**: Zod 3.22.4 schemas for all endpoints
- **Security**: Helmet, CORS, CSRF tokens, Express Rate Limit

Key directories:
- `server/routes/` - Express route handlers (12 route files)
- `server/services/` - Business logic layer (DDD pattern)
- `server/middleware/` - Auth, rate limiting, error handling
- `server/websocket/` - Socket.IO event handlers
- `server/lib/` - Utilities (db connection, cache, logger)
- `server/schemas/` - Zod validation schemas [inferred]

Entry points:
- `server/index.ts` - Main server bootstrap
- `server/app.ts` - Express application configuration

#### 3. Database
- **Provider**: PostgreSQL via Supabase
- **ORM**: Prisma Client 7.2.0
- **Schema**: `prisma/schema.prisma` (single source of truth)
- **Security**: Row Level Security (RLS) policies
- **Performance**: Optimized indexes on frequently queried columns

Core models:
- `User` (with roles: USER_REGISTERED → USER_EMAIL_VERIFIED → USER_FULL_VERIFIED → ADMIN)
- `Auction` (status: ACTIVE, ENDED, CANCELLED)
- `Bid` (with proxy bidding support)
- `Payment` (Stripe/PayPal/P24 providers)
- `Review`, `Notification`, `Watchlist`, `Meeting`, `Reference`

#### 4. External Dependencies

**Supabase**
- Authentication (JWT tokens)
- PostgreSQL database hosting
- Row Level Security (RLS) policies
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Twilio Verify**
- SMS OTP for phone verification
- Rate limited: 5 sends / 10 verifications per 5 minutes per IP
- Environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`

**Stripe** [inferred]
- Payment processing
- Webhook signature validation (requires raw body)

**Socket.IO**
- Real-time auction updates
- Events: `auction:updated`, `bid:placed`, `auction:ended`
- Auto-reconnect with exponential backoff
- CORS must match frontend origin

### Request/Response Lifecycle

#### REST API Flow
```
1. Client sends HTTP request → Express middleware chain
2. CORS → Helmet → Cookie Parser → CSRF validation
3. Rate limiting (6.7.0) → Route handler
4. Route delegates to Service layer (DDD pattern)
5. Service executes business logic → Prisma transaction
6. Response with standardized error codes (400, 401, 403, 500)
7. React Query caches response on client
```

#### WebSocket Bidding Flow
```
1. Client connects to Socket.IO with JWT token
2. Server validates token → assigns socket to user/auction room
3. Client emits 'place:bid' event with auction ID + amount
4. Server validates bid → Prisma transaction with FOR UPDATE lock
5. On success: broadcast 'bid:placed' to all watchers
6. Client receives update → invalidates React Query cache
7. UI updates in real-time
```

## Key Rules & Constraints

### From .github/copilot-instructions.md

**Architecture Patterns**
- **Service Layer (DDD)**: All business logic MUST be in `server/services/`, not in route handlers. Routes delegate to services.
- **Race Condition Prevention**: Use `FOR UPDATE` row-level locking in Prisma transactions for auction bids.
- **Dual Protocol Support**: Both REST API and WebSocket handlers call the same service methods for consistency.

**Authentication & Authorization**
- **Zero Trust**: NEVER trust role from frontend. Always re-validate on backend via JWT.
- **Role Changes**: Only via Supabase database triggers, never through API directly.
- **Token Validation**: Use Supabase JWT secret, not anon key, for backend verification.
- **Service Role Key**: Backend MUST use `SUPABASE_SERVICE_ROLE_KEY`, not anon key.

**Validation Pipeline**
- **Triple Layer**: Frontend (Zod) → Backend (Zod) → Database (constraints)
- **Schema Sharing**: Define Zod schema once, export types with `z.infer<typeof schema>`
- **No Silent Failures**: Always log errors, never swallow exceptions

**Caching Strategy**
- **Backend**: TTL-based in-memory cache (`server/lib/cache.ts`)
- **Frontend**: React Query with `staleTime`/`gcTime`
- **Invalidation**: Clear cache on mutations (POST/PUT/DELETE) immediately
- **WebSocket Sync**: WebSocket events trigger React Query cache invalidation

**Security Requirements**
- **Rate Limiting**: All public endpoints protected (Express Rate Limit 6.7.0)
- **CSRF**: Enabled for state-changing operations
- **Helmet**: Security headers enforced
- **Input Validation**: All user input validated with Zod before processing
- **No Hardcoded Secrets**: All credentials in environment variables
- **Webhook Validation**: Stripe webhooks require signature verification with raw body

**Common Pitfalls**
- ⚠️ **Bid Race Conditions**: Always use Prisma transactions with `FOR UPDATE` for concurrent bid handling
- ⚠️ **Stale Cache**: Invalidate React Query cache after mutations, especially on WebSocket events
- ⚠️ **Silent WebSocket Disconnect**: Implement reconnect handler with fallback to HTTP polling
- ⚠️ **Zod Type Mismatch**: Always `const schema = z.object(...)` then `type Type = z.infer<typeof schema>`
- ⚠️ **Token Expiry**: Supabase auto-refresh handles this, but if 401, trigger re-login flow
- ⚠️ **Role Escalation**: NEVER allow role changes via API; only database triggers

### Environment Configuration

**Frontend `.env` (required)**
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxx...
VITE_API_BASE_URL=http://localhost:8001/api
VITE_WS_URL=http://localhost:3001
VITE_DISABLE_AUTH_GUARDS=false  # Only use in development
```

**Backend `server/.env` (required)**
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxx...  # MUST be service role, not anon
JWT_SECRET=<from Supabase JWT settings>
DATABASE_URL=postgresql://user:pass@host/db
CLIENT_URL=http://localhost:5173  # CORS origin
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=...
```

### Code Style & Conventions
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with zero warnings policy (`--max-warnings=0`)
- **Node Version**: ≥18.0.0 (defined in package.json engines)
- **Module System**: ES Modules (type: "module" in both package.json files)
- **Error Handling**: Use structured logger, not `console.log()`

## Development Hints

### Adding a New API Endpoint

1. **Define data model** in `prisma/schema.prisma`
   ```prisma
   model NewFeature {
     id        String   @id @default(uuid()) @db.Uuid
     userId    String   @map("user_id")
     data      Json
     createdAt DateTime @default(now()) @map("created_at")
     
     user User @relation(fields: [userId], references: [id])
     @@map("new_features")
   }
   ```

2. **Create migration**
   ```bash
   npx prisma migrate dev --name add_new_feature
   npx prisma generate
   ```

3. **Create Zod schema** in `server/schemas/newFeature.ts` [inferred path]
   ```typescript
   import { z } from 'zod';
   
   export const newFeatureSchema = z.object({
     data: z.record(z.unknown()),
   });
   
   export type NewFeatureInput = z.infer<typeof newFeatureSchema>;
   ```

4. **Implement service** in `server/services/NewFeatureService.ts`
   ```typescript
   export class NewFeatureService {
     static async create(userId: string, input: NewFeatureInput) {
       // Business logic here
       return await db.newFeature.create({ data: { userId, ...input } });
     }
   }
   ```

5. **Create route handler** in `server/routes/newFeature.ts`
   ```typescript
   import { Router } from 'express';
   import { authMiddleware } from '../middleware/auth.js';
   import { NewFeatureService } from '../services/NewFeatureService.js';
   
   const router = Router();
   
   router.post('/', authMiddleware, async (req, res) => {
     const input = newFeatureSchema.parse(req.body);
     const result = await NewFeatureService.create(req.userId, input);
     res.json(result);
   });
   
   export default router;
   ```

6. **Register route** in `server/app.ts`
   ```typescript
   import newFeatureRouter from './routes/newFeature.js';
   app.use('/api/new-feature', newFeatureRouter);
   ```

7. **Add React Query hook** in `src/services/api.ts` or dedicated service file
   ```typescript
   export const useCreateNewFeature = () => {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: (data: NewFeatureInput) => 
         apiClient.post('/new-feature', data),
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['newFeatures'] });
       },
     });
   };
   ```

### Adding Real-time WebSocket Support

1. **Create event handler** in `server/websocket/newFeature.ts`
   ```typescript
   export function setupNewFeatureHandlers(io: Server) {
     io.on('connection', (socket) => {
       socket.on('feature:subscribe', (featureId) => {
         socket.join(`feature:${featureId}`);
       });
       
       socket.on('feature:update', async (data) => {
         // Validate, process, emit
         io.to(`feature:${data.id}`).emit('feature:updated', result);
       });
     });
   }
   ```

2. **Register in** `server/index.ts` or `server/websocket/index.ts` [inferred]

3. **Client-side listener** in React component
   ```typescript
   useEffect(() => {
     socket.on('feature:updated', (data) => {
       queryClient.setQueryData(['feature', data.id], data);
     });
     return () => socket.off('feature:updated');
   }, [socket, queryClient]);
   ```

### Modifying CI/CD Pipeline

**Current workflows** (`.github/workflows/`):
- `lint.yml` - Runs on push/PR: install → lint → build → audit
- `deploy-vercel.yml` - Auto-deploy to Vercel on push to main

**To add test step to CI**:
Edit `.github/workflows/lint.yml`:
```yaml
- name: Run tests
  run: npm test
```

**Note**: Currently CI does NOT run `npm test` [inferred from workflow analysis]

### Database Schema Changes

**Important**: Always create migrations, never manually edit database
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name descriptive_name

# 3. Generate Prisma Client (automatically done by migrate, but explicit is safer)
npx prisma generate

# 4. If in production, use:
npx prisma migrate deploy
```

### Performance Optimization Checklist

- **Frontend**:
  - Lazy load routes (Vite handles automatically with dynamic imports)
  - Use React.memo for expensive components
  - Debounce search inputs
  - Virtualize long lists (TanStack Virtual is installed)

- **Backend**:
  - Batch database queries (`findMany` over multiple `findUnique`)
  - Use connection pooling (Prisma handles via `@prisma/adapter-pg`)
  - Implement pagination for list endpoints
  - Cache frequently accessed data in memory

- **WebSocket**:
  - Send deltas, not full objects (only changed fields)
  - Limit broadcast scope to relevant rooms
  - Throttle high-frequency events

- **Database**:
  - Add indexes for frequently queried columns (check `@@index` in schema)
  - Use `select` to fetch only needed fields
  - Optimize N+1 queries with `include`

### Security Audit Checklist

Use provided script:
```powershell
.\scripts\verify_security.ps1
```

Manual checks:
- [ ] No hardcoded secrets in code (search for `API_KEY`, `SECRET`, `PASSWORD`)
- [ ] All mutations protected by CSRF tokens
- [ ] Rate limiting on all public endpoints
- [ ] Input validation with Zod on all endpoints
- [ ] WebSocket authentication enforced (JWT or ticket-based)
- [ ] No role escalation paths (admin role only via DB triggers)
- [ ] Stripe webhook signature validation
- [ ] Database queries use parameterized inputs (Prisma handles this)

### Debugging Tips

**Frontend**:
- Browser DevTools → Network tab for API calls
- React Query DevTools (if installed) for cache inspection
- Check `src/contexts/AuthContext.tsx` for auth state issues

**Backend**:
- Use structured logger (not `console.log()`)
- Check `server/middleware/auth.ts` for token validation issues
- Prisma Studio to inspect database state: `npx prisma studio`
- For WebSocket issues: monitor Socket.IO debug logs

**Database**:
- Prisma query logging: set `log: ['query']` in PrismaClient constructor
- Check RLS policies in Supabase dashboard if access denied errors
- Verify migrations applied: `npx prisma migrate status`

### Common Development Scenarios

**"I need to test the app locally"**
```bash
# Terminal 1: Start both servers
npm run dev

# Terminal 2: Check logs
# Frontend: http://localhost:5173
# Backend API: http://localhost:8001
# WebSocket: http://localhost:3001 (if separate)
```

**"Database is out of sync"**
```bash
npx prisma migrate reset  # WARNING: Deletes all data
npx prisma migrate dev    # Apply pending migrations
npx prisma generate       # Regenerate client
```

**"I need admin access"**
```bash
cd server
npm run create-admin
# Or force existing user:
tsx ../scripts/force-admin.ts
```

**"WebSocket not connecting"**
1. Check `VITE_WS_URL` in frontend `.env`
2. Verify CORS origin in backend matches `CLIENT_URL`
3. Check browser console for connection errors
4. Ensure JWT token is valid (check AuthContext)

**"Prisma type errors after schema change"**
```bash
npx prisma generate  # Regenerate types
# If still fails:
rm -rf node_modules/.prisma
npx prisma generate
```

---

**Last Updated**: January 2026  
**Maintainer**: Development Team  
**Related Documentation**: 
- [Full Technical Docs](docs/README.md)
- [Auth System Details](docs/AUTH_SYSTEM.md)
- [API Instructions](.github/copilot-instructions.md)
