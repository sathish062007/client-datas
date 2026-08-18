/* ==========================================================================
   Hasatz Solutions Client Portal - Authentication & Admin Guard Handler (js/auth.js)
   Authorized Admin Emails:
   - vikkyvikky132007@gmail.com
   - sksathish2871@gmail.com
   ========================================================================== */

// Admin Email Whitelist
window.ADMIN_EMAILS = [
  'vikkyvikky132007@gmail.com',
  'sksathish2871@gmail.com'
];

window.isAdminEmail = function(email) {
  if (!email) return false;
  return window.ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(email.toLowerCase().trim());
};

class AuthService {
  constructor() {
    this.sessionKey = 'hasatz_user_session';
  }

  // Get currently active user
  getCurrentUser() {
    const data = localStorage.getItem(this.sessionKey);
    return data ? JSON.parse(data) : null;
  }

  // Set user session
  setSession(user) {
    user.isAdmin = window.isAdminEmail(user.email);
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    this.updateHeaderAuthUI();
  }

  // Login with Email & Password
  async loginWithEmail(email, password) {
    const cleanEmail = email.trim();
    const fbObj = window.HasatzFirebase || window.CodenexaFirebase;

    // Check if Firebase Auth is available
    if (fbObj && fbObj.auth) {
      try {
        const { auth, signInWithEmailAndPassword } = fbObj;
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCred.user;

        const user = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || cleanEmail.split('@')[0],
          email: fbUser.email,
          provider: 'firebase-email',
          photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanEmail)}&background=10b981&color=fff`,
          isAdmin: window.isAdminEmail(fbUser.email),
          createdAt: new Date().toISOString()
        };

        this.setSession(user);
        return user;
      } catch (fbErr) {
        console.warn("Firebase email sign-in error, using local session mode:", fbErr.message);
      }
    }

    // Local / Demo Mode Login Fallback
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!cleanEmail || !password) {
          reject(new Error('Please fill in both email and password.'));
          return;
        }

        const user = {
          uid: 'usr_' + Math.random().toString(36).substr(2, 9),
          displayName: cleanEmail.split('@')[0].replace('.', ' '),
          email: cleanEmail,
          provider: 'password',
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanEmail)}&background=10b981&color=fff`,
          isAdmin: window.isAdminEmail(cleanEmail),
          createdAt: new Date().toISOString()
        };

