export interface SelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface SingleSelectOptions<T extends string> {
  options: SelectOption<T>[];
  defaultValue: T;
  showDescription?: boolean;
  className?: string;
}

export interface SingleSelectResult<T extends string> {
  element: HTMLElement;
  getSelected: () => T;
}

export interface MultiSelectOptions<T extends string> {
  options: SelectOption<T>[];
  defaultValue?: T[];
  showAllButton?: boolean;
  allButtonLabel?: string;
  showNoneButton?: boolean;
  noneButtonLabel?: string;
  /** Value to select when clicking None to deselect it (default: first option) */
  noneDeselectValue?: T;
  className?: string;
  /** CSS Grid template areas for custom layout. Values become grid-area names. */
  gridTemplateAreas?: string;
  /** Position for All button in grid (e.g., "all") */
  allGridArea?: string;
  /** Position for None button in grid (e.g., "none") */
  noneGridArea?: string;
}

export interface MultiSelectResult<T extends string> {
  element: HTMLElement;
  getSelected: () => T[];
  isNoneSelected: () => boolean;
}
