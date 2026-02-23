import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import AppLayout from "./components/AppLayout";
import OraclePage from "./pages/OraclePage";
import BaziPage from "./pages/BaziPage";
import TribePage from "./pages/TribePage";
import AltarPage from "./pages/AltarPage";
import LibraryPage from "./pages/LibraryPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** Capture ?ref= and ?soul= params from URL and store in localStorage */
const RefCapture = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const soul = params.get('soul');
    if (ref) {
      localStorage.setItem('celestial_ref', ref);
    }
    if (soul) {
      localStorage.setItem('celestial_compare_soul', soul);
    }
    if (ref || soul) {
      params.delete('ref');
      params.delete('soul');
      const clean = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (clean ? `?${clean}` : ''));
    }
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <RefCapture />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<OraclePage />} />
              <Route path="/oracle/bazi" element={<BaziPage />} />
              <Route path="/tribe" element={<TribePage />} />
              <Route path="/altar" element={<AltarPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/subscribe" element={<SubscriptionPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/auth" element={<AuthPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
