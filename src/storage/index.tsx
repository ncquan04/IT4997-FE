export const STORAGE_KEY = {
  BILLING_INFO: "billingInfo",
};

const AppStorage = {
  set(key: string, value: any, ttl?: number) {
    const item = {
      value: value,
      expiry: ttl ? Date.now() + ttl : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get(key: string, defaultValue?: any) {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;

    try {
      const item = JSON.parse(raw);
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return defaultValue;
      }
      return item.value;
    } catch {
      return defaultValue;
    }
  },

  remove(key: string) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  },

  has(key: string) {
    return localStorage.getItem(key) !== null;
  },
};

export default AppStorage;
