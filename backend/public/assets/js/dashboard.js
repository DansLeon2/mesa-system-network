(function () {
  const api = window.MesaAPI;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page !== 'dashboard') return;
    setTimeout(loadDashboard, 80);
  });

  async function loadDashboard() {
    try {
      const [dashboard, reservations, tables] = await Promise.all([
        api.request('/api/reports/dashboard'),
        api.request('/api/reservations'),
        api.request('/api/tables')
      ]);

      const available = tables.filter((table) => (table.estado_visual || table.estado) === 'disponible').length;
      const occupied = tables.length ? Math.round(((tables.length - available) / tables.length) * 100) : 0;

      setText('metric-today', dashboard.reservas_hoy || 0);
      setText('metric-confirmed', dashboard.confirmadas || 0);
      setText('metric-clients', dashboard.clientes || 0);
      setText('metric-occupancy', `${occupied}%`);
      renderReservations(reservations.slice(0, 8));
      renderTableMap(tables);
    } catch (err) {
      api.toast(err.message, 'error');
      renderEmpty('dashboard-reservations', 'NO_DATA // verifica conexion con la base');
    }
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function renderReservations(rows) {
    const body = document.getElementById('dashboard-reservations');
    if (!body) return;

    if (!rows.length) {
      renderEmpty('dashboard-reservations', 'NO_RECENT_RESERVATIONS');
      return;
    }

    body.innerHTML = rows.map((row) => `
      <tr>
        <td>#RES_${row.id}</td>
        <td>${api.escapeHtml(`${row.nombres} ${row.apellidos}`)}</td>
        <td>Mesa ${api.escapeHtml(row.numero_mesa)}</td>
        <td>${api.formatDate(row.fecha)} ${api.formatTime(row.hora_inicio)}</td>
        <td>${api.escapeHtml(row.num_personas)}</td>
        <td>${api.badge(row.estado)}</td>
      </tr>
    `).join('');
  }

  function renderTableMap(tables) {
    const grid = document.getElementById('dashboard-tables');
    if (!grid) return;

    grid.innerHTML = tables.map((table) => {
      const state = table.estado_visual || table.estado;
      return `
        <article class="holo-card ${state !== 'disponible' ? 'locked' : ''}">
          <p class="micro-label">[TABLE_NODE]</p>
          <h2>${api.escapeHtml(String(table.numero).padStart(2, '0'))}</h2>
          <p class="muted">CAPACITY: ${api.escapeHtml(table.capacidad)} // ${api.escapeHtml(table.ubicacion)}</p>
          <div style="margin-top:14px;">${api.badge(state)}</div>
        </article>
      `;
    }).join('');
  }

  function renderEmpty(id, text) {
    const node = document.getElementById(id);
    if (node) node.innerHTML = `<tr><td colspan="6"><div class="empty-state">${text}</div></td></tr>`;
  }
})();
