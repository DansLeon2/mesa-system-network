(function () {
  const api = window.MesaAPI;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page !== 'availability') return;
    setTimeout(init, 80);
  });

  function init() {
    const form = document.getElementById('availability-form');
    form.elements.fecha.value = api.today();
    form.elements.hora_inicio.value = '19:00';
    form.elements.hora_fin.value = '21:00';
    form.elements.num_personas.value = 2;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      loadAvailability();
    });
    loadAvailability();
  }

  async function loadAvailability() {
    const grid = document.getElementById('availability-results');
    const form = document.getElementById('availability-form');
    const params = api.formData(form);
    grid.innerHTML = '<div class="empty-state">SCANNING_SECTOR...</div>';

    try {
      const rows = await api.request(`/api/reservations/availability${api.qs(params)}`);
      document.getElementById('availability-count').textContent = `${rows.length}_AVAILABLE`;
      grid.innerHTML = rows.length ? rows.map((table) => `
        <article class="holo-card">
          <p class="micro-label">[TABLE_ID]</p>
          <h2>${api.escapeHtml(String(table.numero).padStart(2, '0'))}</h2>
          <p>CAPACITY: ${api.escapeHtml(table.capacidad)}_PERSONS</p>
          <p class="muted">LOCATION: ${api.escapeHtml(table.ubicacion)}</p>
          <div style="margin:14px 0;">${api.badge('disponible')}</div>
          <a class="primary-button" href="/reservations">RESERVE_SECTOR</a>
        </article>
      `).join('') : '<div class="empty-state">NO_AVAILABLE_TABLES_FOR_THIS_WINDOW</div>';
    } catch (err) {
      grid.innerHTML = `<div class="error-state">${api.escapeHtml(err.message)}</div>`;
    }
  }
})();
