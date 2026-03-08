import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import React, { Suspense, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { GSAPPageTransition } from "@/components/motion";
import { UIProviders } from "@/components/ui/UIProviders";

import { trackMetric } from "@/services/metricsService";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

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
  LazyHomePage,
  LazyHomePagePremium,
  LazyTerms,
  LazyPrivacy,
} from "@/utils/lazyImports";
import ProtectedRoute from "@/components/ProtectedRoute";
import { HeroBackground } from "@/styles/HeroBackground";

import VolumetricBackground from "@/components/VolumetricBackground";
import RippleShockwave from "@/components/RippleShockwave";

// GSAP Demo - removed as file does not exist
// const GSAPDemo = React.lazy(() => import("@/pages/GSAPDemo"));

// Awwwards Prototype - Site of the Year Candidate
const AwwwardsPrototype = React.lazy(() => import("@/pages/AwwwardsPrototype"));

const queryClient = new QueryClient();

const BackgroundWrapper = React.memo(() => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -9999,
        pointerEvents: "none",
      }}
    >
      <VolumetricBackground />
      <RippleShockwave />
    </div>
  );
});

import { SmoothScrollProvider } from "@/components/animations/SmoothScrollProvider";

const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackMetric("SITE").catch(() => {});
  }, [location.pathname]);
  return null;
};

const App = () => {
  useEffect(() => {
    // Remove FOUC guard
    document.documentElement.classList.remove("js-loading");
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="champion-pigeon-theme">
          <LocaleProvider>
            <AuthProvider>
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <TooltipProvider>
                  <AnalyticsTracker />
                  <Analytics />
                  <SpeedInsights />
                  <Toaster />
                  <BackgroundWrapper />
                  <UIProviders>
                    <GSAPPageTransition duration={0.7} primaryColor="#09090b">
                      <SmoothScrollProvider>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Routes>
                            <Route path="/" element={<LazyHomePagePremium />} />
                            <Route
                              path="/wyniki-lotowe"
                              element={<LazyFlightResults />}
                            />
                            <Route
                              path="/flight-results"
                              element={<Navigate to="/wyniki-lotowe" replace />}
                            />
                            <Route
                              path="/auctions"
                              element={<LazyAuctions />}
                            />
                            <Route
                              path="/auctions/:id"
                              element={<LazyAuctionDetail />}
                            />
                            <Route
                              path="/auctions/success"
                              element={<LazyAuctionSuccess />}
                            />
                            <Route
                              path="/breeder-meetings"
                              element={<LazyBreederMeetings />}
                            />
                            <Route path="/contact" element={<LazyContact />} />
                            <Route
                              path="/references"
                              element={<LazyReferences />}
                            />
                            <Route path="/press" element={<LazyPress />} />
                            <Route
                              path="/press/:id"
                              element={<LazyPressArticle />}
                            />
                            <Route
                              path="/agent"
                              element={<LazyAgentDesktop />}
                            />
                            <Route
                              path="/verify-email"
                              element={
                                <ProtectedRoute allowUnverified>
                                  <LazyVerifyEmail />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/auth" element={<LazyAuth />} />
                            <Route
                              path="/admin"
                              element={
                                <ProtectedRoute requiredRole="ADMIN">
                                  <LazyAdmin />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/homepage"
                              element={<LazyHomePage />}
                            />
                            <Route
                              path="/homepage-premium"
                              element={<LazyHomePagePremium />}
                            />
                            {/* <Route path="/gsap-demo" element={<GSAPDemo />} /> */}
                            <Route
                              path="/awwwards-prototype"
                              element={<AwwwardsPrototype />}
                            />
                            <Route
                              path="/login"
                              element={
                                <Navigate to="/auth?mode=login" replace />
                              }
                            />
                            <Route
                              path="/register"
                              element={
                                <Navigate to="/auth?mode=register" replace />
                              }
                            />
                            <Route
                              path="/champions"
                              element={<LazyChampionsGallery />}
                            />
                            <Route path="/terms" element={<LazyTerms />} />
                            <Route path="/privacy" element={<LazyPrivacy />} />
                          </Routes>
                        </Suspense>
                      </SmoothScrollProvider>
                    </GSAPPageTransition>
                  </UIProviders>
                </TooltipProvider>
              </BrowserRouter>
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
