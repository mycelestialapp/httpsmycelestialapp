import { Component, type ReactNode } from "react";
import DatePickerFallback from "@/components/DatePickerFallback";
import type { BirthValue } from "@/components/NumerologyBirthWheel";

interface FallbackProps {
  initialValue: BirthValue | null;
  onSelect: (v: BirthValue) => void;
  onClose: () => void;
}

interface Props {
  children: ReactNode;
  fallbackProps: FallbackProps;
}

interface State {
  hasError: boolean;
}

export class DatePickerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError = (): State => ({ hasError: true });

  componentDidCatch(error: Error) {
    console.warn("Date picker load error:", error?.message);
  }

  render() {
    if (this.state.hasError) {
      return <DatePickerFallback {...this.props.fallbackProps} />;
    }
    return this.props.children;
  }
}
