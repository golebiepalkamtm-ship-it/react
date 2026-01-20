import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { PageTransition } from "@/components/motion";
import { SmoothScrollProvider } from "@/components/animations";
import "@/utils/diagnostics";
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
  LazyAccount
} from "@/utils/lazyImports";
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
                    <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
                    <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
                    <Route path="/champions" element={<LazyChampionsGallery />} />
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
