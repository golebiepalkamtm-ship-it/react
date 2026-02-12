import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { Suspense, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { GSAPPageTransition } from "@/components/motion";
import { SmoothScrollProvider } from "@/components/animations";
import { UIProviders } from "@/components/ui/UIProviders";

import { trackMetric } from "@/services/metricsService";

import {
  LazyIndex,
  LazyFlightResults,
  LazyAuctions,
  LazyAuctionDetail,
  LazyAuctionSuccess,
  LazyBreederMeetings,
  LazyContact,
  LazyReferences,
  LazyPress,
  LazyPressArticle,
  LazyVerifyEmail,
  LazyNotFound,
  LazyAdmin,
  LazyChampionsGallery,
  LazyAgentDesktop,
  LazyAuth,
  LazyAccount,
  LazyHomePage,
  LazyHomePagePremium,
  LazyForumMain,
  LazyForumTopicList,
  LazyForumTopicDetail,
  // Living Web / GSAP demo wyłączone z routingu
  // LazyHomePageLivingWeb,
  // LazyLivingWebShowcase,
  // LazyGsapAnimationsDemo
} from "@/utils/lazyImports";
import ProtectedRoute from "@/components/ProtectedRoute";
import GlobalParallaxBackground from "@/components/GlobalParallaxBackground";

// GSAP Demo - direct import (not lazy)
const GSAPDemo = React.lazy(() => import('@/pages/GSAPDemo'));

// Awwwards Prototype - Site of the Year Candidate
const AwwwardsPrototype = React.lazy(() => import('@/pages/AwwwardsPrototype'));

const queryClient = new QueryClient();

// Scroll to top on normal route changes.
// When navigation carries location.state.scrollTo (sekcje O nas / Kontakt),
// zostawiamy scroll, bo obsłuży go strona główna.
const ScrollToTopOnRouteChange = () => {
  const location = useLocation();

  useEffect(() => {
    const state = (location.state as any) || {};
    if (state.scrollTo) return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
};

const BackgroundWrapper = () => {
  const location = useLocation();
  const isTimeTunnel = location.pathname === '/wyniki-lotowe' || location.pathname === '/flight-results';

  if (isTimeTunnel) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -100,
          background: 'linear-gradient(175deg, hsl(230, 50%, 10%) 0%, hsl(225, 55%, 8%) 30%, hsl(220, 60%, 7%) 60%, hsl(225, 55%, 6%) 100%)',
          pointerEvents: 'none'
        }}
      />
      <GlobalParallaxBackground />
    </>
  );
};

const App = () => {
  useEffect(() => {
    trackMetric('SITE').catch(() => { });
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="champion-pigeon-theme">
          <LocaleProvider>
            <AuthProvider>
              <UIProviders>
                <SmoothScrollProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter
                      future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                      }}
                    >
                      <BackgroundWrapper />
                      <ScrollToTopOnRouteChange />
                      <GSAPPageTransition
                        defaultStyle="reveal"
                        duration={0.9}
                        primaryColor="#0a0a0f"
                        accentColor="#B8860B"
                      >
                        <Suspense fallback={<LoadingSpinner />}>
                          <Routes>
                            <Route path="/" element={<LazyIndex />} />
                            <Route path="/wyniki-lotowe" element={<LazyFlightResults />} />
                            <Route path="/flight-results" element={<Navigate to="/wyniki-lotowe" replace />} />
                            <Route path="/auctions" element={<LazyAuctions />} />
                            <Route path="/auctions/:id" element={<LazyAuctionDetail />} />
                            <Route path="/auctions/success" element={<LazyAuctionSuccess />} />
                            <Route path="/forum" element={<LazyForumMain />} />
                            <Route path="/forum/category/:categoryId" element={<LazyForumTopicList />} />
                            <Route path="/forum/topic/:topicId" element={<LazyForumTopicDetail />} />
                            <Route path="/breeder-meetings" element={<LazyBreederMeetings />} />
                            <Route path="/contact" element={<LazyContact />} />
                            <Route path="/references" element={<LazyReferences />} />
                            <Route path="/press" element={<LazyPress />} />
                            <Route path="/press/:id" element={<LazyPressArticle />} />
                            <Route path="/agent" element={<LazyAgentDesktop />} />
                            <Route path="/verify-email" element={
                              <ProtectedRoute allowUnverified>
                                <LazyVerifyEmail />
                              </ProtectedRoute>
                            } />
                            <Route path="/auth" element={<LazyAuth />} />
                            <Route path="/account" element={
                              <ProtectedRoute allowUnverified>
                                <LazyAccount />
                              </ProtectedRoute>
                            } />
                            <Route path="/admin" element={
                              <ProtectedRoute requiredRole="ADMIN">
                                <LazyAdmin />
                              </ProtectedRoute>
                            } />
                            {/* Showcase / demo routes */}
                            <Route path="/homepage" element={<LazyHomePage />} />
                            <Route path="/homepage-premium" element={<LazyHomePagePremium />} />
                            <Route path="/gsap-demo" element={<GSAPDemo />} />
                            <Route path="/awwwards-prototype" element={<AwwwardsPrototype />} />
                            {/* Living Web / GSAP demo wyłączone */}
                            {/* <Route path="/homepage-livingweb" element={<LazyHomePageLivingWeb />} /> */}
                            {/* <Route path="/livingweb-showcase" element={<LazyLivingWebShowcase />} /> */}
                            {/* <Route path="/gsap-animations-demo" element={<LazyGsapAnimationsDemo />} /> */}
                            <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
                            <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
                            <Route path="/champions" element={<LazyChampionsGallery />} />
                            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                            <Route path="*" element={<LazyNotFound />} />
                          </Routes>
                        </Suspense>
                      </GSAPPageTransition>
                    </BrowserRouter>
                  </TooltipProvider>
                </SmoothScrollProvider>
              </UIProviders>
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
