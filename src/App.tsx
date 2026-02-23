import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import OraclePage from "./pages/OraclePage";
import BaziPage from "./pages/BaziPage";
import TribePage from "./pages/TribePage";
import AltarPage from "./pages/AltarPage";
import LibraryPage from "./pages/LibraryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<OraclePage />} />
            <Route path="/oracle/bazi" element={<BaziPage />} />
            <Route path="/tribe" element={<TribePage />} />
            <Route path="/altar" element={<AltarPage />} />
            <Route path="/library" element={<LibraryPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
