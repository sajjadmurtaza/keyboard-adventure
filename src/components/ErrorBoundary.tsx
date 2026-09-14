"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error(error, info);
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#F4FBFF] p-6 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#7657E8]">
            Let&apos;s try that again
          </h1>
          <p className="max-w-md text-lg text-[#34364A]">
            Something went wrong, but you can keep practicing. Reload the page to continue the adventure.
          </p>
          <button
            type="button"
            className="min-h-12 rounded-full bg-[#7657E8] px-6 font-bold text-white"
            onClick={() => this.setState({ failed: false })}
          >
            Reload
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
