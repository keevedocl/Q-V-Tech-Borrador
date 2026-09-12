import { getClients } from "../services/clients-service.js";
import { ClientCard, EmptyState, LoadingState } from "../ui/components.js";

export async function renderClientsList(content) {
  content.innerHTML = LoadingState();
  const clients = await getClients();

  content.innerHTML = `
    <div class="qv-page-header">
      <h1>Clientes</h1>
    </div>

    <div class="qv-search-bar">
      <input type="search" id="qv-search" placeholder="Buscar por nombre o slug…" autocomplete="off">
    </div>

    <div class="qv-client-list" id="qv-client-list"></div>`;

  const listEl = document.getElementById("qv-client-list");
  const searchEl = document.getElementById("qv-search");

  function paint(items) {
    if (items.length === 0) {
      listEl.innerHTML = EmptyState({
        title: "Todavía no tienes clientes.",
        subtitle: "Crea el primero para generar su perfil digital.",
        actionLabel: "+ Crear primer cliente",
        actionHref: "#/clientes/nuevo"
      });
      return;
    }
    listEl.innerHTML = items.map(ClientCard).join("");
  }

  paint(clients);

  searchEl.addEventListener("input", () => {
    const q = searchEl.value.trim().toLowerCase();
    const filtered = clients.filter(c =>
      c.business_name.toLowerCase().includes(q) || c.slug.includes(q)
    );
    paint(filtered);
  });
}
