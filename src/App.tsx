import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Achievements from "./pages/Achievements";
import Champions from "./pages/Champions";
import Auctions from "./pages/Auctions";
import AuctionDetail from "./pages/AuctionDetail";
import AuctionSuccess from "./pages/AuctionSuccess";
import BreederMeetings from "./pages/BreederMeetings";
import Contact from "./pages/Contact";
import References from "./pages/References";
import Press from "./pages/Press";
import PressArticle from "./pages/PressArticle";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/champions" element={<Champions />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            <Route path="/auctions/success" element={<AuctionSuccess />} />
            <Route path="/breeder-meetings" element={<BreederMeetings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/references" element={<References />} />
            <Route path="/press" element={<Press />} />
            <Route path="/press/:id" element={<PressArticle />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
