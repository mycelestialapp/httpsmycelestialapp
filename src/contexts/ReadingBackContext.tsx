/**
 * 占卜解读页「内层返回」：在符文/塔罗/神谕/雷诺曼等看到解读结果时，
 * 点返回先回到该工具的占卜主界面（选牌/抽牌），而不是直接回星圆。
 */
import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';

export type InnerBackHandler = () => boolean;

type ReadingBackContextValue = {
  registerHandler: (handler: InnerBackHandler) => void;
  unregisterHandler: () => void;
  tryInnerBack: () => boolean;
};

const handlerRef = { current: null as InnerBackHandler | null };

export const ReadingBackContext = createContext<ReadingBackContextValue | null>(null);

export function ReadingBackProvider({ children }: { children: ReactNode }) {
  const registerHandler = useCallback((handler: InnerBackHandler) => {
    handlerRef.current = handler;
  }, []);
  const unregisterHandler = useCallback(() => {
    handlerRef.current = null;
  }, []);
  const tryInnerBack = useCallback(() => {
    const fn = handlerRef.current;
    if (typeof fn === 'function') return fn();
    return false;
  }, []);

  return (
    <ReadingBackContext.Provider value={{ registerHandler, unregisterHandler, tryInnerBack }}>
      {children}
    </ReadingBackContext.Provider>
  );
}

export function useReadingBack(): ReadingBackContextValue | null {
  return useContext(ReadingBackContext);
}
