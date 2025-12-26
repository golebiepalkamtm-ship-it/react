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
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4 p-8">
              <h1 className="text-4xl font-bold text-foreground">Coś poszło nie tak</h1>
              <p className="text-muted-foreground">Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold/90 transition-colors"
              >
                Odśwież stronę
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
