const saveToLocalStorage = (key: string, value: Record<string, any>) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getFromLocalStorage = (key: string) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};
