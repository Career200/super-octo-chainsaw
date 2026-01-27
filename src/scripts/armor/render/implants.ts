import { createPopover } from "../../ui/popover";

export function renderImplants(): void {
  const display = document.getElementById("implants-display");
  const list = document.getElementById("implants-list");

  if (!display || !list) return;

  // Placeholder: no implants yet
  const hasImplants = false;

  display.classList.toggle("has-implants", hasImplants);

  if (hasImplants) {
    // TODO: render implant list
    list.innerHTML = "";
  } else {
    list.innerHTML = "";
  }
}

export function setupImplants(): void {
  const display = document.getElementById("implants-display");
  if (!display) return;

  display.addEventListener("click", () => {
    const { popover, cleanup, reposition } = createPopover(display, {
      backdrop: true,
      className: "popover-implants",
    });

    const title = document.createElement("p");
    title.className = "popover-message";
    title.textContent = "Implanted Armor";

    const description = document.createElement("p");
    description.className = "popover-description";
    description.style.fontSize = "12px";
    description.style.color = "var(--fg-soft)";
    description.style.marginBottom = "12px";
    description.textContent =
      "Body Plating, Subdermal Armor, and other implanted protection.";

    const placeholder = document.createElement("p");
    placeholder.style.fontSize = "11px";
    placeholder.style.color = "var(--fg-soft)";
    placeholder.style.fontStyle = "italic";
    placeholder.style.textAlign = "center";
    placeholder.style.padding = "20px 0";
    placeholder.textContent = "No implants installed";

    const actions = document.createElement("div");
    actions.className = "popover-actions";

    const closeBtn = document.createElement("button");
    closeBtn.className = "popover-btn popover-btn-cancel";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", cleanup);

    actions.appendChild(closeBtn);

    popover.appendChild(title);
    popover.appendChild(description);
    popover.appendChild(placeholder);
    popover.appendChild(actions);
    reposition();
  });

  renderImplants();
}
