export function setupCollapsiblePanels() {
  const panels = document.querySelectorAll(".panel-collapsible");

  panels.forEach((panel) => {
    panel.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      if (target.closest("button")) {
        return;
      }

      if (panel.classList.contains("expanded")) {
        if (target.closest(".body-grid, .panel-content")) {
          return;
        }
      }

      panel.classList.toggle("expanded");
    });
  });
}
