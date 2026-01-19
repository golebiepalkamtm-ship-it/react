import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { PageTransition } from "@/components/motion";
import { SmoothScrollProvider } from "@/components/animations";
import "@/utils/diagnostics";
const LazyIndex = lazy(() => import('@/pages/Index'));
const LazyAuctions = lazy(() => import('@/pages/Auctions'));
const LazyAuctionDetail = lazy(() => import('@/pages/AuctionDetail'));
const LazyAuctionSuccess = lazy(() => import('@/pages/AuctionSuccess'));
const LazyBreederMeetings = lazy(() => import('@/pages/BreederMeetings'));
const LazyContact = lazy(() => import('@/pages/Contact'));
const LazyReferences = lazy(() => import('@/pages/References'));
const LazyPress = lazy(() => import('@/pages/Press'));
const LazyPressArticle = lazy(() => import('@/pages/PressArticle'));
const LazyVerifyEmail = lazy(() => import('@/pages/VerifyEmail'));
const LazyNotFound = lazy(() => import('@/pages/NotFound'));
const LazyAdmin = lazy(() => import('@/pages/Admin'));
const LazyChampionsGallery = lazy(() => import('@/pages/ChampionsGallery'));
const LazyAgentDesktop = lazy(() => import('@/pages/AgentDesktop'));
const LazyChronoTunnel = lazy(() => import('@/pages/ChronoTunnelPage'));
const LazyAuth = lazy(() => import('@/pages/Auth'));
const LazyAccount = lazy(() => import('@/pages/Account'));
import ProtectedRoute from "@/components/ProtectedRoute";
import GlobalParallaxBackground from "@/components/GlobalParallaxBackground";



const queryClient = new QueryClient();

const App = () => {
  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="champion-pigeon-theme">
        <LocaleProvider>
          <AuthProvider>
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
                <PageTransition>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                    <Route path="/" element={<LazyIndex />} />
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
                    <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
                    <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
                    <Route path="/champions" element={<LazyChampionsGallery />} />
                    <Route path="/historia" element={<LazyChronoTunnel />} />
                    <Route path="/achievements" element={<LazyChronoTunnel />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<LazyNotFound />} />
                    </Routes>
                  </Suspense>
                </PageTransition>
              </BrowserRouter>
            </TooltipProvider>
          </SmoothScrollProvider>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
