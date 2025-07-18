class LocalStorageManager {
  constructor() {
    this.prefix = "servicepro_";
  }

  setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(`${this.prefix}${key}`, serializedValue);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  getItem(key) {
    try {
      const serializedValue = localStorage.getItem(`${this.prefix}${key}`);
      return serializedValue ? JSON.parse(serializedValue) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.prefix)
      );
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
}

export const storage = new LocalStorageManager();
