import { confirm } from "../ui/popover";

export function setupHitButton() {
  const btn = document.getElementById("btn-im-hit");
  if (!btn) return;

  btn.addEventListener("click", async (e) => {
    e.stopPropagation(); // Don't trigger panel collapse
    const confirmed = await confirm(btn, {
      message: "Sorry to hear it",
      confirmText: "Apply Damage",
      cancelText: "Dismiss",
      type: "danger",
    });
    if (confirmed) {
      // placeholder
    }
  });
}
