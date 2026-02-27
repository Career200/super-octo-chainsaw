import type { ComponentChildren } from "preact";
import { Component } from "preact";

interface Props {
  children: ComponentChildren;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  handleReload = () => {
    location.reload();
  };

  handleClear = () => {
    localStorage.clear();
    location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div class="error-boundary">
          <h2>Something went wrong</h2>
          <p>Character data may be corrupted.</p>
          <p>
            Try
            <button onClick={this.handleReload}>reloading the page</button>
            or
            <button onClick={this.handleClear}>
              Clear localStorage and reload
            </button>
          </p>
          <details>
            <summary>Details</summary>
            <pre>{this.state.error.message}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
