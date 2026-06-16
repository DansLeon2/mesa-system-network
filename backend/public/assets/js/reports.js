(function () {
  const api = window.MesaAPI;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page !== 'reports') return;
    setTimeout(loadReports, 80);
  });

  async function loadReports() {
    try {
      const [byDay, topTables, frequent, peak, cancelled] = await Promise.all([
        api.request('/api/reports/by-day'),
        api.request('/api/reports/top-tables'),
        api.request('/api/reports/frequent-clients'),
        api.request('/api/reports/peak-hours'),
        api.request('/api/reports/cancelled')
      ]);
      renderBars('report-status-bars', byDay, 'estado', 'total');
      renderProgress('report-top-tables', topTables, (row) => `TABLE_${row.numero} (${row.ubicacion})`, 'total_reservas');
      renderFrequent(frequent);
      renderBars('report-peak-bars', peak.slice(0, 8), 'hora_inicio', 'total');
      renderCancelled(cancelled.slice(0, 8));
    } catch (err) {
      document.getElementById('reports-error').innerHTML = `<div class="error-state">${api.escapeHtml(err.message)} // ADMIN_ONLY</div>`;
    }
  }

  function renderBars(id, rows, xKey, yKey) {
    const node = document.getElementById(id);
    if (!node) return;
    if (!rows.length) {
      node.innerHTML = '<div class="empty-state">NO_DATA</div>';
      return;
    }
    const max = Math.max(...rows.map((row) => Number(row[yKey]) || 0), 1);
    node.innerHTML = `
      <div class="chart-bars">
        ${rows.map((row) => {
          const value = Number(row[yKey]) || 0;
          const height = Math.max(8, Math.round((value / max) * 100));
          return `<div class="bar" style="height:${height}%"><span>${value}</span></div>`;
        }).join('')}
      </div>
      <div class="bar-labels">
        ${rows.map((row) => `<span>${api.escapeHtml(labelValue(row[xKey]))}</span>`).join('')}
      </div>
    `;
  }

  function labelValue(value) {
    const text = String(value || '-');
    return text.includes(':') ? api.formatTime(text) : text;
  }

  function renderProgress(id, rows, labeler, valueKey) {
    const node = document.getElementById(id);
    const max = Math.max(...rows.map((row) => Number(row[valueKey]) || 0), 1);
    node.innerHTML = rows.length ? rows.map((row) => {
      const value = Number(row[valueKey]) || 0;
      return `
        <div class="progress-row">
          <div class="progress-meta"><span>${api.escapeHtml(labeler(row))}</span><span>${value}</span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${Math.round((value / max) * 100)}%"></div></div>
        </div>
      `;
    }).join('') : '<div class="empty-state">NO_DATA</div>';
  }

  function renderFrequent(rows) {
    const node = document.getElementById('report-frequent-clients');
    node.innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${api.escapeHtml(`${row.nombres} ${row.apellidos}`)}</td>
        <td>${api.escapeHtml(row.email || '-')}</td>
        <td>${api.escapeHtml(row.total_reservas)}</td>
      </tr>
    `).join('') : '<tr><td colspan="3"><div class="empty-state">NO_DATA</div></td></tr>';
  }

  function renderCancelled(rows) {
    const node = document.getElementById('report-cancelled');
    node.innerHTML = rows.length ? rows.map((row) => `
      <tr>
        <td>${api.escapeHtml(`${row.nombres} ${row.apellidos}`)}</td>
        <td>Mesa ${api.escapeHtml(row.mesa)}</td>
        <td>${api.formatDate(row.fecha)}</td>
        <td>${api.formatTime(row.hora_inicio)}</td>
      </tr>
    `).join('') : '<tr><td colspan="4"><div class="empty-state">NO_DATA</div></td></tr>';
  }
})();
