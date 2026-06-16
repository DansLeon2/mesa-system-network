(function () {
  const api = window.MesaAPI;
  let tables = [];
  let activeTable = null;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page !== 'tables') return;
    setTimeout(init, 80);
  });

  function init() {
    document.getElementById('new-table').addEventListener('click', () => openDrawer());
    document.getElementById('table-form').addEventListener('submit', saveTable);
    document.querySelectorAll('[data-close-drawer]').forEach((node) => node.addEventListener('click', closeDrawer));
    loadTables();
  }

  async function loadTables() {
    try {
      tables = await api.request('/api/tables');
      renderTables();
    } catch (err) {
      document.getElementById('table-grid').innerHTML = `<div class="error-state">${api.escapeHtml(err.message)}</div>`;
    }
  }

  function renderTables() {
    const grid = document.getElementById('table-grid');
    document.getElementById('table-count').textContent = `${tables.length}_NODES`;
    grid.innerHTML = tables.map((table) => {
      const state = table.estado_visual || table.estado;
      return `
        <article class="holo-card ${state !== 'disponible' ? 'locked' : ''}">
          <p class="micro-label">[NODE_ID]</p>
          <h2>M-${api.escapeHtml(String(table.numero).padStart(2, '0'))}</h2>
          <p>CAPACITY: ${api.escapeHtml(table.capacidad)}_UNITS</p>
          <p class="muted">ZONE: ${api.escapeHtml(table.ubicacion)}</p>
          <div style="margin:14px 0;">${api.badge(state)}</div>
          <div class="row-actions">
            <button class="ghost-button" data-schedule="${table.id}">SCHEDULE</button>
            <button class="primary-button" data-edit="${table.id}">EDIT</button>
          </div>
        </article>
      `;
    }).join('');

    grid.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => {
      const table = tables.find((item) => Number(item.id) === Number(button.dataset.edit));
      openDrawer(table);
    }));
    grid.querySelectorAll('[data-schedule]').forEach((button) => button.addEventListener('click', () => loadSchedule(button.dataset.schedule)));
  }

  async function loadSchedule(id) {
    const panel = document.getElementById('table-schedule');
    panel.innerHTML = '<div class="empty-state">LOADING_SCHEDULE...</div>';
    try {
      const data = await api.request(`/api/tables/${id}/schedule?fecha=${api.today()}`);
      panel.innerHTML = `
        <div class="panel-head"><h3>MESA ${api.escapeHtml(data.mesa.numero)} // ${api.formatDate(data.fecha)}</h3></div>
        <div class="card-grid">
          ${data.slots.map((slot) => `
            <div class="holo-card ${slot.estado !== 'disponible' ? 'locked' : ''}">
              <strong>${api.formatTime(slot.hora_inicio)}-${api.formatTime(slot.hora_fin)}</strong>
              <div style="margin-top:8px;">${api.badge(slot.estado)}</div>
              <p class="muted">${slot.reserva ? api.escapeHtml(`${slot.reserva.nombres} ${slot.reserva.apellidos}`) : 'FREE_SIGNAL'}</p>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      panel.innerHTML = `<div class="error-state">${api.escapeHtml(err.message)}</div>`;
    }
  }

  async function saveTable(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = api.formData(form);
    const id = data.id;
    delete data.id;
    data.numero = Number(data.numero);
    data.capacidad = Number(data.capacidad);
    data.activo = form.elements.activo.checked;

    try {
      await api.request(id ? `/api/tables/${id}` : '/api/tables', {
        method: id ? 'PUT' : 'POST',
        body: data
      });
      api.toast(id ? 'Mesa actualizada.' : 'Mesa creada.');
      closeDrawer();
      await loadTables();
    } catch (err) {
      api.toast(err.message, 'error');
    }
  }

  function openDrawer(table = null) {
    activeTable = table;
    const form = document.getElementById('table-form');
    form.reset();
    form.elements.id.value = table ? table.id : '';
    form.elements.numero.value = table ? table.numero : '';
    form.elements.capacidad.value = table ? table.capacidad : 4;
    form.elements.ubicacion.value = table ? table.ubicacion : 'interior';
    form.elements.estado.value = table ? table.estado : 'disponible';
    form.elements.activo.checked = table ? Boolean(table.activo) : true;
    document.getElementById('table-drawer-title').textContent = table ? `MESA_${table.numero}` : 'NUEVA_MESA';
    document.getElementById('drawer-backdrop').classList.add('open');
    document.getElementById('table-drawer').classList.add('open');
  }

  function closeDrawer() {
    activeTable = null;
    document.getElementById('drawer-backdrop').classList.remove('open');
    document.getElementById('table-drawer').classList.remove('open');
  }
})();
