import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message ?? '';
      const isCarousel = /Carousel|carousel/i.test(msg);
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#030305', color: '#D4AF37' }}>
          <div className="max-w-md text-center space-y-4">
            <p className="text-lg font-semibold" style={{ color: '#D4AF37' }}>
              页面加载出错
            </p>
            <p className="text-sm" style={{ color: 'rgba(212, 175, 55, 0.85)' }}>
              {isCarousel
                ? 'Carousel 组件未正确加载，已尝试在入口预加载。请刷新页面（Ctrl+F5 或 Cmd+Shift+R）重试。'
                : '请刷新页面重试。若仍无法打开，请检查浏览器控制台（F12）中的报错信息。'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: '#D4AF37', color: '#030305' }}
            >
              刷新页面
            </button>
            {this.state.error && (
              <pre className="text-left text-xs overflow-auto max-h-32 mt-4 p-3 rounded" style={{ color: 'rgba(212, 175, 55, 0.7)', background: 'rgba(0,0,0,0.4)' }}>
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
