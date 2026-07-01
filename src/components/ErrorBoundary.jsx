import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const fallback = this.props.fallbackComponent || this.props.fallback;
      if (fallback) {
        return typeof fallback === 'function' ? fallback(this.state.error) : fallback;
      }
      return (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-text-muted text-sm font-mono mb-2">Something went wrong</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-surface-card border border-surface-border rounded-lg text-text-secondary text-sm hover:border-brand-orange hover:text-brand-orange transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
