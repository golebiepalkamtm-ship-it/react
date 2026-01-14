import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  widgetName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🟠 Widget Error [${this.props.widgetName || 'Unknown'}]:`, error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-950/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-red-400 mb-1">
                  {this.props.widgetName ? `Błąd w ${this.props.widgetName}` : 'Błąd komponentu'}
                </h3>
                <p className="text-xs text-red-300/80">
                  Ten element nie może być wyświetlony. Reszta strony działa normalnie.
                </p>
                {this.state.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-red-400/60 hover:text-red-400">
                      Szczegóły
                    </summary>
                    <pre className="mt-1 p-2 bg-black/30 rounded text-xs text-red-300/70 overflow-x-auto">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
