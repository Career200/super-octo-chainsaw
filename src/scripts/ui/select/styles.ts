export function injectStyles() {
  if (document.getElementById("select-styles")) return;

  const style = document.createElement("style");
  style.id = "select-styles";
  style.textContent = `
    .select-wrapper {
      margin-bottom: 12px;
    }

    .select-options {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .select-option {
      padding: 4px 8px;
      font-size: var(--font-ui, 13px);
      font-weight: bold;
      background: var(--bg);
      border: 1px solid var(--border-light);
      border-radius: 3px;
      color: var(--fg-soft);
      cursor: pointer;
      transition:
        border-color 0.15s,
        color 0.15s,
        background 0.15s;
      font-family: inherit;
    }

    .select-option.selected {
      background: var(--accent);
      border-color: var(--accent);
      color: #000;
    }

    @media (hover: hover) {
      .select-option:hover:not(.selected) {
        border-color: var(--accent);
        color: var(--accent);
      }
    }

    .select-description {
      margin: 8px 0 0 0;
      font-size: var(--font-ui-sm, 11px);
      line-height: 1.4;
      color: var(--fg-soft);
      text-align: justify;
      min-height: 3.5em;
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
