// collapse/expand info boxes
function toggleBox(headerEl) {
  const box = headerEl.closest(".info-box");
  box.classList.toggle("collapsed");
}

// charsheet saved to local storage

const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getFromLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");

/*
  character sheet data structure

  TBD
*/
