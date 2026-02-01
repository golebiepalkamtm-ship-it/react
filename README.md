# Champion Pigeon Auctions

**Platforma aukcyjna dla hodowców gołębi wyścigowych**  
Production-ready aplikacja zbudowana w stacku Vercel + Railway + Supabase

---

## 🏗️ Architektura Technologiczna

### Frontend (Vercel Edge Network)
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 7.3.0 z optymalizacją chunków
- **Styling**: TailwindCSS + shadcn/ui components
- **Animations**: GSAP + Framer Motion + Three.js
- **State Management**: Zustand + React Query
- **Routing**: React Router v6.30

### Backend (Railway)
- **Runtime**: Node.js 18+ + TypeScript
- **Framework**: Express.js + Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth + JWT
- **Real-time**: Socket.io
- **File Upload**: Multer + Cloud storage

### Database & Auth (Supabase)
- **Database**: PostgreSQL z Row Level Security (RLS)
- **Authentication**: Supabase Auth (Email, OAuth)
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage dla mediów
- **Edge Functions**: Supabase Edge Functions

---

## 🚀 Quick Start

### Wymagania
- Node.js >= 18.0.0
- npm >= 8.0.0
- Supabase account

### Instalacja
```bash
# Klonuj repozytorium
git clone https://github.com/golebiepalkamtm-ship-it/champion-pigeon-auctions.git
cd champion-pigeon-auctions

# Instalacja zależności
npm install
cd server && npm install && cd ..
```

### Environment Variables
```bash
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8001

# Backend (.env)
DATABASE_URL=your_database_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### Development
```bash
# Uruchom frontend + backend jednocześnie
npm run dev

# Lub osobno:
npm run dev:client  # Frontend na http://localhost:5173
npm run dev:server  # Backend na http://localhost:8001
```

---

## 📁 Struktura Projektu

```
champion-pigeon-auctions/
├── src/                          # Frontend React
│   ├── components/              # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── auction/            # Auction-specific components
│   │   ├── animations/         # GSAP/Three.js animations
│   │   └── LivingSite/         # Advanced UI demos
│   ├── contexts/               # React contexts (Auth, Locale)
│   ├── hooks/                  # Custom hooks
│   ├── services/               # API services
│   └── utils/                  # Utility functions
├── server/                      # Backend Express
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Auth, CORS, Security
│   ├── lib/                   # Database & utilities
│   └── prisma/                # Database schema
├── supabase/                   # Supabase config
│   ├── migrations/            # Database migrations
│   └── functions/             # Edge functions
├── public/                     # Static assets
└── dist/                      # Build output
```

---

## 🗄️ Model Danych

### Główne Encje
- **User** - Użytkownicy (hodowcy)
- **Auction** - Aukcje gołębi
- **PigeonProfile** - Profile gołębi
- **Bid** - Oferty licytacji
- **Watchlist** - Obserwowane aukcje
- **Notification** - Powiadomienia
- **Review** - Recenzje użytkowników
- **Payment** - Płatności (Stripe, PayPal, P24)

### Relacje
```
User 1:N Auction (seller)
User 1:N Bid (bidder)
User 1:N Watchlist
Auction 1:N Bid
Auction 1:N AuctionImage
Auction 1:1 PigeonProfile
```

---

## 🔐 Bezpieczeństwo

### Row Level Security (RLS)
- Wszystkie tabele zabezpieczone RLS
- Polityki dostępu dla różnych ról użytkowników
- Ochrona danych osobowych i finansowych

### Authentication Flow
1. Rejestracja przez Supabase Auth
2. Email verification
3. JWT token generation
4. Middleware validation na backendzie

### Security Middleware
- Helmet (security headers)
- CORS configuration
- Rate limiting (Redis)
- CSRF protection
- Input validation (Zod)

---

## 🎨 UI/UX Features

### Design System
- **Theme**: Dark/Light mode z next-themes
- **Components**: shadcn/ui + custom components
- **Animations**: GSAP ScrollTrigger, Framer Motion
- **3D Elements**: Three.js, React Three Fiber
- **Responsive**: Mobile-first design

### Key Components
- **AuctionCard** - Karty aukcji z real-time updates
- **BiddingInterface** - Panel licytacji z proxy bidding
- **UserProfile** - Profile użytkowników z trust score
- **AdminPanel** - Panel administracyjny

### Animations
- Parallax backgrounds
- Scroll-triggered animations
- Micro-interactions
- Loading states
- Toast notifications

---

## 📱 Funkcjonalności

### Core Features
- ✅ **Aukcje na żywo** - Real-time bidding
- ✅ **Proxy Bidding** - Automatyczne podbijanie
- ✅ **Snipe Protection** - Ochrona przed ostatnieofertami
- ✅ **Multi-media** - Zdjęcia, wideo, dokumenty
- ✅ **Notifications** - Email + in-app powiadomienia
- ✅ **Reviews** - System ocen hodowców
- ✅ **Payments** - Integracja Stripe/PayPal/P24

### Advanced Features
- ✅ **Champions Gallery** - Galeria zwycięzców
- ✅ **Breeder Meetings** - Spotkania hodowców
- ✅ **References** - Opinie i referencje
- ✅ **Admin Dashboard** - Zarządzanie platformą
- ✅ **Metrics Analytics** - Analityka użytkowania
- ✅ **Multi-language** - PL/EN (i18n ready)

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Build
npm run build

# Deploy (automatyczny przez Vercel)
git push origin main
```

