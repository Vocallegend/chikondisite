import { Component, type ErrorInfo, type ReactNode } from "react";
import { ButtonLink } from "./Button";
import { Notice } from "./Notice";
import { reportDiagnostic } from "@/lib/diagnostics";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Last line of defence against a blank screen.
 *
 * Without this, any exception thrown while rendering a route — in any page
 * component, at any time — unmounts the whole React tree and leaves the
 * visitor with an empty page and no way forward. The header, footer and the
 * download link keep working, and the error is recorded in the diagnostics
 * buffer (see src/lib/diagnostics.ts) rather than only in the console.
 *
 * This is deliberately separate from the static #boot-fallback in index.html:
 * that covers the app never starting, this covers the app starting and then
 * failing.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportDiagnostic("render", error.message || "Render failed", info.componentStack ?? undefined);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <section
        className="container-page flex flex-1 items-center py-20"
        style={{ minHeight: "60vh" }}
      >
        <div className="mx-auto w-full max-w-xl">
          <Notice tone="danger" title="Something went wrong on this page">
            The rest of the site is fine. Reload the page, or head back to the home page — and the
            APK download below never depended on this page in the first place.
          </Notice>

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink to="/" size="lg" external>
              Reload the page
            </ButtonLink>
            <ButtonLink to="/downloads/chikondi.apk" size="lg" variant="secondary" external>
              Download the APK
            </ButtonLink>
          </div>

          <p className="mt-8 text-xs text-ink-500">
            Technical detail for support:{" "}
            <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono break-all">
              {error.message || error.name}
            </code>
          </p>
        </div>
      </section>
    );
  }
}
