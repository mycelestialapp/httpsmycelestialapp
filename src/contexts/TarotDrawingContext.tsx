/**
 * 塔羅抽牌中時隱藏底部導航，營造全屏沉浸感
 */
import { createContext, useContext, type ReactNode } from 'react';

type TarotDrawingContextValue = {
  setDrawing: (drawing: boolean) => void;
};

const noop = () => {};
export const TarotDrawingContext = createContext<TarotDrawingContextValue>({ setDrawing: noop });

export function useTarotDrawing(): TarotDrawingContextValue {
  return useContext(TarotDrawingContext);
}
