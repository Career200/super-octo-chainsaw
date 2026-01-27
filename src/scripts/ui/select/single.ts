import type { SingleSelectOptions, SingleSelectResult } from "./types";

export function createSingleSelect<T extends string>(
  config: SingleSelectOptions<T>,
): SingleSelectResult<T> {
  const { options, defaultValue, showDescription = true, className = "" } = config;

  let selected: T = defaultValue;

  const wrapper = document.createElement("div");
  wrapper.className = `select-wrapper ${className}`.trim();

  const container = document.createElement("div");
  container.className = "select-options";

  const description = document.createElement("p");
  description.className = "select-description";

  const defaultOption = options.find((o) => o.value === defaultValue);
  if (showDescription && defaultOption?.description) {
    description.textContent = defaultOption.description;
  }

  for (const option of options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "select-option";
    btn.dataset.value = option.value;
    btn.textContent = option.label;

    if (option.value === defaultValue) {
      btn.classList.add("selected");
    }

    btn.addEventListener("click", () => {
      container
        .querySelectorAll(".select-option")
        .forEach((t) => t.classList.remove("selected"));
      btn.classList.add("selected");
      selected = option.value;
      if (showDescription && option.description) {
        description.textContent = option.description;
      }
    });

    container.appendChild(btn);
  }

  wrapper.appendChild(container);
  if (showDescription) {
    wrapper.appendChild(description);
  }

  return {
    element: wrapper,
    getSelected: () => selected,
  };
}
