# Champion Pigeon Auctions

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-19.0.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-7.3.0-purple.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/node.js-20.0.0-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/prisma-7.2.0-blue.svg)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/supabase-2.89.0-green.svg)](https://supabase.com/)

**Champion Pigeon Auctions** is a comprehensive web application for managing and participating in pigeon auctions. The platform provides features for browsing champions, participating in auctions, managing user accounts, and administrative functions.

## 🚀 Quick Start

```bash
# Install dependencies
npm install
cd server && npm install
cd ..

# Set up environment
cp .env.example .env
cp server/.env.example server/.env

# Set up database
npx prisma generate
npx prisma migrate dev

# Run development servers
npm run dev
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[Full Documentation](docs/README.md)** - Complete technical documentation
- **[Quick Summary](docs/SUMMARY.md)** - Quick reference guide

## 🏗️ Architecture

```
Frontend (React + Vite + TypeScript)
    │
    ├─ API Gateway (Express + Node.js)
    │
    ├─ WebSocket Server (Socket.IO)
    │
    └─ Database (PostgreSQL + Prisma)
```

## 🌐 Live Demo

👉 [View Live Demo](https://champion-pigeon-web.onrender.com)

## 🔧 Technology Stack

### Frontend
- React 19 + TypeScript 5.8.3
- Vite 7.3.0 (build tool)
- TailwindCSS 3.4.17 + DaisyUI
- Three.js 0.182.0 + React Three Fiber 9.4.2 (3D)
- TanStack Query 5.90.12 (data fetching)
- Zustand 5.0.9 (state management)
- Framer Motion 12.23.26 (animations)
- Socket.IO Client 4.8.3 (real-time)

### Backend
- Express.js 4.18.2 + Node.js 20
- TypeScript 5.1.6
- Prisma 7.2.0 (ORM)
- Socket.IO 4.7.2 (real-time)
- JWT Authentication
- Zod 3.22.4 (validation)
- Express Rate Limit 6.7.0 (rate limiting)
- In-memory caching system

### Database
- PostgreSQL + Supabase
- Prisma Client 7.2.0
- Row Level Security (RLS) policies
- Optimized indexes for performance

## 📦 Key Features

- **Auction Management**: Create, browse, and bid on pigeon auctions
- **User Authentication**: Secure login/registration with role-based access
- **Champion Gallery**: 3D interactive gallery of champion pigeons
- **Breeder Meetings**: Information about meetings with renowned breeders
- **Press & References**: News articles and customer references
- **Admin Dashboard**: Comprehensive administrative interface
- **Real-time Bidding**: WebSocket-based real-time auction updates
- **Responsive Design**: Mobile-friendly interface with dark/light theme support
- **Enhanced Security**: Input validation, rate limiting, and optimized database policies
- **Performance Optimized**: In-memory caching, database indexes, and async operations

## 🎯 Project Status

✅ **Active Development** - The project is actively maintained and developed.

## 🤝 Contributing

Contributions are welcome! Please refer to the [full documentation](docs/README.md) for contribution guidelines.

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/golebiepalkamtm-ship-it/champion-pigeon-auctions)
- [Issue Tracker](https://github.com/golebiepalkamtm-ship-it/champion-pigeon-auctions/issues)
- [Live Demo](https://champion-pigeon-web.onrender.com)

---

**For detailed technical information, please refer to the [comprehensive documentation](docs/README.md).**
