import { lazy } from 'react';

// Lazy loaded components for code splitting
export const LazyIndex = lazy(() => import('../pages/Index').then(module => ({ default: module.default })));
export const LazyAchievements = lazy(() => import('../pages/Achievements').then(module => ({ default: module.default })));
export const LazyChampions = lazy(() => import('../pages/Champions').then(module => ({ default: module.default })));
export const LazyAuctions = lazy(() => import('../pages/Auctions').then(module => ({ default: module.default })));
export const LazyAuctionDetail = lazy(() => import('../pages/AuctionDetail').then(module => ({ default: module.default })));
export const LazyAuctionSuccess = lazy(() => import('../pages/AuctionSuccess').then(module => ({ default: module.default })));
export const LazyBreederMeetings = lazy(() => import('../pages/BreederMeetings').then(module => ({ default: module.default })));
export const LazyContact = lazy(() => import('../pages/Contact').then(module => ({ default: module.default })));
export const LazyReferences = lazy(() => import('../pages/References').then(module => ({ default: module.default })));
export const LazyPress = lazy(() => import('../pages/Press').then(module => ({ default: module.default })));
export const LazyPressArticle = lazy(() => import('../pages/PressArticle').then(module => ({ default: module.default })));
export const LazyLogin = lazy(() => import('../pages/Login').then(module => ({ default: module.default })));
export const LazyRegister = lazy(() => import('../pages/Register').then(module => ({ default: module.default })));
export const LazyVerifyEmail = lazy(() => import('../pages/VerifyEmail').then(module => ({ default: module.default })));
export const LazyCompleteProfile = lazy(() => import('../pages/CompleteProfile').then(module => ({ default: module.default })));
export const LazyNotFound = lazy(() => import('../pages/NotFound').then(module => ({ default: module.default })));
