let container;

function ensureContainer() {
  if (container) return container;
  container = document.createElement("div");
  container.className = "qv-toast-container";
  document.body.appendChild(container);
  return container;
}

/** showToast("✓ Cliente creado correctamente") */
export function showToast(message, variant = "success") {
  const el = ensureContainer();
  const toast = document.createElement("div");
  toast.className = `qv-toast qv-toast--${variant}`;
  toast.textContent = message;
  el.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("qv-toast--visible"));

  setTimeout(() => {
    toast.classList.remove("qv-toast--visible");
    setTimeout(() => toast.remove(), 250);
  }, 2600);
}
