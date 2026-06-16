(function () {
  const SESSION_KEY = 'mesa.session';

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch (_) {
      return null;
    }
  }

  function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getToken() {
    const session = getSession();
    return session && session.token;
  }

  function redirectToLogin() {
    if (!location.pathname.startsWith('/login')) {
      location.href = '/login';
    }
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = getToken();

    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(path, {
      ...options,
      headers,
      body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body
    });

    const text = await response.text();
    const data = text ? safeJson(text) : null;

    if (response.status === 401) {
      clearSession();
      redirectToLogin();
      throw new Error('Sesion expirada. Inicia sesion nuevamente.');
    }

    if (!response.ok) {
      const message = data && data.message ? data.message : `Error HTTP ${response.status}`;
      const err = new Error(message);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  function safeJson(text) {
    try {
      return JSON.parse(text);
    } catch (_) {
      return text;
    }
  }

  function qs(params) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.set(key, value);
    });
    const string = query.toString();
    return string ? `?${string}` : '';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]);
  }

  function formatDate(value) {
    if (!value) return '-';
    return String(value).slice(0, 10);
  }

  function formatTime(value) {
    if (!value) return '-';
    return String(value).slice(0, 5);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function toast(message, type = 'ok') {
    const node = document.createElement('div');
    node.className = `toast ${type === 'error' ? 'error' : ''}`;
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 4200);
  }

  function badge(value) {
    const state = String(value || '').toLowerCase();
    const cls = {
      confirmada: 'success',
      disponible: 'success',
      pendiente: 'warning',
      reservada: 'warning',
      ocupada: 'warning',
      cancelada: 'danger',
      mantenimiento: 'danger',
      inactiva: 'danger',
      finalizada: 'neutral',
      no_asistio: 'danger'
    }[state] || 'neutral';
    return `<span class="badge ${cls}">${escapeHtml(value || 'n/a')}</span>`;
  }

  window.MesaAPI = {
    getSession,
    setSession,
    clearSession,
    getToken,
    request,
    qs,
    escapeHtml,
    formatDate,
    formatTime,
    today,
    formData,
    toast,
    badge
  };
})();
