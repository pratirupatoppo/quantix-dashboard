/* ================================================================
   QUANTIX — Authentication Module (IndexedDB + Web Crypto)
   ================================================================ */

'use strict';

const AuthDB = {
  DB_NAME: 'QuantixAuthDB',
  DB_VERSION: 1,
  STORE_NAME: 'users',
  SESSION_KEY: 'quantix_session',

  /* ── Open / init the database ───────────────────────────────── */
  open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'email' });
          store.createIndex('username', 'username', { unique: true });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  /* ── Hash password using SHA-256 ────────────────────────────── */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /* ── Register a new user ────────────────────────────────────── */
  async register(username, email, password) {
    const db = await this.open();
    const hashedPw = await this.hashPassword(password);

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);

      // Check if email already exists
      const getReq = store.get(email);
      getReq.onsuccess = () => {
        if (getReq.result) {
          reject(new Error('An account with this email already exists.'));
          return;
        }

        const user = {
          email,
          username,
          password: hashedPw,
          avatar: username.charAt(0).toUpperCase(),
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        const addReq = store.add(user);
        addReq.onsuccess = () => resolve(user);
        addReq.onerror = () => reject(new Error('Username already taken.'));
      };
      getReq.onerror = () => reject(getReq.error);
    });
  },

  /* ── Authenticate a user ────────────────────────────────────── */
  async login(email, password) {
    const db = await this.open();
    const hashedPw = await this.hashPassword(password);

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const getReq = store.get(email);

      getReq.onsuccess = () => {
        const user = getReq.result;
        if (!user) {
          reject(new Error('No account found with this email.'));
          return;
        }
        if (user.password !== hashedPw) {
          reject(new Error('Incorrect password. Please try again.'));
          return;
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        store.put(user);

        resolve(user);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  },

  /* ── Session management ─────────────────────────────────────── */
  setSession(user) {
    const session = {
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      loggedInAt: new Date().toISOString()
    };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  },

  getSession() {
    const data = sessionStorage.getItem(this.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearSession() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  isLoggedIn() {
    return this.getSession() !== null;
  },

  /* ── Get all users (admin view) ─────────────────────────────── */
  async getAllUsers() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  /* ── Redirect helpers ───────────────────────────────────────── */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  logout() {
    this.clearSession();
    window.location.href = 'login.html';
  }
};
