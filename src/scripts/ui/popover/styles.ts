export function injectStyles() {
  if (document.getElementById("popover-styles")) return;

  const style = document.createElement("style");
  style.id = "popover-styles";
  style.textContent = `
    .popover {
      background: var(--bg-alt, #1a1c1f);
      border: 1px solid var(--border, #2f3237);
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      min-width: 200px;
      max-width: 400px;
      z-index: 1000;
    }

    .popover-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999;
    }

    .popover-danger {
      border-color: var(--danger);
    }

    .popover-message {
      margin: 0 0 12px 0;
      color: var(--fg, #c4f2e6);
      font-size: 14px;
    }

    .popover-actions {
      display: flex;
      gap: 8px;
    }

    .popover-actions .popover-btn {
      flex: 1;
    }

    .popover-btn {
      padding: 6px 14px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: var(--font-ui);
      font-family: inherit;
      transition: background 0.15s, color 0.15s;
    }

    .popover-btn-cancel {
      background: transparent;
      border: 1px solid var(--border-light, #2a2d32);
      color: var(--fg-soft, #aaa);
    }

    .popover-btn-cancel:hover {
      border-color: var(--fg-soft, #aaa);
      color: var(--fg, #c4f2e6);
    }

    .popover-btn-confirm {
      background: var(--accent, #00ffcc);
      color: #000;
    }

    .popover-btn-confirm:hover {
      background: var(--link, #00f0ff);
    }

    .popover-danger .popover-btn-confirm {
      background: var(--danger);
      color: #fff;
    }

    .popover-danger .popover-btn-confirm:hover {
      background: var(--danger-hover);
    }

    .popover-notify {
      min-width: 150px;
    }

    .popover-notify .popover-message {
      margin: 0;
    }

    .popover-notify-error {
      border-color: var(--danger);
    }

    .popover-notify-error .popover-message {
      color: var(--danger-hover, #f88);
    }

    .popover-notify-success {
      border-color: var(--accent, #00ffcc);
    }

    .popover-notify-success .popover-message {
      color: var(--accent, #00ffcc);
    }

    .popover-notify-warning {
      border-color: #f0a500;
      border-width: 2px;
      box-shadow: 0 0 12px rgba(240, 165, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.5);
    }

    .popover-notify-warning .popover-message {
      color: #f0a500;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
}

// Auto-inject styles when module loads
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectStyles);
  } else {
    injectStyles();
  }
}
