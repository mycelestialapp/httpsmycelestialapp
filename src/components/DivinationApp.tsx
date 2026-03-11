import { useState } from "react";
import Starfield from "./Starfield";
import InputCard from "./InputCard";
import type { DivinationInfo } from "./InputCard";
import LoadingOverlay from "./LoadingOverlay";
import ResultCard from "./ResultCard";

export type AppState = "input" | "loading" | "result";

const DivinationApp = () => {
  const [state, setState] = useState<AppState>("input");
  const [name, setName] = useState("");
  const [info, setInfo] = useState<DivinationInfo | null>(null);

  const handleDivine = (divinationInfo: DivinationInfo) => {
    setInfo(divinationInfo);
    setState("loading");
    setTimeout(() => setState("result"), 2500);
  };

  const handleReset = () => {
    setState("input");
    setName("");
    setInfo(null);
  };

  return (
    <div className="relative min-h-screen flex items-start justify-center overflow-x-hidden overflow-y-auto px-4 pt-32 md:pt-40 lg:pt-48 pb-16">
      <Starfield />

      <div className="relative z-10 w-full max-w-md">
        {state === "input" && (
          <InputCard name={name} setName={setName} onDivine={handleDivine} />
        )}
        {state === "loading" && <LoadingOverlay />}
        {state === "result" && info && <ResultCard info={info} onReset={handleReset} />}
      </div>
    </div>
  );
};

export default DivinationApp;
