import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Functional sub-component so we can call useT() inside a class ErrorBoundary. */
function ErrorFallback({ message, onReset }: { message: string | null; onReset: () => void }) {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-card px-4 text-center">
      <h1 className="text-xl font-semibold text-heading">{t("screen.errorTitle")}</h1>
      <p className="max-w-md text-md text-tertiary">
        {message || t("screen.errorBody")}
      </p>
      <Button
        variant="outline"
        onClick={onReset}
      >
        {t("screen.backToDashboard")}
      </Button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          message={this.state.error?.message ?? null}
          onReset={() => {
            this.setState({ hasError: false, error: null });
            window.location.href = "/";
          }}
        />
      );
    }

    return this.props.children;
  }
}
