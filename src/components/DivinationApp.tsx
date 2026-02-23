import { useState } from "react";
import Starfield from "./Starfield";
import InputCard from "./InputCard";
import LoadingOverlay from "./LoadingOverlay";
import ResultCard from "./ResultCard";

export type AppState = "input" | "loading" | "result";

const DivinationApp = () => {
  const [state, setState] = useState<AppState>("input");
  const [name, setName] = useState("");

  const handleDivine = () => {
    if (!name.trim()) return;
    setState("loading");
    setTimeout(() => setState("result"), 2500);
  };

  const handleReset = () => {
    setState("input");
    setName("");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8">
      <Starfield />

      <div className="relative z-10 w-full max-w-md">
        {state === "input" && (
          <InputCard name={name} setName={setName} onDivine={handleDivine} />
        )}
        {state === "loading" && <LoadingOverlay />}
        {state === "result" && <ResultCard name={name} onReset={handleReset} />}
      </div>
    </div>
  );
};

export default DivinationApp;
