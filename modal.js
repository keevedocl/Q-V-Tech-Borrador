/**
 * confirmModal({ title, message, confirmLabel, danger }) -> Promise<boolean>
 * Se usa para acciones importantes: desactivar cliente, cerrar sesión.
 * No se usa para cada acción — solo las que el documento marca como sensibles.
 */
export function confirmModal({ title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", danger = false }) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "qv-modal-overlay";
    overlay.innerHTML = `
      <div class="qv-modal" role="dialog" aria-modal="true">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="qv-modal-actions">
          <button class="qv-btn-secondary" data-action="cancel">${cancelLabel}</button>
          <button class="${danger ? "qv-btn-danger" : "qv-btn-primary"}" data-action="confirm">${confirmLabel}</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (action === "confirm") { cleanup(true); }
      if (action === "cancel" || e.target === overlay) { cleanup(false); }
    });

    function cleanup(result) {
      overlay.remove();
      resolve(result);
    }
  });
}
