// Auth utility functions
// DEPLOYMENT NOTE: Change this URL to your production domain when deploying
// For example: "https://istech.com" or "https://api.istech.com"
//! const API_BASE = "http://localhost:5001";
const API_BASE = "https://istech-production.up.railway.app/";

class AuthManager {
  static getToken() {
    return localStorage.getItem('authToken');
  }

  static getUser() {
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    return userEmail && userName ? { email: userEmail, name: userName } : null;
  }

  static async isLoggedIn() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  static logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
  }

  static requireAuth() {
    if (!this.getToken()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  static updateNavbar() {
    const navCta = document.querySelector('.nav-cta');
    if (!navCta) return;

    const user = this.getUser();
    if (user) {
      navCta.innerHTML = `
        <span class="user-greeting">Welcome, ${user.name.split(' ')[0]}</span>
        <button class="btn btn-ghost" id="logoutBtn">Logout</button>
      `;
      document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    } else {
      navCta.innerHTML = `
        <a href="login.html" class="btn btn-ghost">Log In</a>
        <a href="signup.html" class="btn btn-accent">Sign Up →</a>
      `;
    }
  }
}

// Notification system
class NotificationManager {
  static show(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getIcon(type)}</span>
        <span class="notification-text">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-hide
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, duration);
    }

    // Show animation
    setTimeout(() => notification.classList.add('show'), 10);
  }

  static getIcon(type) {
    const icons = {
      success: '✓',
      error: '⚠',
      warning: '!',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
  AuthManager.updateNavbar();
});