import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends React.Component<
  {children: React.ReactNode},
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {hasError: false};

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {hasError: true};
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#080B10] px-4 text-slate-100">
          <div className="max-w-md rounded-xl border border-slate-800 bg-[#10151E] p-6 text-center space-y-4">
            <h1 className="font-display text-xl font-semibold text-slate-50">
              Unable to render view
            </h1>
            <p className="text-xs text-slate-400">
              Please reset saved preferences and reload the page.
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  window.localStorage.clear();
                } catch {
                  // Ignore storage clear errors
                }
                window.location.reload();
              }}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300 transition-colors"
            >
              Reset &amp; Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
