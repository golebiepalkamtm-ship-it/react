# Migration Guide - Refactoring QoL

## 1. Migracja z AuthContext na SessionContext + UserContext

### Krok 1: Aktualizacja App.tsx

```tsx
// Przed
import { AuthProvider } from '@/contexts/AuthContext';

<AuthProvider>
  <App />
</AuthProvider>

// Po (z backward compatibility)
import { SessionProvider } from '@/contexts/SessionContext';
import { UserProvider } from '@/contexts/UserContext';
import { AuthProvider } from '@/contexts/AuthContextCompat';

<SessionProvider>
  <UserProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </UserProvider>
</SessionProvider>
```

### Krok 2: Stopniowa migracja komponentów

**Komponenty tylko do odczytu auth:**

```tsx
// Przed
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, loading } = useAuth();
  // ...
};

// Po
import { useSession } from '@/contexts/SessionContext';

const MyComponent = () => {
  const { user, loading } = useSession();
  // ...
};
```

**Komponenty operujące na profilu:**

```tsx
// Przed
import { useAuth } from '@/contexts/AuthContext';

const ProfileEditor = () => {
  const { profile, updateProfile } = useAuth();
  // ...
};

// Po
import { useUser } from '@/contexts/UserContext';

const ProfileEditor = () => {
  const { profile, updateProfile } = useUser();
  // ...
};
```

**Komponenty używające obu:**

```tsx
// Przed
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  // ...
};

// Po
import { useSession } from '@/contexts/SessionContext';
import { useUser } from '@/contexts/UserContext';

const Header = () => {
  const { user, signOut } = useSession();
  const { profile } = useUser();
  // ...
};
```

## 2. Dodawanie Error Boundaries

### Widget-level (zalecane dla izolowanych komponentów)

```tsx
import { WidgetErrorBoundary } from '@/components/WidgetErrorBoundary';

// W komponencie strony
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <WidgetErrorBoundary widgetName="Lista aukcji">
    <AuctionList />
  </WidgetErrorBoundary>
  
  <WidgetErrorBoundary widgetName="Panel licytacji">
    <BiddingWidget auctionId={id} />
  </WidgetErrorBoundary>
</div>
```

### Global-level (już zaimplementowany)

```tsx
// main.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## 3. Implementacja Proxy Bidding w UI

### Frontend Component (przykład)

```tsx
import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

