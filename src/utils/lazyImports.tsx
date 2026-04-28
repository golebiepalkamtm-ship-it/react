import { lazy } from "react";

// Lazy load all page components
export const LazyIndex = lazy(() => import("@/pages/Index"));
export const LazyFlightResults = lazy(() => import("@/pages/FlightResults"));
export const LazyAuctions = lazy(() => import("@/pages/Auctions"));
export const LazyAuctionDetail = lazy(() => import("@/pages/AuctionDetail"));
export const LazyAuctionSuccess = lazy(() => import("@/pages/AuctionSuccess"));
export const LazyBreederMeetings = lazy(
  () => import("@/pages/BreederMeetings"),
);
export const LazyContact = lazy(() => import("@/pages/Contact"));
export const LazyReferences = lazy(() => import("@/pages/References"));
export const LazyPress = lazy(() => import("@/pages/Press"));
export const LazyPressArticle = lazy(() => import("@/pages/PressArticle"));
export const LazyVerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
export const LazyNotFound = lazy(() => import("@/pages/NotFound"));
export const LazyAdmin = lazy(() => import("@/pages/Admin"));
export const LazyChampionsGallery = lazy(
  () => import("@/pages/ChampionsGallery"),
);
export const LazyAgentDesktop = lazy(() => import("@/pages/AgentDesktop"));
export const LazyAuth = lazy(() => import("@/pages/Auth"));
export const LazyHomePage = lazy(() => import("@/pages/HomePage"));
export const LazyHomePagePremium = lazy(
  () => import("@/pages/HomePagePremium"),
);
export const LazyTerms = lazy(() => import("@/pages/Terms"));
export const LazyPrivacy = lazy(() => import("@/pages/Privacy"));
export const LazyRCE = lazy(() => import("@/pages/RCE"));