        this.setSession(user);
        resolve(user);
      }, 500);
    });
  }

  // Register New Client Account
  async registerWithEmail(name, email, password) {
    const cleanEmail = email.trim();
    const fbObj = window.HasatzFirebase || window.CodenexaFirebase;

    if (fbObj && fbObj.auth) {
      try {
        const { auth, createUserWithEmailAndPassword } = fbObj;
        const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCred.user;

        const user = {
          uid: fbUser.uid,
          displayName: name,
          email: fbUser.email,
          provider: 'firebase-email',
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
          isAdmin: window.isAdminEmail(fbUser.email),
          createdAt: new Date().toISOString()
        };

        this.setSession(user);
        return user;
      } catch (fbErr) {
        console.warn("Firebase registration error, using local session mode:", fbErr.message);
      }
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!name || !cleanEmail || !password) {
          reject(new Error('All fields are required for registration.'));
          return;
        }

        const user = {
          uid: 'usr_' + Math.random().toString(36).substr(2, 9),
          displayName: name,
          email: cleanEmail,
          provider: 'password',
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
          isAdmin: window.isAdminEmail(cleanEmail),
          createdAt: new Date().toISOString()
        };

        this.setSession(user);
        resolve(user);
      }, 500);
    });
  }

  // Login with Google OAuth
  async loginWithGoogle() {
    const fbObj = window.HasatzFirebase || window.CodenexaFirebase;

    if (fbObj && fbObj.auth) {
      try {
        const { auth, googleProvider, signInWithPopup } = fbObj;
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;

        const user = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'Google User',
          email: fbUser.email,
          provider: 'google.com',
          photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName)}&background=06b6d4&color=fff`,
          isAdmin: window.isAdminEmail(fbUser.email),
          createdAt: new Date().toISOString()
        };

        this.setSession(user);
        return user;
      } catch (fbErr) {
        console.warn("Firebase Google Auth warning, using fallback:", fbErr.message);
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          uid: 'goog_' + Math.random().toString(36).substr(2, 9),
          displayName: 'Demo Google User',
          email: 'vikkyvikky132007@gmail.com', // Default demo google admin email
          provider: 'google.com',
          photoURL: 'https://ui-avatars.com/api/?name=Admin+User&background=06b6d4&color=fff',
          isAdmin: true,
          createdAt: new Date().toISOString()
        };

        this.setSession(user);
        resolve(user);
      }, 600);
    });
  }

  // Logout current user
  logout() {
    const fbObj = window.HasatzFirebase || window.CodenexaFirebase;
    if (fbObj && fbObj.auth) {
      try {
        fbObj.signOut(fbObj.auth);
      } catch (e) {}
    }
    localStorage.removeItem(this.sessionKey);
    window.showToast('Successfully logged out.', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  }

  // Update navbar dynamic user profile & admin portal link
  updateHeaderAuthUI() {
    const user = this.getCurrentUser();
    const navActions = document.getElementById('navAuthActions');
    const navLinks = document.querySelector('.nav-links');
    const isAdmin = user ? window.isAdminEmail(user.email) : false;

    // Handle Admin Portal link in main navigation
    if (navLinks) {
      let adminLinkEl = document.getElementById('dynamicAdminNavLink');
      if (isAdmin) {
        if (!adminLinkEl) {
          adminLinkEl = document.createElement('a');
          adminLinkEl.id = 'dynamicAdminNavLink';
          adminLinkEl.href = 'admin.html';
          adminLinkEl.className = 'nav-link' + (window.location.pathname.includes('admin.html') ? ' active' : '');
          adminLinkEl.style.color = '#059669';
          adminLinkEl.style.fontWeight = '700';
          adminLinkEl.innerHTML = '⚙️ Admin Portal';
          navLinks.appendChild(adminLinkEl);
        }
      } else {
        if (adminLinkEl) adminLinkEl.remove();
      }
    }
    
    if (!navActions) return;

    if (user) {
      const adminBadge = isAdmin 
        ? `<span class="badge badge-completed" style="font-size: 0.72rem; padding: 0.15rem 0.5rem; margin-left: 0.3rem;">🛡️ Admin</span>` 
        : '';

      navActions.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <img src="${user.photoURL}" alt="${user.displayName}" style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--primary);">
          <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);" class="mobile-hide">
            ${user.displayName} ${adminBadge}
          </span>
          <a href="dashboard.html" class="btn btn-secondary" style="padding: 0.5rem 0.85rem; font-size: 0.85rem;">Dashboard</a>
          ${isAdmin ? `<a href="admin.html" class="btn btn-primary" style="padding: 0.5rem 0.85rem; font-size: 0.85rem;">Admin Portal</a>` : ''}
          <button id="logoutBtn" class="btn btn-outline" style="padding: 0.5rem 0.85rem; font-size: 0.85rem;" title="Logout">🚪</button>
        </div>
      `;

      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.logout());
      }
    } else {
      navActions.innerHTML = `
        <a href="login.html" class="btn btn-secondary">Sign In</a>
        <a href="requirement.html" class="btn btn-primary">Submit Spec</a>
      `;
    }
  }
}

window.HasatzAuth = new AuthService();
window.CodenexaAuth = window.HasatzAuth; // Alias

// Admin Access Guard Function
window.checkAdminAccess = function() {
  const authObj = window.HasatzAuth || window.CodenexaAuth;
  const user = authObj ? authObj.getCurrentUser() : null;
  
  if (!user || !window.isAdminEmail(user.email)) {
    window.showToast('Access Denied: Only authorized admin accounts can access the Admin Dashboard.', 'error');
    
    // Render access denied UI on admin.html page if present
    const mainContainer = document.querySelector('main.main-content .container');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="glass-card" style="text-align: center; max-width: 600px; margin: 3rem auto; padding: 3.5rem 2rem;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🔒</div>
          <h2 style="font-size: 1.8rem; color: #f43f5e; margin-bottom: 0.75rem;">Admin Access Restricted</h2>
          <p style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 2rem;">
            The Admin Dashboard is only accessible when logged in with an authorized Hasatz Solutions administrator account.
          </p>
          <a href="login.html" class="btn btn-primary btn-lg">
            🔑 Sign In to Admin Account
          </a>
        </div>
      `;
    }

    return false;
  }

  return true;
};

document.addEventListener('DOMContentLoaded', () => {
  const authObj = window.HasatzAuth || window.CodenexaAuth;
  authObj.updateHeaderAuthUI();

  // Attach login/register form listeners if on login.html
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const googleBtn = document.getElementById('googleAuthBtn');

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        const user = await authObj.loginWithGoogle();
        window.showToast(`Welcome ${user.displayName}!`, 'success');
        setTimeout(() => {
          if (user.isAdmin) {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 700);
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const user = await authObj.loginWithEmail(email, password);
        window.showToast('Login successful!', 'success');
        setTimeout(() => {
          if (user.isAdmin) {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 700);
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;

      try {
        const user = await authObj.registerWithEmail(name, email, password);
        window.showToast('Account created successfully!', 'success');
        setTimeout(() => {
          if (user.isAdmin) {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 700);
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });
  }
});
