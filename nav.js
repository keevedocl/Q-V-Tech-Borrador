const ITEMS = [
  { key: "dashboard", label: "Inicio", href: "#/dashboard", icon: "home" },
  { key: "clientes", label: "Clientes", href: "#/clientes", icon: "grid" },
  { key: "nuevo", label: "Nuevo", href: "#/clientes/nuevo", icon: "plus" },
  { key: "ajustes", label: "Ajustes", href: "#/ajustes", icon: "settings" }
];

const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.7a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.4a7 7 0 0 0-2 1.2l-2.3-.7-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.7c.6.5 1.3.9 2 1.2L10 21h4l.6-2.4c.7-.3 1.4-.7 2-1.2l2.3.7 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"/></svg>`
};

export function renderBottomNav(activeKey) {
  const nav = document.createElement("nav");
  nav.className = "qv-bottom-nav";
  const normalized = activeKey === "dashboard" || !activeKey ? "dashboard" : activeKey;

  nav.innerHTML = ITEMS.map(item => `
    <a class="qv-nav-item ${normalized === item.key ? "qv-nav-item--active" : ""}" href="${item.href}">
      <span class="qv-nav-icon">${ICONS[item.icon]}</span>
      <span>${item.label}</span>
    </a>`).join("");

  return nav;
}
