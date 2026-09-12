import { isAuthenticated } from "./services/auth-service.js";
import { renderLogin } from "./pages/login.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderClientsList } from "./pages/clients-list.js";
import { renderClientForm } from "./pages/client-form.js";
import { renderSettings } from "./pages/settings.js";
import { renderBottomNav } from "./pages/nav.js";

const app = document.getElementById("qv-app");

const PUBLIC_ROUTES = ["/login"];

function parseHash() {
  const hash = window.location.hash.replace(/^#/, "") || "/dashboard";
  return hash.split("/").filter(Boolean); // ej: ["clientes", "ferreteria-xyz", "editar"]
}

async function render() {
  const segments = parseHash();
  const path = "/" + segments.join("/");
  const authed = isAuthenticated();

  if (!authed && !PUBLIC_ROUTES.includes("/" + segments[0])) {
    window.location.hash = "#/login";
    return;
  }
  if (authed && segments[0] === "login") {
    window.location.hash = "#/dashboard";
    return;
  }

  app.innerHTML = "";

  if (segments[0] === "login" || segments.length === 0 && !authed) {
    await renderLogin(app);
    return;
  }

  // Layout con navegación inferior para todas las páginas autenticadas
  const shell = document.createElement("div");
  shell.className = "qv-shell";
  const content = document.createElement("main");
  content.className = "qv-content";
  shell.appendChild(content);
  shell.appendChild(renderBottomNav(segments[0]));
  app.appendChild(shell);

  if (segments[0] === "dashboard" || segments.length === 0) {
    await renderDashboard(content);
  } else if (segments[0] === "clientes" && segments.length === 1) {
    await renderClientsList(content);
  } else if (segments[0] === "clientes" && segments[1] === "nuevo") {
    await renderClientForm(content, { mode: "create" });
  } else if (segments[0] === "clientes" && segments[2] === "editar") {
    await renderClientForm(content, { mode: "edit", slug: segments[1] });
  } else if (segments[0] === "ajustes") {
    await renderSettings(content);
  } else {
    content.innerHTML = `<div class="qv-empty-state"><p class="qv-empty-title">Página no encontrada</p></div>`;
  }
}

export function startRouter() {
  window.addEventListener("hashchange", render);
  render();
}
