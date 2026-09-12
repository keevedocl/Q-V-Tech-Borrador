import { logout, getSession } from "../services/auth-service.js";
import { confirmModal } from "../ui/modal.js";
import { showToast } from "../ui/toast.js";

export async function renderSettings(content) {
  const session = getSession();

  content.innerHTML = `
    <div class="qv-page-header">
      <h1>Ajustes</h1>
    </div>

    <div class="qv-settings-card">
      <p class="qv-settings-label">Sesión iniciada como</p>
      <p class="qv-settings-value">${session?.email || "—"}</p>
    </div>

    <button class="qv-btn-danger qv-btn-block" id="qv-logout">Cerrar sesión</button>

    <p class="qv-settings-footnote">Q&amp;V Tech — Panel administrativo</p>`;

  document.getElementById("qv-logout").addEventListener("click", async () => {
    const ok = await confirmModal({
      title: "¿Cerrar sesión?",
      message: "Tendrás que volver a iniciar sesión para administrar los perfiles.",
      confirmLabel: "Cerrar sesión",
      danger: true
    });
    if (!ok) return;

    await logout();
    showToast("Sesión cerrada");
    window.location.hash = "#/login";
  });
}
