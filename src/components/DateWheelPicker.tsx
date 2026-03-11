/**
 * 单列滚轮选择器（年/月/日共用）
 * 使用 scroll-snap 实现居中吸附，深色空灵主题
 */
import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5;
const PADDING_ITEMS = Math.floor(VISIBLE_COUNT / 2);

export interface DateWheelColumnProps<T = number | string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}

function DateWheelColumn<T extends number | string>({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: DateWheelColumnProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const valueToIndex = useCallback(
    (v: T | null) => {
      if (v === null || v === undefined) return 0;
      const i = options.findIndex((o) => o.value === v);
      return i >= 0 ? i : 0;
    },
    [options]
  );

  const index = valueToIndex(value);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || options.length === 0) return;
    const centerOffset = (el.clientHeight - ITEM_HEIGHT) / 2;
    const targetScroll = (PADDING_ITEMS + index) * ITEM_HEIGHT - centerOffset;
    if (Math.abs(el.scrollTop - targetScroll) > 1) {
      el.scrollTop = Math.max(0, targetScroll);
    }
  }, [index, options.length]);

  const scrollToIndex = useCallback(
    (i: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const centerOffset = (el.clientHeight - ITEM_HEIGHT) / 2;
      el.scrollTo({ top: Math.max(0, (PADDING_ITEMS + i) * ITEM_HEIGHT - centerOffset), behavior: "smooth" });
    },
    []
  );

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const centerOffset = (el.clientHeight - ITEM_HEIGHT) / 2;
    const center = el.scrollTop + centerOffset;
    let newIndex = Math.round(center / ITEM_HEIGHT) - PADDING_ITEMS;
    newIndex = Math.max(0, Math.min(options.length - 1, newIndex));
    const newVal = options[newIndex]?.value;
    if (newVal !== undefined && newVal !== value) {
      isScrollingRef.current = true;
      onChange(newVal as T);
    }
  }, [options, value, onChange]);

  const handleScrollEnd = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const centerOffset = (el.clientHeight - ITEM_HEIGHT) / 2;
    const center = el.scrollTop + centerOffset;
    let newIndex = Math.round(center / ITEM_HEIGHT) - PADDING_ITEMS;
    newIndex = Math.max(0, Math.min(options.length - 1, newIndex));
    isScrollingRef.current = false;
    scrollToIndex(newIndex);
  }, [options.length, scrollToIndex]);

  if (options.length === 0) return null;

  const padding = Array.from({ length: PADDING_ITEMS }, (_, i) => (
    <div key={`pad-${i}`} className="h-[44px] shrink-0" aria-hidden />
  ));

  return (
    <div
      className={cn("relative flex-1 min-w-0 flex flex-col items-center", className)}
      aria-label={ariaLabel}
    >
      {/* 上下遮罩渐变 */}
      <div
        className="absolute left-0 right-0 top-0 z-10 h-[88px] pointer-events-none shrink-0"
        style={{
          background: "linear-gradient(to bottom, #0f0d1a 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute left-0 right-0 bottom-0 z-10 h-[88px] pointer-events-none shrink-0"
        style={{
          background: "linear-gradient(to top, #0f0d1a 0%, transparent 100%)",
        }}
      />
      {/* 中间高亮条 */}
      <div
        className="absolute left-0 right-0 z-0 h-[44px] rounded-lg border border-amber-500/20 bg-amber-500/5 pointer-events-none"
        style={{ top: "50%", transform: "translateY(-50%)" }}
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchEnd={handleScrollEnd}
        onMouseUp={handleScrollEnd}
        className="w-full overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center py-[88px]"
        style={{
          height: ITEM_HEIGHT * VISIBLE_COUNT,
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {padding}
        {options.map((opt, i) => (
          <button
            key={String(opt.value) + i}
            type="button"
            onClick={() => {
              scrollToIndex(i);
              onChange(opt.value as T);
            }}
            className={cn(
              "h-[44px] w-full shrink-0 flex items-center justify-center text-base transition-colors scroll-snap-align-center",
              value === opt.value ? "text-amber-300 font-semibold" : "text-gray-400"
            )}
            style={{ scrollSnapAlign: "center" }}
          >
            {opt.label}
          </button>
        ))}
        {padding}
      </div>
    </div>
  );
}

export default DateWheelColumn;
