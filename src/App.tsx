import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
  LazyForumMain,
  LazyForumTopicList,
  LazyForumTopicDetail,
} from "@/utils/lazyImports";
import { CursorFollower } from "@/components/animations/MagneticCursor";
import ProtectedRoute from "@/components/ProtectedRoute";

// GSAP Demo - removed as file does not exist
// const GSAPDemo = React.lazy(() => import("@/pages/GSAPDemo"));

// Awwwards Prototype - Site of the Year Candidate
const AwwwardsPrototype = React.lazy(() => import("@/pages/AwwwardsPrototype"));

const queryClient = new QueryClient();

const BackgroundWrapper = () => {
  const location = useLocation();
  const isTimeTunnel =
    location.pathname === "/wyniki-lotowe" ||
    location.pathname === "/flight-results";

  if (isTimeTunnel) return null;

  return null;
};

import { SmoothScrollProvider } from "@/components/animations/SmoothScrollProvider";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  useEffect(() => {
    trackMetric("SITE").catch(() => {});
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
                <ScrollToTop />
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <CursorFollower size={22} color="rgba(166, 142, 78, 0.45)" />
                  <UIProviders>
                    <SmoothScrollProvider>
                      <BackgroundWrapper />
                      <GSAPPageTransition
                        defaultStyle="reveal"
                        duration={0.9}
                        primaryColor="#09090b"
                        accentColor="#A68E4E"
                        useRouteStyles={false}
                      >
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
                            <Route path="/forum" element={<LazyForumMain />} />
                            <Route
                              path="/forum/category/:categoryId"
                              element={<LazyForumTopicList />}
                            />
                            <Route
                              path="/forum/topic/:topicId"
                              element={<LazyForumTopicDetail />}
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
                          </Routes>
                        </Suspense>
                      </GSAPPageTransition>
                    </SmoothScrollProvider>
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
