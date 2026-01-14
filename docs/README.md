# Champion Pigeon Auctions - Comprehensive Documentation

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Technical Stack](#-technical-stack)
4. [Project Structure](#-project-structure)
5. [Frontend Components](#-frontend-components)
6. [Backend API](#-backend-api)
7. [Database Schema](#-database-schema)
8. [Authentication & Authorization](#-authentication--authorization)
9. [Build & Deployment](#-build--deployment)
10. [Development Workflow](#-development-workflow)
11. [Environment Configuration](#-environment-configuration)
12. [Testing](#-testing)
13. [Performance Optimization](#-performance-optimization)
14. [Security](#-security)
15. [Troubleshooting](#-troubleshooting)

---

## 🏆 Project Overview

**Champion Pigeon Auctions** is a comprehensive web application for managing and participating in pigeon auctions. The platform provides features for browsing champions, participating in auctions, managing user accounts, and administrative functions.

### Key Features

- **Auction Management**: Create, browse, and bid on pigeon auctions
- **User Authentication**: Secure login/registration with role-based access
- **Champion Gallery**: 3D interactive gallery of champion pigeons
- **Breeder Meetings**: Information about meetings with renowned breeders
- **Press & References**: News articles and customer references
- **Admin Dashboard**: Comprehensive administrative interface
- **Real-time Bidding**: WebSocket-based real-time auction updates
- **Responsive Design**: Mobile-friendly interface with dark/light theme support

### Target Audience

- Pigeon breeders and enthusiasts
- Auction participants and bidders
- Platform administrators
- Content managers

---

## 🏗️ Architecture

The application follows a **modern full-stack architecture** with clear separation of concerns:

### High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        Client Application                     │
│  (React + Vite + TypeScript + TailwindCSS + Three.js)         │
└───────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/HTTPS
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                        API Gateway                            │
│  (Express.js + Node.js + TypeScript)                          │
└───────────────────────────────────────────────────────────────┘
                                │
                                │
┌───────────────────────────────────────────────────────────────┐
│                        WebSocket Server                       │
│  (Socket.IO for real-time bidding updates)                    │
└───────────────────────────────────────────────────────────────┘
                                │
                                │
┌───────────────────────────────────────────────────────────────┐
│                        Database Layer                         │
│  (PostgreSQL + Prisma ORM)                                    │
└───────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Modular Design**: Components are organized by feature domain
2. **Lazy Loading**: Route-based code splitting for optimal performance
3. **State Management**: React Query for server state, Zustand for client state
4. **Type Safety**: Comprehensive TypeScript usage throughout the stack
5. **Responsive Design**: Mobile-first approach with TailwindCSS
6. **Real-time Updates**: WebSocket integration for auction bidding
7. **Security First**: Input validation, rate limiting, and secure database policies
8. **Performance Optimized**: In-memory caching and database indexing

---

## 🔒 Recent Security & Performance Improvements

### Security Enhancements

- **Input Validation**: Comprehensive Zod schema validation for all API endpoints
- **Rate Limiting**: WebSocket and API rate limiting to prevent abuse
- **Database Security**: Optimized Row Level Security (RLS) policies
- **Authentication**: Enhanced JWT handling with refresh tokens
- **Password Security**: bcryptjs hashing with configurable rounds

### Performance Optimizations

- **In-Memory Caching**: TTL-based cache system for auction data
- **Database Indexes**: Strategic indexing for query performance
- **Async Operations**: All I/O operations properly awaited
- **Connection Pooling**: Optimized database connections

### Recent Fixes Applied

- ✅ Race conditions in bidding system resolved
- ✅ Database transaction handling improved
- ✅ CORS and CSP policies strengthened
- ✅ File upload validation enhanced
- ✅ Error handling standardized across the application

---

## 🛠️ Technical Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.0 | Core UI framework |
| **TypeScript** | 5.8.3 | Type-safe JavaScript |
| **Vite** | 7.3.0 | Build tool and development server |
| **TailwindCSS** | 3.4.17 | Utility-first CSS framework |
| **Three.js** | 0.182.0 | 3D graphics and animations |
| **React Three Fiber** | 9.4.2 | React renderer for Three.js |
| **Framer Motion** | 12.23.26 | Animations and transitions |
| **React Router** | 6.30.1 | Client-side routing |
| **TanStack Query** | 5.90.12 | Data fetching and state management |
| **Zustand** | 5.0.9 | Lightweight state management |
| **Zod** | 4.2.1 | Schema validation |
| **Socket.IO Client** | 4.8.3 | Real-time WebSocket communication |
| **Supabase JS** | 2.89.0 | Backend-as-a-Service client |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 4.18.2 | Web framework |
| **Node.js** | 20.0.0 | JavaScript runtime |
| **TypeScript** | 5.1.6 | Type-safe JavaScript |
| **Prisma** | 7.2.0 | ORM and database toolkit |
| **Socket.IO** | 4.7.2 | Real-time WebSocket communication |
| **JSON Web Tokens** | 9.0.0 | Authentication |
| **Multer** | 1.4.5-lts.1 | File upload handling |
| **Helmet** | 7.0.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Zod** | 3.22.4 | Input validation |
| **Express Rate Limit** | 6.7.0 | Rate limiting |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Supabase JS** | 2.39.0 | Backend-as-a-Service client |

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | - | Relational database |
| **Prisma Client** | 7.2.0 | Database access |

### DevOps & Tooling

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.39.2 | Code linting |
| **Prettier** | - | Code formatting |
| **Nodemon** | 3.0.1 | Development server auto-reload |
| **Concurrently** | 7.6.0 | Parallel command execution |
| **Vercel** | - | Deployment platform |
| **Render** | - | Alternative deployment platform |

---

## 🗂️ Project Structure

```
champion-pigeon-auctions/
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore patterns
├── package.json                # Frontend dependencies and scripts
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # TailwindCSS configuration
├── postcss.config.js           # PostCSS configuration
├── prisma/                     # Prisma configuration
│   └── schema.prisma           # Database schema definition
├── public/                     # Static assets
│   ├── champions/              # Champion pigeon images
│   ├── videos/                 # Video assets
│   ├── models/                 # 3D models
│   └── ...                     # Other static files
├── src/                        # Frontend source code
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # ShadCN UI components
│   │   ├── AuctionCard.tsx     # Auction card component
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Footer.tsx          # Footer component
│   │   └── ...                 # Other components
│   ├── pages/                  # Page components (lazy loaded)
│   ├── hooks/                  # Custom React hooks
│   ├── contexts/               # React context providers
│   ├── data/                   # Static data and mocks
│   ├── utils/                  # Utility functions
│   ├── styles/                 # CSS styles
│   └── types/                  # TypeScript types
├── server/                     # Backend source code
│   ├── index.ts                # Server entry point
│   ├── app.ts                  # Express application
│   ├── package.json            # Backend dependencies
│   ├── routes/                 # API routes
│   │   ├── auth.ts             # Authentication routes
│   │   ├── auctions.ts         # Auction routes
│   │   ├── users.ts            # User routes
│   │   ├── admin.ts            # Admin routes
│   │   └── ...                 # Other routes
│   ├── middleware/             # Express middleware
│   ├── websocket/              # WebSocket handlers
│   ├── data/                   # Static data files
│   └── prisma/                 # Prisma configuration
├── docs/                       # Project documentation
│   └── README.md               # This file
└── scripts/                    # Utility scripts
```

---

## 🧩 Frontend Components

### Core Components

| Component | Location | Description |
|-----------|----------|-------------|
| **App.tsx** | `src/App.tsx` | Main application component with routing |
| **Header** | `src/components/Header.tsx` | Navigation header with theme toggle |
| **Footer** | `src/components/Footer.tsx` | Footer with links and information |
| **AuctionCard** | `src/components/AuctionCard.tsx` | Displays individual auction information |
| **AuctionsSection** | `src/components/AuctionsSection.tsx` | Auction listing section |
| **ChampionImageDiagnostics** | `src/components/ChampionImageDiagnostics.tsx` | Image analysis for champions |

### Page Components (Lazy Loaded)

| Component | Route | Description |
|-----------|-------|-------------|
| **LazyIndex** | `/` | Home page with hero section |
| **LazyAuctions** | `/auctions` | Auction browsing page |
| **LazyAuctionDetail** | `/auctions/:id` | Individual auction details |
| **LazyChampionsGallery** | `/champions` | 3D champion gallery |
| **LazyHomePage3D** | `/gallery-3d` | 3D gallery with effects |
| **LazyAuth** | `/auth` | Authentication page |
| **LazyAccount** | `/account` | User account management |
| **LazyAdmin** | `/admin` | Admin dashboard |
| **LazyContact** | `/contact` | Contact form |
| **LazyReferences** | `/references` | Customer references |
| **LazyPress** | `/press` | Press articles |
| **LazyBreederMeetings** | `/breeder-meetings` | Breeder meetings info |

### UI Components

The project uses **ShadCN UI** components with custom styling:

- **Buttons**: Primary, secondary, and ghost variants
- **Cards**: For content grouping
- **Modals**: Dialog components
- **Toasts**: Notification system
- **Tooltips**: Contextual information
- **Loading Spinners**: Visual feedback during loading

### Custom Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| **useAuctions** | `src/hooks/useAuctions.ts` | Auction data fetching |
| **useAuctionFilters** | `src/hooks/useAuctionFilters.ts` | Auction filtering logic |
| **useChampions** | `src/hooks/useChampions.ts` | Champion data management |
| **useAuth** | `src/contexts/AuthContext.tsx` | Authentication state |
| **useLocale** | `src/contexts/LocaleContext.tsx` | Internationalization |

---

## 🌐 Backend API

### API Endpoints

#### Authentication Routes (`/api/auth`)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/register` | POST | User registration | Public |
| `/login` | POST | User login | Public |
| `/logout` | POST | User logout | Authenticated |
| `/refresh` | POST | Token refresh | Public |
| `/verify-email` | POST | Email verification | Public |
| `/forgot-password` | POST | Password reset request | Public |
| `/reset-password` | POST | Password reset | Public |

#### Auction Routes (`/api/auctions`)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/` | GET | List all auctions | Public |
| `/` | POST | Create new auction | Admin |
| `/:id` | GET | Get auction details | Public |
| `/:id` | PUT | Update auction | Admin |
| `/:id` | DELETE | Delete auction | Admin |
| `/:id/bid` | POST | Place bid on auction | Authenticated |
| `/:id/bids` | GET | Get auction bids | Public |

#### User Routes (`/api/users`)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/me` | GET | Get current user profile | Authenticated |
| `/me` | PUT | Update current user profile | Authenticated |
| `/` | GET | List all users (admin only) | Admin |
| `/:id` | GET | Get user details | Admin |
| `/:id` | PUT | Update user | Admin |

#### Admin Routes (`/api/admin`)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/stats` | GET | Get platform statistics | Admin |
| `/auctions` | GET | Admin auction management | Admin |
| `/users` | GET | User management | Admin |

#### Upload Routes (`/api/upload`)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/image` | POST | Upload image | Authenticated |
| `/document` | POST | Upload document | Authenticated |

#### Message Routes (`/api/messages`)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/` | POST | Send message | Public |
| `/` | GET | Get messages (admin) | Admin |

### WebSocket Endpoints

The application uses **Socket.IO** for real-time communication:

- **Namespace**: `/bidding`
- **Events**:
  - `bid-placed`: Emitted when a new bid is placed
  - `auction-updated`: Emitted when auction details change
  - `auction-ended`: Emitted when auction ends

### Middleware & Validation

#### Validation Middleware (`server/middleware/validation.ts`)
- **Zod Schema Validation**: Comprehensive input validation for all endpoints
- **Structured Error Responses**: Detailed validation error messages
- **Type Safety**: Runtime type checking with compile-time TypeScript support

#### Rate Limiting (`server/middleware/rateLimit.ts`)
- **WebSocket Rate Limiting**: 10 bids per 60 seconds per user per auction
- **General WS Limiting**: 100 messages per 60 seconds per user
- **In-Memory Implementation**: Simple and effective rate limiting

#### Caching System (`server/lib/cache.ts`)
- **TTL-Based Caching**: 60-second default TTL with automatic cleanup
- **Auction Data Caching**: Significant performance improvement for auction listings
- **Cache Invalidation**: Automatic invalidation on data modifications

#### Validation Schemas (`server/schemas/auctionSchemas.ts`)
- **createAuctionSchema**: Comprehensive auction creation validation
- **placeBidSchema**: Bid amount validation
- **queryParamsSchema**: Query parameter validation with type coercion

### Error Handling

The backend implements comprehensive error handling:

- **Custom error classes** for different error types
- **Centralized error middleware** (`server/middleware/errorHandler.ts`)
- **Validation Error Handling**: Structured Zod error responses
- **Standardized error responses**:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed",
      "details": [
        {
          "path": "title",
          "message": "Title must be at least 3 characters"
        }
      ]
    }
  }
  ```

---

## 🗃️ Database Schema

### Prisma Schema

The database uses **PostgreSQL** with **Supabase** and **Prisma ORM**. The schema includes optimized Row Level Security (RLS) policies and strategic indexing for performance.

#### Core Models

```prisma
model User {
  id        String   @id @db.Uuid
  email     String?  @unique
  phone     String?
  name      String?
  role      UserRole @default(USER_REGISTERED)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  bids      Bid[]
  auctions  Auction[]
  profiles  Profile?

  @@map("users")
}

model Auction {
  id          String     @id @db.Uuid
  title       String
  description String?
  startingPrice Decimal   @db.Decimal(10, 2)
  buyNowPrice  Decimal?  @db.Decimal(10, 2)
  currentPrice Decimal?  @db.Decimal(10, 2)
  status      AuctionStatus @default(ACTIVE)
  startsAt    DateTime
  endsAt      DateTime
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  bids        Bid[]
  creator     User       @relation(fields: [creatorId], references: [id])
  creatorId   String     @db.Uuid

  @@map("auctions")
}

model Bid {
  id        String   @id @db.Uuid
  amount    Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())

  // Relations
  auction   Auction  @relation(fields: [auctionId], references: [id])
  auctionId String   @db.Uuid
  bidder    User     @relation(fields: [bidderId], references: [id])
  bidderId  String   @db.Uuid

  @@map("bids")
}

enum UserRole {
  USER_REGISTERED
  USER_EMAIL_VERIFIED
  USER_FULL_VERIFIED
  ADMIN
}

enum AuctionStatus {
  ACTIVE
  ENDED
  CANCELLED
}
```

### Database Optimizations

#### Indexes Added
- `idx_meetings_author_id` - Foreign key optimization
- `idx_auctions_ends_at` - Auction expiration queries
- `idx_auctions_status_ends_at` - Active auctions composite index
- `idx_bids_created_at` - Bid ordering optimization
- `idx_bids_auction_created` - Bid query performance

#### Row Level Security (RLS) Policies
- **13 optimized RLS policies** across all tables
- **Security Definer → Security Invoker** for views
- **Function search_path** security hardening
- **Performance optimized** policy queries

### Data Relationships

```
User 1────┬────┐ n Auction
            │    │
            │    └── n Bid
            │
            └── n Profile
```

### Static Data

The application uses JSON files for static content:

- `server/data/auctions.json`: Sample auction data
- `server/data/meetings.json`: Breeder meeting information
- `server/data/references.json`: Customer references
- `src/data/champions.ts`: Champion pigeon data

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Registration**: User provides email/phone and password
2. **Email Verification**: Verification link sent to user's email
3. **Login**: JWT token issued upon successful authentication
4. **Token Refresh**: Refresh tokens for extended sessions
5. **Password Reset**: Secure password recovery flow

### Authorization Roles

| Role | Permissions |
|------|-------------|
| **USER_REGISTERED** | Basic access, can view content |
| **USER_EMAIL_VERIFIED** | Can participate in auctions |
| **USER_FULL_VERIFIED** | Full user privileges |
| **ADMIN** | Full administrative access |

### Security Measures

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Hashing**: bcryptjs with configurable rounds for secure storage
- **Rate Limiting**: Express rate limiting and WebSocket rate limiting
- **Input Validation**: Comprehensive Zod schema validation for all endpoints
- **CORS**: Configurable cross-origin resource sharing with allowed origins
- **Helmet**: Security headers for Express with CSP policies
- **Database Security**: Row Level Security (RLS) policies on all tables
- **File Upload Security**: Multer with file type and size validation
- **CSRF Protection**: Built into authentication flow
- **SQL Injection Prevention**: Parameterized queries via Prisma ORM

---

## 🚀 Build & Deployment

### Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   cd server && npm install
   cd ..
   ```

2. **Environment configuration**:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

3. **Database setup**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run development servers**:
   ```bash
   npm run dev
   ```

### Build Process

```bash
# Frontend build
npm run build

# Backend build
cd server && npm run build
```

### Deployment

#### Vercel Deployment (Frontend)

1. Connect repository to Vercel
2. Configure environment variables
3. Set build command: `npm run build`
4. Set output directory: `dist`

#### Render Deployment (Backend)

1. Create new Web Service on Render
2. Connect repository
3. Set build command: `cd server && npm run build`
4. Set start command: `node server/dist/bootstrap.js`
5. Configure environment variables

### Environment Variables

Required environment variables (see `.env.example`):

```
# Frontend (.env in project root)
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
VITE_WS_URL=http://localhost:8000

# Backend (server/.env)
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/champion_pigeon
SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_BUCKET=auction-media
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 🔧 Development Workflow

### Code Quality

- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Git Hooks**: Pre-commit hooks for quality checks

### Common Commands

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Run tests (if configured)
npm test
```

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature development
- **bugfix/***: Bug fixes
- **release/***: Release preparation

### Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## ⚙️ Environment Configuration

### Frontend Configuration

**Vite Configuration** (`vite.config.ts`):

- **Port**: 8080
- **Proxy**: `/api` → `http://localhost:8000`
- **Aliases**: `@` → `./src`
- **Code Splitting**: Manual chunks for large libraries
- **Worker Support**: Web worker configuration

**TailwindCSS Configuration**:

- Dark mode support
- Custom color palette
- Responsive design breakpoints
- DaisyUI integration

### Backend Configuration

**Express Configuration**:

- **Port**: 8000 (configurable via `PORT` env var)
- **CORS**: Configurable allowed origins
- **Rate Limiting**: 100 requests per 15 minutes
- **Security Headers**: Helmet middleware
- **Static Files**: Served from `/public`

**Prisma Configuration**:

- PostgreSQL database provider
- Client engine (no Rust binary)
- Automatic migrations

---

## 🧪 Testing

### Testing Strategy

1. **Unit Testing**: Individual components and functions
2. **Integration Testing**: API endpoints and database interactions
3. **E2E Testing**: User flows and complete features
4. **Visual Regression**: Component rendering consistency

### Test Tools

- **Vitest**: Unit testing framework
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: End-to-end testing

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test with coverage
npm run test:coverage
```

---

## ⚡ Performance Optimization

### Frontend Optimizations

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: `next/image` equivalent implementation
- **Bundle Analysis**: Vite bundle analyzer
- **Memoization**: `React.memo` for components
- **Virtualization**: Large list rendering
- **Web Workers**: Offload heavy computations

### Backend Optimizations

- **Database Indexing**: Optimized queries
- **Caching**: Response caching middleware
- **Connection Pooling**: Prisma connection management
- **Compression**: Response compression
- **Rate Limiting**: Prevent abuse

### Monitoring

- **Performance Metrics**: Web Vitals tracking
- **Error Tracking**: Sentry integration (if configured)
- **Logging**: Structured logging

---

## 🔒 Security

### Security Best Practices

1. **Authentication**: JWT with refresh tokens
2. **Authorization**: Role-based access control
3. **Input Validation**: Zod schema validation
4. **Password Storage**: bcrypt hashing
5. **HTTPS**: Enforced in production
6. **CORS**: Restricted origins
7. **CSRF**: Protection mechanisms
8. **Rate Limiting**: Prevent brute force
9. **Security Headers**: Helmet middleware
10. **Dependency Updates**: Regular audits

### Common Security Measures

- **Environment Variables**: Never commit secrets
- **CORS Configuration**: Restrict allowed origins
- **Rate Limiting**: 100 requests/15 minutes
- **File Uploads**: Size limits and validation
- **Error Handling**: No stack traces in production

---

## 🐛 Troubleshooting

### Common Issues

#### Frontend Issues

| Issue | Solution |
|-------|----------|
| **White screen on load** | Check browser console for errors, verify API connectivity |
| **Styling not applied** | Clear cache, check Tailwind configuration |
| **Lazy loading failures** | Verify dynamic import paths |
| **WebSocket connection failed** | Check backend WebSocket server, CORS settings |

#### Backend Issues

| Issue | Solution |
|-------|----------|
| **Database connection failed** | Verify `DATABASE_URL`, check PostgreSQL service |
| **JWT verification failed** | Check `JWT_SECRET` consistency |
| **CORS errors** | Verify allowed origins in configuration |
| **File upload failures** | Check Multer configuration and disk permissions |

#### Deployment Issues

| Issue | Solution |
|-------|----------|
| **Build failures** | Check Node.js version, clear `node_modules` |
| **Environment variable missing** | Verify `.env` files and deployment configuration |
| **Port conflicts** | Change `PORT` environment variable |
| **Database migration errors** | Reset database, check migration files |

### Debugging Tools

- **Frontend**: React DevTools, Redux DevTools
- **Backend**: Express middleware logging
- **Database**: Prisma Studio (`npx prisma studio`)
- **Network**: Browser DevTools Network tab

---

## 📚 Additional Resources

### Learning Materials

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Three.js Documentation](https://threejs.org/docs/)

### Project Links

- **Repository**: [GitHub Repository](https://github.com/golebiepalkamtm-ship-it/champion-pigeon-auctions)
- **Issue Tracker**: [GitHub Issues](https://github.com/golebiepalkamtm-ship-it/champion-pigeon-auctions/issues)
- **Live Demo**: [Production URL](https://champion-pigeon-web.onrender.com)

---

## 🎯 Future Enhancements

### Planned Features

1. **Advanced Search**: Filter auctions by multiple criteria
2. **User Profiles**: Enhanced profile management
3. **Payment Integration**: Stripe/PayPal integration
4. **Notifications**: Email and push notifications
5. **Multi-language Support**: Internationalization
6. **Mobile App**: React Native implementation
7. **Analytics Dashboard**: User behavior tracking
8. **Auction Scheduling**: Calendar integration

### Technical Improvements

1. **GraphQL API**: Replace REST with GraphQL
2. **Microservices**: Break down monolithic backend
3. **Serverless Functions**: For specific endpoints
4. **Advanced Caching**: Redis integration
5. **CI/CD Pipeline**: Automated testing and deployment
6. **Dockerization**: Containerized deployment

---

## 📝 Documentation Maintenance

### Keeping Documentation Updated

1. **Version Control**: Track documentation changes with code
2. **Review Process**: Include documentation in PR reviews
3. **Automation**: Generate API docs from code
4. **Accessibility**: Keep docs in markdown format
5. **Searchability**: Use clear headings and structure

### Contributing to Documentation

1. **Fork the repository**
2. **Create a documentation branch**
3. **Make your changes**
4. **Submit a pull request**
5. **Include screenshots** where helpful

---

**Last Updated**: 2026-01-11

**Maintainer**: Champion Pigeon Auctions Team

**Contact**: [team@champion-pigeon-auctions.com]
