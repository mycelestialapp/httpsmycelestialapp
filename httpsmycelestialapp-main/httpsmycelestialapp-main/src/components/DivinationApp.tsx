import { useState } from "react";
import Starfield from "./Starfield";
import InputCard from "./InputCard";
import type { DivinationInfo } from "./InputCard";
import LoadingOverlay from "./LoadingOverlay";
import ResultCard from "./ResultCard";
import { fetchBaziResult, type BaziApiResult } from "@/lib/baziApi";

export type AppState = "input" | "loading" | "result";

const DivinationApp = () => {
  const [state, setState] = useState<AppState>("input");
  const [name, setName] = useState("");
  const [info, setInfo] = useState<DivinationInfo | null>(null);
  const [baziResult, setBaziResult] = useState<BaziApiResult | null>(null);
  const [baziError, setBaziError] = useState<string | null>(null);

  const handleDivine = async (divinationInfo: DivinationInfo) => {
    setInfo(divinationInfo);
    setBaziError(null);
    setBaziResult(null);
    setState("loading");
    const start = Date.now();

    try {
      const result = await fetchBaziResult(divinationInfo);
      setBaziResult(result);
    } catch (e) {
      setBaziError(e instanceof Error ? e.message : "八字解析失败");
    }

    const minLoadingMs = 1200;
    const elapsed = Date.now() - start;
    setTimeout(() => setState("result"), Math.max(0, minLoadingMs - elapsed));
  };

  const handleReset = () => {
    setState("input");
    setName("");
    setInfo(null);
    setBaziResult(null);
    setBaziError(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-8">
      <Starfield />

      <div className="relative z-10 w-full max-w-md">
        {state === "input" && (
          <InputCard name={name} setName={setName} onDivine={handleDivine} />
        )}
        {state === "loading" && <LoadingOverlay />}
        {state === "result" && info && (
          <ResultCard
            info={info}
            baziResult={baziResult}
            baziError={baziError}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default DivinationApp;
