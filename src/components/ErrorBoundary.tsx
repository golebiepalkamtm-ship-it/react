import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 ERROR BOUNDARY CAUGHT ERROR:');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Full errorInfo:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-2xl w-full space-y-4 p-8">
              <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4 text-center">Coś poszło nie tak</h1>
              <p className="text-muted-foreground text-center">Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.</p>
              
              {this.state.error && (
                <details className="mt-4 p-4 bg-red-950/20 border border-red-500/30 rounded-lg">
                  <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                    Szczegóły błędu (kliknij aby rozwinąć)
                  </summary>
                  <div className="mt-2 space-y-2 text-sm">
                    <div>
                      <strong className="text-red-300">Komunikat:</strong>
                      <pre className="mt-1 p-2 bg-black/50 rounded overflow-x-auto text-red-200">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong className="text-red-300">Stack trace:</strong>
                        <pre className="mt-1 p-2 bg-black/50 rounded overflow-x-auto text-xs text-red-200 max-h-64 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex justify-center gap-4 mt-6">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold/90 transition-colors"
                >
                  Odśwież stronę
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Strona główna
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
