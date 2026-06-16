(function () {
  const api = window.MesaAPI;
  let clients = [];
  let tables = [];
  let reservations = [];

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page !== 'reservations') return;
    setTimeout(init, 80);
  });

  async function init() {
    document.getElementById('filter-date').value = api.today();
    document.getElementById('reservation-date').value = api.today();
    document.getElementById('reservation-start').value = '19:00';
    document.getElementById('reservation-end').value = '21:00';
    bindEvents();
    await loadRefs();
    await loadReservations();
  }

  function bindEvents() {
    document.getElementById('reservation-form').addEventListener('submit', saveReservation);
    document.getElementById('reservation-reset').addEventListener('click', resetForm);
    document.getElementById('reservation-filters').addEventListener('submit', (event) => {
      event.preventDefault();
      loadReservations();
    });
  }

  async function loadRefs() {
    [clients, tables] = await Promise.all([
      api.request('/api/clients'),
      api.request('/api/tables')
    ]);
    fillSelect('reservation-client', clients, (client) => `${client.nombres} ${client.apellidos} // ${client.telefono || client.email || 'sin contacto'}`);
    fillSelect('reservation-table', tables, (table) => `Mesa ${table.numero} // ${table.capacidad} personas // ${table.ubicacion}`);
  }

  async function loadReservations() {
    const params = api.formData(document.getElementById('reservation-filters'));
    reservations = await api.request(`/api/reservations${api.qs(params)}`);
    renderReservations();
  }

  async function saveReservation(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = api.formData(form);
    const id = data.id;
    delete data.id;
    data.id_cliente = Number(data.id_cliente);
    data.id_mesa = Number(data.id_mesa);
    data.num_personas = Number(data.num_personas);

    try {
      await api.request(id ? `/api/reservations/${id}` : '/api/reservations', {
        method: id ? 'PUT' : 'POST',
        body: data
      });
      api.toast(id ? 'Reserva actualizada.' : 'Reserva creada.');
      resetForm();
      await loadReservations();
    } catch (err) {
      api.toast(err.message, 'error');
    }
  }

  async function cancelReservation(id) {
    if (!confirm('Cancelar esta reserva?')) return;
    try {
      await api.request(`/api/reservations/${id}/cancel`, { method: 'PATCH' });
      api.toast('Reserva cancelada.');
      await loadReservations();
    } catch (err) {
      api.toast(err.message, 'error');
    }
  }

  function editReservation(id) {
    const row = reservations.find((item) => Number(item.id) === Number(id));
    if (!row) return;
    const form = document.getElementById('reservation-form');
    form.elements.id.value = row.id;
    form.elements.id_cliente.value = row.id_cliente;
    form.elements.id_mesa.value = row.id_mesa;
    form.elements.fecha.value = api.formatDate(row.fecha);
    form.elements.hora_inicio.value = api.formatTime(row.hora_inicio);
    form.elements.hora_fin.value = api.formatTime(row.hora_fin);
    form.elements.num_personas.value = row.num_personas;
    form.elements.estado.value = row.estado;
    form.elements.observaciones.value = row.observaciones || '';
    document.getElementById('reservation-submit-text').textContent = 'SYNC_CHANGES';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function resetForm() {
    const form = document.getElementById('reservation-form');
    form.reset();
    form.elements.id.value = '';
    form.elements.fecha.value = api.today();
    form.elements.hora_inicio.value = '19:00';
    form.elements.hora_fin.value = '21:00';
    form.elements.estado.value = 'pendiente';
    document.getElementById('reservation-submit-text').textContent = 'INIT_NEW_ENTRY';
  }

  function renderReservations() {
    const body = document.getElementById('reservation-rows');
    const count = document.getElementById('reservation-count');
    count.textContent = `${reservations.length}_ENTRIES`;

    if (!reservations.length) {
      body.innerHTML = '<tr><td colspan="7"><div class="empty-state">NO_RESERVATIONS_FOUND</div></td></tr>';
      return;
    }

    body.innerHTML = reservations.map((row) => `
      <tr>
        <td>#RSV_${row.id}</td>
        <td>${api.escapeHtml(`${row.nombres} ${row.apellidos}`)}<br><span class="muted">${api.escapeHtml(row.telefono || row.email || '')}</span></td>
        <td>${api.formatDate(row.fecha)}<br><span class="muted">${api.formatTime(row.hora_inicio)}-${api.formatTime(row.hora_fin)}</span></td>
        <td>Mesa ${api.escapeHtml(row.numero_mesa)}<br><span class="muted">${api.escapeHtml(row.ubicacion)}</span></td>
        <td>${api.escapeHtml(row.num_personas)}</td>
        <td>${api.badge(row.estado)}</td>
        <td>
          <div class="row-actions">
            <button class="icon-button" data-edit="${row.id}" title="Editar"><span class="material-symbols-outlined">edit_square</span></button>
            <button class="icon-button danger" data-cancel="${row.id}" title="Cancelar"><span class="material-symbols-outlined">cancel</span></button>
          </div>
        </td>
      </tr>
    `).join('');

    body.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => editReservation(button.dataset.edit)));
    body.querySelectorAll('[data-cancel]').forEach((button) => button.addEventListener('click', () => cancelReservation(button.dataset.cancel)));
  }

  function fillSelect(id, rows, labeler) {
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">SELECT_NODE</option>' + rows.map((row) => (
      `<option value="${row.id}">${api.escapeHtml(labeler(row))}</option>`
    )).join('');
  }
})();
