(function () {
  const app = {
    storageKeys: {
      user: 'sbd_user',
      data: 'sbd_dataset',
      plan: 'sbd_plan',
      business: 'sbd_business_name'
    },
    parseNumber(value) {
      const n = Number(String(value).replace(/[^\d.-]/g, ''));
      return Number.isFinite(n) ? n : 0;
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
    },
    readData() {
      try {
        return JSON.parse(localStorage.getItem(this.storageKeys.data) || '[]');
      } catch {
        return [];
      }
    },
    writeData(rows) {
      localStorage.setItem(this.storageKeys.data, JSON.stringify(rows));
    },
    login(email) {
      localStorage.setItem(this.storageKeys.user, JSON.stringify({ email, ts: Date.now() }));
    },
    getUser() {
      try { return JSON.parse(localStorage.getItem(this.storageKeys.user) || 'null'); } catch { return null; }
    },
    logout() { localStorage.removeItem(this.storageKeys.user); }
  };
  window.SBD = app;
})();
