import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { GSAPPageTransition } from "@/components/motion";
import { SmoothScrollProvider } from "@/components/animations";
import { UIProviders } from "@/components/ui/UIProviders";
import "@/utils/diagnostics";
import { trackMetric } from "@/services/metricsService";
import {
  LazyIndex,
  LazyAchievements,
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
  // Living Web / GSAP demo wyłączone z routingu
  // LazyHomePageLivingWeb,
  // LazyLivingWebShowcase,
  // LazyGsapAnimationsDemo
} from "@/utils/lazyImports";
import ProtectedRoute from "@/components/ProtectedRoute";
import GlobalParallaxBackground from "@/components/GlobalParallaxBackground";

// GSAP Demo - direct import (not lazy)
const GSAPDemo = React.lazy(() => import('@/pages/GSAPDemo'));

const queryClient = new QueryClient();

const CosmicPortal = React.lazy(() => import('@/chronoTunnel/CosmicPortal'));

const App = () => {
  useEffect(() => {
    trackMetric('SITE').catch(() => {});
  }, []);

  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="champion-pigeon-theme">
        <LocaleProvider>
          <AuthProvider>
            <UIProviders>
              <SmoothScrollProvider>
                <GlobalParallaxBackground />
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                <GSAPPageTransition 
                  defaultStyle="reveal"
                  duration={0.9}
                  primaryColor="#0a0a0f"
                  accentColor="#B8860B"
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                    <Route path="/" element={<LazyIndex />} />
                    <Route path="/achievements" element={<LazyAchievements />} />
                    <Route path="/auctions" element={<LazyAuctions />} />
                    <Route path="/auctions/:id" element={<LazyAuctionDetail />} />
                    <Route path="/auctions/success" element={<LazyAuctionSuccess />} />
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
