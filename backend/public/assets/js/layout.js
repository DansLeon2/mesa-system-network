(function () {
  const api = window.MesaAPI;
  const auth = window.MesaAuth;

  const navItems = [
    ['dashboard', '/dashboard', 'grid_view', 'GRID_OVERVIEW'],
    ['reservations', '/reservations', 'event_seat', 'RESERVATIONS'],
    ['availability', '/availability', 'radar', 'AVAILABILITY'],
    ['tables', '/tables', 'table_bar', 'TABLE_GRID'],
    ['clients', '/clients', 'group', 'CLIENTS'],
    ['reports', '/reports', 'query_stats', 'ANALYTICS']
  ];

  async function initLayout() {
    if (document.body.classList.contains('login-body')) return;

    const session = await auth.requireAuth();
    if (!session) return;

    const page = document.body.dataset.page || 'dashboard';
    renderSidebar(page, session.user);
    renderTopbar(page, session.user);
    bindCommonActions();
  }

  function renderSidebar(page, user) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <a class="brand" href="/dashboard">
        <span class="brand-mark material-symbols-outlined">hub</span>
        <span>MESA//SYSTEM</span>
      </a>
      <div class="operator-card">
        <strong>${api.escapeHtml(user.nombre || user.username)}</strong>
        <small>${api.escapeHtml(user.rol)} // SECTOR_7_HUB</small>
      </div>
      <nav class="nav-list">
        ${navItems.map(([key, href, icon, label]) => `
          <a class="nav-item ${key === page ? 'active' : ''}" href="${href}">
            <span class="material-symbols-outlined">${icon}</span>
            <span>${label}</span>
          </a>
        `).join('')}
      </nav>
      <div style="margin-top:auto; display:grid; gap:8px;">
        <button class="ghost-button" data-logout>
          <span class="material-symbols-outlined">lock_open</span>
          LOCK_SESSION
        </button>
      </div>
    `;
  }

  function renderTopbar(page, user) {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    const active = navItems.find(([key]) => key === page);
    topbar.innerHTML = `
      <div class="topbar-title">
        <span class="status-pill"><span class="pulse-dot"></span> NODE_74_ONLINE</span>
        <span class="status-pill">${active ? active[3] : 'GRID'} // ${api.escapeHtml(user.username)}</span>
      </div>
      <div class="topbar-title">
        <span class="status-pill" data-clock>00:00:00</span>
        <button class="icon-button" data-logout title="Cerrar sesion">
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    `;
  }

  function bindCommonActions() {
    document.querySelectorAll('[data-logout]').forEach((button) => {
      button.addEventListener('click', auth.logout);
    });

    const clock = document.querySelector('[data-clock]');
    if (clock) {
      const update = () => {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('es-EC', { hour12: false });
      };
      update();
      setInterval(update, 1000);
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.querySelectorAll('.drawer.open').forEach((drawer) => drawer.classList.remove('open'));
        document.querySelectorAll('.drawer-backdrop.open').forEach((backdrop) => backdrop.classList.remove('open'));
      }
    });
  }

  window.MesaLayout = { initLayout };
  document.addEventListener('DOMContentLoaded', initLayout);
})();