### Backend (Railway)
```bash
# Build backend
cd server
npm run build

# Deploy (Railway CI/CD)
git push origin main
```

### Database (Supabase)
```bash
# Apply migrations
npx supabase db push

# Generate types
npx supabase gen types typescript --local > supabase_types.ts
```

---

## 📊 Monitoring & Debugging

### Diagnostics Tools
- **GSAP Diagnostic Tool** - Debugging animacji (`Ctrl+Shift+G`)
- **Performance Metrics** - Wbudowana analityka
- **Error Boundary** - Global error handling
- **Console Logging** - Structured logging

### Performance
- **Code Splitting** - Lazy loading komponentów
- **Bundle Optimization** - Manual chunks w Vite
- **Image Optimization** - Next.js Image patterns
- **CDN Caching** - Vercel Edge Network

---

## 🧪 Testing

### Unit Tests
```bash
# Run tests
npm run test

# Coverage
npm run test:coverage
```

### E2E Testing
- Playwright configuration ready
- Critical user flows covered
- Visual regression testing

---

## 🔧 Development Tools

### Scripts
```bash
npm run dev          # Development mode
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # ESLint
npm run lint:fix     # Auto-fix linting
npm run type-check   # TypeScript checking
npm run audit        # Security audit
```

### Database Commands
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

---

## 🌐 API Documentation

### Endpoints
- `GET /api/auctions` - Lista aukcji
- `POST /api/auctions` - Stwórz aukcję
- `GET /api/auctions/:id` - Szczegóły aukcji
- `POST /api/bids` - Złóż ofertę
- `GET /api/users/profile` - Profil użytkownika
- `POST /api/payments` - Przetwarzanie płatności

### WebSocket Events
- `auction:update` - Real-time auction updates
- `bid:placed` - New bid notifications
- `auction:ended` - Auction completion

---

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review & merge

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-driven development

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🆘 Support

### Documentation
- [GSAP Debug Guide](src/debug/README.md)
- [API Reference](docs/api.md)
- [Component Library](docs/components.md)

### Contact
- GitHub Issues: [Create issue](https://github.com/golebiepalkamtm-ship-it/champion-pigeon-auctions/issues)
- Email: support@palkamtm.pl
- Discord: [Community server](https://discord.gg/palkamtm)

---

## 🚀 Production Status

✅ **Live Production**: https://www.palkamtm.pl  
✅ **Backend API**: Railway deployment  
✅ **Database**: Supabase PostgreSQL  
✅ **CI/CD**: Automated deployments  
✅ **Monitoring**: Error tracking + analytics  
✅ **SSL**: HTTPS everywhere  
✅ **Performance**: Optimized bundles + CDN  

---

**Built with ❤️ for pigeon racing community**  
*Production-ready since 2024*
