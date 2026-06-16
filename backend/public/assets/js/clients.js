(function () {
  const api = window.MesaAPI;
  let clients = [];

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page !== 'clients') return;
    setTimeout(init, 80);
  });

  function init() {
    document.getElementById('client-search-form').addEventListener('submit', (event) => {
      event.preventDefault();
      loadClients();
    });
    document.getElementById('new-client').addEventListener('click', () => openDrawer());
    document.getElementById('client-form').addEventListener('submit', saveClient);
    document.querySelectorAll('[data-close-drawer]').forEach((node) => node.addEventListener('click', closeDrawer));
    loadClients();
  }

  async function loadClients() {
    const search = document.getElementById('client-search').value;
    clients = await api.request(`/api/clients${api.qs({ search })}`);
    renderClients();
  }

  function renderClients() {
    const body = document.getElementById('client-rows');
    document.getElementById('client-count').textContent = `${clients.length}_IDENTITIES_FOUND`;
    if (!clients.length) {
      body.innerHTML = '<tr><td colspan="7"><div class="empty-state">NO_CLIENTS_FOUND</div></td></tr>';
      return;
    }

    body.innerHTML = clients.map((client) => `
      <tr>
        <td>#CL_${client.id}</td>
        <td>${api.escapeHtml(client.nombres)}</td>
        <td>${api.escapeHtml(client.apellidos)}</td>
        <td>${api.escapeHtml(client.telefono || '-')}</td>
        <td>${api.escapeHtml(client.email || '-')}</td>
        <td>${api.escapeHtml(client.num_id || '-')}</td>
        <td>
          <div class="row-actions">
            <button class="icon-button" data-edit="${client.id}"><span class="material-symbols-outlined">edit_note</span></button>
          </div>
        </td>
      </tr>
    `).join('');

    body.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => {
      const client = clients.find((item) => Number(item.id) === Number(button.dataset.edit));
      openDrawer(client);
    }));
  }

  async function saveClient(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = api.formData(form);
    const id = data.id;
    delete data.id;

    try {
      await api.request(id ? `/api/clients/${id}` : '/api/clients', {
        method: id ? 'PUT' : 'POST',
        body: data
      });
      api.toast(id ? 'Cliente actualizado.' : 'Cliente creado.');
      closeDrawer();
      await loadClients();
    } catch (err) {
      api.toast(err.message, 'error');
    }
  }

  function openDrawer(client = null) {
    const form = document.getElementById('client-form');
    form.reset();
    form.elements.id.value = client ? client.id : '';
    form.elements.nombres.value = client ? client.nombres : '';
    form.elements.apellidos.value = client ? client.apellidos : '';
    form.elements.telefono.value = client ? client.telefono || '' : '';
    form.elements.email.value = client ? client.email || '' : '';
    form.elements.num_id.value = client ? client.num_id || '' : '';
    document.getElementById('client-drawer-title').textContent = client ? 'EDIT_CLIENT' : 'NUEVO_CLIENTE';
    document.getElementById('drawer-backdrop').classList.add('open');
    document.getElementById('client-drawer').classList.add('open');
  }

  function closeDrawer() {
    document.getElementById('drawer-backdrop').classList.remove('open');
    document.getElementById('client-drawer').classList.remove('open');
  }
})();
