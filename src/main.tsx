import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // 新加
import App from "./App.tsx";
import "./i18n";
import "./index.css";

const RootFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[hsl(222,45%,6%)]">
    <div className="w-8 h-8 rounded-full border-2 border-amber-400/60 border-t-transparent animate-spin" />
  </div>
);

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<RootFallback />}>
    <BrowserRouter>  {/* 新加这一行 */}
      <App />
    </BrowserRouter>
  </Suspense>
);
