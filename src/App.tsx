import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import Forum from "./pages/Forum";
import ItemPage from "./pages/ItemPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import TopRated from "./pages/TopRated";

const queryClient = new QueryClient();

// Get base path from environment or default to root
const basePath = import.meta.env.BASE_URL || '/';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basePath}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/:postId" element={<Forum />} />
            <Route path="/item/:pageid" element={<ItemPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/toprated" element={<TopRated />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
