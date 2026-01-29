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
