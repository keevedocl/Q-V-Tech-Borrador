import { PUBLIC_PROFILE_BASE_URL } from "../config.js";

export function StatusBadge(status) {
  const isActive = status === "active";
  return `<span class="qv-badge ${isActive ? "qv-badge--active" : "qv-badge--inactive"}">
    ${isActive ? "🟢 Activo" : "🔴 Inactivo"}
  </span>`;
}

export function ClientCard(client) {
  const url = `${PUBLIC_PROFILE_BASE_URL}${client.slug}`;
  const logo = client.logo_url
    ? `<img class="qv-card-logo" src="${client.logo_url}" alt="">`
    : `<div class="qv-card-logo qv-card-logo--placeholder">${client.business_name.charAt(0).toUpperCase()}</div>`;

  return `
    <article class="qv-client-card">
      ${logo}
      <div class="qv-client-card-body">
        <h3>${client.business_name}</h3>
        ${StatusBadge(client.status)}
        <p class="qv-client-card-url">${url.replace("https://", "")}</p>
      </div>
      <div class="qv-client-card-actions">
        <a class="qv-btn-ghost" href="${url}" target="_blank" rel="noopener">Ver</a>
        <a class="qv-btn-ghost" href="#/clientes/${client.slug}/editar">Editar</a>
      </div>
    </article>`;
}

export function EmptyState({ title, subtitle, actionLabel, actionHref }) {
  return `
    <div class="qv-empty-state">
      <p class="qv-empty-title">${title}</p>
      ${subtitle ? `<p class="qv-empty-subtitle">${subtitle}</p>` : ""}
      ${actionLabel ? `<a class="qv-btn-primary" href="${actionHref}">${actionLabel}</a>` : ""}
    </div>`;
}

export function LoadingState(label = "Cargando…") {
  return `<div class="qv-loading-state">${label}</div>`;
}

export function ErrorState(message, retryHref = "#/dashboard") {
  return `
    <div class="qv-empty-state">
      <p class="qv-empty-title">${message}</p>
      <a class="qv-btn-secondary" href="${retryHref}">Volver al inicio</a>
    </div>`;
}
