import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  LazyIndex,
  LazyAchievements,
  LazyChampions,
  LazyAuctions,
  LazyAuctionDetail,
  LazyAuctionSuccess,
  LazyBreederMeetings,
  LazyContact,
  LazyReferences,
  LazyPress,
  LazyPressArticle,
  LazyLogin,
  LazyRegister,
  LazyVerifyEmail,
  LazyCompleteProfile,
  LazyNotFound
} from "@/utils/lazyImports";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="champion-pigeon-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<LazyIndex />} />
              <Route path="/achievements" element={<LazyAchievements />} />
              <Route path="/champions" element={<LazyChampions />} />
              <Route path="/auctions" element={<LazyAuctions />} />
              <Route path="/auctions/:id" element={<LazyAuctionDetail />} />
              <Route path="/auctions/success" element={<LazyAuctionSuccess />} />
              <Route path="/breeder-meetings" element={<LazyBreederMeetings />} />
              <Route path="/contact" element={<LazyContact />} />
              <Route path="/references" element={<LazyReferences />} />
              <Route path="/press" element={<LazyPress />} />
              <Route path="/press/:id" element={<LazyPressArticle />} />
              <Route path="/verify-email" element={<LazyVerifyEmail />} />
              <Route path="/complete-profile" element={<LazyCompleteProfile />} />
              <Route path="/login" element={<LazyLogin />} />
              <Route path="/register" element={<LazyRegister />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<LazyNotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
