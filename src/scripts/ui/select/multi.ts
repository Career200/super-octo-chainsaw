import type { MultiSelectOptions, MultiSelectResult } from "./types";

export function createMultiSelect<T extends string>(
  config: MultiSelectOptions<T>,
): MultiSelectResult<T> {
  const {
    options,
    defaultValue = [],
    showAllButton = true,
    allButtonLabel = "All",
    showNoneButton = true,
    noneButtonLabel = "None",
    noneDeselectValue,
    className = "",
    gridTemplateAreas,
    allGridArea,
    noneGridArea,
  } = config;

  const selected = new Set<T>(defaultValue);

  const wrapper = document.createElement("div");
  wrapper.className = `select-wrapper select-multi ${className}`.trim();

  const container = document.createElement("div");
  container.className = "select-options";

  if (gridTemplateAreas) {
    container.style.display = "grid";
    container.style.gridTemplateAreas = gridTemplateAreas;
    container.style.gap = "4px";
  }

  let allBtn: HTMLButtonElement | null = null;
  let noneBtn: HTMLButtonElement | null = null;

  const allValues = options.map((o) => o.value);
  const defaultDeselect = noneDeselectValue ?? options[0]?.value;

  const updateUI = () => {
    const isNone = selected.size === 0;
    const isAll = allValues.every((v) => selected.has(v));

    for (const option of options) {
      const btn = container.querySelector(`[data-value="${option.value}"]`);
      btn?.classList.toggle("selected", selected.has(option.value));
    }

    allBtn?.classList.toggle("selected", isAll);
    noneBtn?.classList.toggle("selected", isNone);
  };

  for (const option of options) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "select-option";
    btn.dataset.value = option.value;
    btn.textContent = option.label;

    if (gridTemplateAreas) {
      btn.style.gridArea = option.value;
    }

    btn.addEventListener("click", () => {
      if (selected.has(option.value)) {
        selected.delete(option.value);
      } else {
        selected.add(option.value);
      }
      updateUI();
    });

    container.appendChild(btn);
  }

  if (showAllButton) {
    allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "select-option select-option-all";
    allBtn.textContent = allButtonLabel;

    if (gridTemplateAreas && allGridArea) {
      allBtn.style.gridArea = allGridArea;
    }

    allBtn.addEventListener("click", () => {
      const isAll = allValues.every((v) => selected.has(v));
      if (isAll) {
        selected.clear();
      } else {
        allValues.forEach((v) => selected.add(v));
      }
      updateUI();
    });

    container.appendChild(allBtn);
  }

  if (showNoneButton) {
    noneBtn = document.createElement("button");
    noneBtn.type = "button";
    noneBtn.className = "select-option select-option-none";
    noneBtn.textContent = noneButtonLabel;

    if (gridTemplateAreas && noneGridArea) {
      noneBtn.style.gridArea = noneGridArea;
    }

    noneBtn.addEventListener("click", () => {
      if (selected.size === 0 && defaultDeselect) {
        selected.add(defaultDeselect);
      } else {
        selected.clear();
      }
      updateUI();
    });

    container.appendChild(noneBtn);
  }

  wrapper.appendChild(container);
  updateUI();

  return {
    element: wrapper,
    getSelected: () => Array.from(selected),
    isNoneSelected: () => selected.size === 0,
  };
}
