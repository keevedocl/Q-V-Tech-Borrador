import { getClients } from "../services/clients-service.js";
import { ClientCard, LoadingState } from "../ui/components.js";
import { getSession } from "../services/auth-service.js";

export async function renderDashboard(content) {
  content.innerHTML = LoadingState();

  const clients = await getClients();
  const active = clients.filter(c => c.status === "active").length;
  const inactive = clients.length - active;
  const session = getSession();
  const firstName = session?.email ? session.email.split("@")[0] : "";

  content.innerHTML = `
    <div class="qv-page-header">
      <p class="qv-eyebrow">Q&amp;V Tech</p>
      <h1>Hola${firstName ? ", " + firstName : ""} 👋</h1>
    </div>

    <div class="qv-stats-grid">
      <div class="qv-stat"><span class="qv-stat-value">${clients.length}</span><span class="qv-stat-label">Clientes</span></div>
      <div class="qv-stat"><span class="qv-stat-value">${active}</span><span class="qv-stat-label">Activos</span></div>
      <div class="qv-stat"><span class="qv-stat-value">${inactive}</span><span class="qv-stat-label">Inactivos</span></div>
      <div class="qv-stat"><span class="qv-stat-value">—</span><span class="qv-stat-label">Visitas</span></div>
    </div>

    <a class="qv-btn-primary qv-btn-block" href="#/clientes/nuevo">+ Nuevo cliente</a>

    <section class="qv-section-block">
      <h2 class="qv-section-title">Clientes recientes</h2>
      <div class="qv-client-list">
        ${clients.slice(0, 3).map(ClientCard).join("") || `<p class="qv-empty-inline">Todavía no tienes clientes.</p>`}
      </div>
    </section>`;
}
