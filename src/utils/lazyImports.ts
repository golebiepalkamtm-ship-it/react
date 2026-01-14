import { lazy } from 'react';

// Lazy loaded components for code splitting
export const LazyIndex = lazy(() => import('@/pages/Index'));
export const LazyAchievements = lazy(() => import('@/pages/Achievements'));
export const LazyAuctions = lazy(() => import('@/pages/Auctions'));
export const LazyAuctionDetail = lazy(() => import('@/pages/AuctionDetail'));
export const LazyAuctionSuccess = lazy(() => import('@/pages/AuctionSuccess'));
export const LazyBreederMeetings = lazy(() => import('@/pages/BreederMeetings'));
export const LazyContact = lazy(() => import('@/pages/Contact'));
export const LazyReferences = lazy(() => import('@/pages/References'));
export const LazyPress = lazy(() => import('@/pages/Press'));
export const LazyPressArticle = lazy(() => import('@/pages/PressArticle'));
export const LazyVerifyEmail = lazy(() => import('@/pages/VerifyEmail'));
export const LazyNotFound = lazy(() => import('@/pages/NotFound'));
export const LazyAdmin = lazy(() => import('@/pages/Admin'));

// Strony uwierzytelniania i konta użytkownika
export const LazyAuth = lazy(() => import('@/pages/Auth'));
export const LazyAccount = lazy(() => import('@/pages/Account'));

// Nowe strony - Galeria 3D
export const LazyHomePage3D = lazy(() => import('@/pages/HomePage'));
export const LazyChampionsGallery = lazy(() => import('@/pages/ChampionsGallery'));
export const LazyAnimatedSections = lazy(() => import('@/components/animations/AnimatedSections'));

// GSAP Scroll Animations Demo
export const LazyGsapAnimationsDemo = lazy(() => import('@/pages/GsapAnimationsDemo'));
