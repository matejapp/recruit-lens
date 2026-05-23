import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Log error name only — never log message/stack which may contain user data
    console.error("[RecruitLens] UI error caught by boundary:", error.name);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: "var(--sev-high)", opacity: 0.6 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2>Something went wrong</h2>
          <p>An unexpected error occurred. No data was sent or stored.</p>
          <button
            className="btn-primary"
            style={{ maxWidth: 200, marginTop: 8 }}
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
