import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Global Error Boundary caught an exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#08080C] px-6 text-center">
          <div className="max-w-md w-full space-y-6 glass-panel-heavy p-8 rounded-2xl border border-netflix-red/20 shadow-[0_0_50px_rgba(229,9,20,0.15)]">
            <div className="inline-flex p-3 rounded-full bg-netflix-red/10 border border-netflix-red/20 text-netflix-red">
              <AlertTriangle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Systems Breakdown
              </h1>
              <p className="text-cinema-gray text-sm leading-relaxed">
                Portal encountered a critical render exception. Our engineers have been alerted.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/60 border border-white/5 rounded-lg p-4 text-left overflow-auto max-h-40 text-[10px] font-mono text-red-400 select-all">
                <strong>Error:</strong> {this.state.error.message}
                {this.state.error.stack && <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-netflix-red hover:bg-red-700 active:scale-95 transition-all text-white font-semibold text-sm cursor-pointer shadow-lg shadow-netflix-red/20"
            >
              <RefreshCw className="w-4 h-4" />
              Reset & Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default GlobalErrorBoundary;
