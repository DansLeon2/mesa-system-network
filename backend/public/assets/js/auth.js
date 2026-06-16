(function () {
  const api = window.MesaAPI;

  async function requireAuth() {
    const session = api.getSession();
    if (!session || !session.token) {
      location.href = '/login';
      return null;
    }

    try {
      const result = await api.request('/api/auth/me');
      const nextSession = { ...session, user: result.user };
      api.setSession(nextSession);
      return nextSession;
    } catch (_) {
      return null;
    }
  }

  function logout() {
    api.clearSession();
    location.href = '/login';
  }

  function setupLogin() {
    const form = document.querySelector('[data-login-form]');
    if (!form) return;

    if (api.getToken()) {
      location.href = '/dashboard';
      return;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const error = form.querySelector('[data-login-error]');
      const original = button.innerHTML;

      button.disabled = true;
      button.innerHTML = '<span class="material-symbols-outlined">sync</span> AUTHENTICATING...';
      if (error) error.textContent = '';

      try {
        const credentials = api.formData(form);
        const result = await api.request('/api/auth/login', {
          method: 'POST',
          body: {
            username: credentials.username,
            password: credentials.password
          }
        });
        api.setSession(result);
        button.innerHTML = '<span class="material-symbols-outlined">check_circle</span> ACCESS GRANTED';
        setTimeout(() => {
          location.href = '/dashboard';
        }, 350);
      } catch (err) {
        if (error) error.textContent = err.message;
        button.innerHTML = original;
        button.disabled = false;
      }
    });
  }

  window.MesaAuth = { requireAuth, logout, setupLogin };
  document.addEventListener('DOMContentLoaded', setupLogin);
})();