const BiddingForm = ({ auctionId, currentPrice, increment }) => {
  const [amount, setAmount] = useState(currentPrice + increment);
  const [isProxy, setIsProxy] = useState(false);
  const [maxBid, setMaxBid] = useState(amount + increment * 5);
  const socket = useSocket();

  const handleBid = () => {
    socket.emit('place-bid', {
      auctionId,
      amount,
      isProxy,
      maxBid: isProxy ? maxBid : undefined
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label>Kwota licytacji</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={currentPrice + increment}
          step={increment}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isProxy}
          onChange={(e) => setIsProxy(e.target.checked)}
        />
        <label>Auto-licytacja (Proxy Bid)</label>
      </div>

      {isProxy && (
        <div>
          <label>Maksymalna kwota</label>
          <input
            type="number"
            value={maxBid}
            onChange={(e) => setMaxBid(Number(e.target.value))}
            min={amount + increment}
            step={increment}
          />
          <p className="text-sm text-muted-foreground">
            System będzie automatycznie licytował za Ciebie do tej kwoty
          </p>
        </div>
      )}

      <button onClick={handleBid}>
        {isProxy ? '🤖 Ustaw Auto-licytację' : 'Licytuj'}
      </button>
    </div>
  );
};
```

### Obsługa Socket.IO events

```tsx
// W useSocket lub komponencie
socket.on('bid-placed', (data) => {
  const { bid, newPrice, meta } = data;
  
  if (meta.isProxyBid) {
    toast.info(`🤖 Auto-licytacja: ${bid.bidder.firstName} - ${newPrice} PLN`);
  } else {
    toast.info(`Nowa oferta: ${bid.bidder.firstName} - ${newPrice} PLN`);
  }
});
```

## 4. Migracja na nowy system config

### Backend

```typescript
// Przed
const dbUrl = process.env.DATABASE_URL;
const port = parseInt(process.env.PORT || '8001');
const jwtSecret = process.env.JWT_SECRET;

// Po
import { getConfig } from './lib/config';

const config = getConfig();
const dbUrl = config.db.url;
const port = config.env.port;
const jwtSecret = config.auth.jwtSecret;

// Conditional features
if (config.twilio.enabled) {
  // Initialize Twilio
}
```

### Frontend

```typescript
// Przed
const apiUrl = import.meta.env.VITE_API_URL;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Po
import { config } from '@/lib/config';

const apiUrl = config.api.baseUrl;
const wsUrl = config.api.wsUrl; // Auto-detected
const supabaseUrl = config.supabase.url;
```

## 5. Aktualizacja .env files

### Backend (.env)

```bash
# Wymagane
NODE_ENV=development
PORT=8001
DATABASE_URL=postgresql://user:password@localhost:5432/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=your-secret-min-32-chars
CLIENT_URL=http://localhost:5173

# Opcjonalne
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### Frontend (.env)

```bash
# Wymagane
VITE_API_URL=http://localhost:8001/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Opcjonalne
VITE_WS_URL=http://localhost:8001
VITE_SITE_URL=http://localhost:5173
```

## 6. Testowanie zmian

### Test 1: AuthContext compatibility

```bash
# Powinno działać bez zmian
npm run dev
# Sprawdź logowanie/rejestrację
```

### Test 2: Error Boundaries

```tsx
// Dodaj celowy błąd w komponencie
const BrokenComponent = () => {
  throw new Error('Test error');
  return <div>Never rendered</div>;
};

// Owinięty w WidgetErrorBoundary powinien pokazać fallback UI
<WidgetErrorBoundary widgetName="Test">
  <BrokenComponent />
</WidgetErrorBoundary>
```

### Test 3: Proxy Bidding

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
npm run dev

# W przeglądarce:
# 1. Zaloguj się jako User A
# 2. Ustaw proxy bid: 1000 PLN (max: 1500 PLN)
# 3. W innym oknie jako User B: licytuj 1100 PLN
# 4. Sprawdź czy system auto-przebił do 1200 PLN dla User A
```

### Test 4: Config validation

```bash
# Usuń wymaganą zmienną z .env
# DATABASE_URL=

# Uruchom backend
npm run dev

# Powinien pokazać:
# ❌ Environment validation failed:
#   - DATABASE_URL: Required
```

## 7. Rollback (jeśli coś pójdzie nie tak)

### Szybki rollback

```bash
# Przywróć stary AuthContext
git checkout HEAD -- src/contexts/AuthContext.tsx

# Usuń nowe pliki
rm src/contexts/SessionContext.tsx
rm src/contexts/UserContext.tsx
rm src/contexts/AuthContextCompat.tsx
```

### Partial rollback (zachowaj niektóre zmiany)

```tsx
// W App.tsx - użyj tylko starego AuthContext
import { AuthProvider } from '@/contexts/AuthContext';

<AuthProvider>
  <App />
</AuthProvider>

// Error Boundaries i Proxy Bidding działają niezależnie
```

## 8. Checklist przed deploymentem

- [ ] Wszystkie testy przechodzą
- [ ] Logowanie/rejestracja działa
- [ ] Profil użytkownika się ładuje
- [ ] Proxy bidding testowane ręcznie
- [ ] .env.production ma wszystkie wymagane zmienne
- [ ] Config validation nie rzuca błędów
- [ ] Error Boundaries dodane do kluczowych komponentów
- [ ] Dokumentacja zaktualizowana
- [ ] Team poinformowany o zmianach

## 9. Performance Monitoring

### Sprawdź re-renders

```tsx
// Dodaj do komponentów korzystających z kontekstów
import { useEffect } from 'react';

useEffect(() => {
  console.log('Component re-rendered');
});

// Przed: AuthContext powodował re-render przy każdej zmianie
// Po: SessionContext i UserContext re-renderują tylko konsumentów
```

### React DevTools Profiler

1. Otwórz React DevTools
2. Zakładka "Profiler"
3. Start recording
4. Wykonaj akcję (np. licytacja)
5. Stop recording
6. Sprawdź flamegraph - powinno być mniej re-renderów

## 10. Troubleshooting

### Problem: "useSession must be used within SessionProvider"

**Rozwiązanie:** Upewnij się że SessionProvider jest w hierarchii:

```tsx
<SessionProvider>
  <UserProvider>
    {/* Tutaj możesz używać useSession i useUser */}
  </UserProvider>
</SessionProvider>
```

### Problem: Proxy bid nie działa

**Sprawdź:**
1. Backend: `isProxy` i `maxBid` w schema validation
2. WebSocket connection: `socket.connected === true`
3. Logi backendu: `Proxy bid auto-counter: ...`

### Problem: Config validation fails w production

**Rozwiązanie:** Sprawdź czy wszystkie zmienne są ustawione w środowisku produkcyjnym (Render/Vercel):

```bash
# Render Dashboard -> Environment Variables
# Vercel Dashboard -> Settings -> Environment Variables
```

### Problem: TypeScript errors po migracji

**Rozwiązanie:** Przebuduj typy:

```bash
npm run build
# lub
npx tsc --noEmit
```
