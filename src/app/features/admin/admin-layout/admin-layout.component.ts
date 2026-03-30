import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-shell">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="brand-icon">✦</span>
          <span class="brand-label">The Chronicler</span>
        </div>

        <nav class="sidebar-nav">
          <p class="nav-section-label">Content</p>
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="nav-active"
            class="nav-item"
            id="nav-dashboard"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </a>

          <a
            routerLink="/admin/articles/new"
            routerLinkActive="nav-active"
            class="nav-item"
            id="nav-new-article"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Article
          </a>

          <p class="nav-section-label" style="margin-top:1rem">Manage</p>
          <a
            routerLink="/admin/authors"
            routerLinkActive="nav-active"
            class="nav-item"
            id="nav-authors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Authors
          </a>

          <a
            routerLink="/admin/categories"
            routerLinkActive="nav-active"
            class="nav-item"
            id="nav-categories"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
              />
            </svg>
            Categories
          </a>

          <a
            routerLink="/admin/tickers"
            routerLinkActive="nav-active"
            class="nav-item"
            id="nav-tickers"
          >
            <svg width="16" height="16" viewBox="0 0 48 48" fill="currentColor">
              <polygon
                points="8,9 10,9 10,12 10,16 10,39 8,39 8,42 16,42 16,39 14,39 14,16 14,12 14,9 16,9 16,6 8,6 "
              ></polygon>
              <polygon points="4,16 7.021,16 7.021,12 0,12 0,36 7.042,36 7.042,32 4,32 "></polygon>
              <polygon
                points="16.979,12 16.979,16 44,16 44,32 16.958,32 16.958,36 48,36 48,12 "
              ></polygon>
            </svg>
            Tickers
          </a>
        </nav>

        <div class="sidebar-footer">
          <a
            routerLink="/admin/settings"
            routerLinkActive="nav-active"
            class="nav-item settings-link"
            id="nav-settings"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
            Settings
          </a>
          <div class="user-info">
            <div class="user-avatar">{{ userInitial() }}</div>
            <div class="user-meta">
              <span class="user-name">{{ userName() }}</span>
              <span class="user-role">{{ userRole() }}</span>
            </div>
          </div>
          <button class="logout-btn" id="logout-btn" (click)="logout()">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .admin-shell {
        display: flex;
        min-height: 100vh;
        background: #0d0d0d;
        font-family: 'Inter', sans-serif;
      }

      /* ── Sidebar ── */
      .sidebar {
        width: 240px;
        flex-shrink: 0;
        background: #111;
        border-right: 1px solid #1e1e1e;
        display: flex;
        flex-direction: column;
        padding: 1.5rem 0;
      }

      .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 1.5rem 1.75rem;
        border-bottom: 1px solid #1e1e1e;
        margin-bottom: 1.25rem;
      }

      .brand-icon {
        font-size: 1.25rem;
        color: #c8a96e;
      }

      .brand-label {
        font-size: 0.95rem;
        font-weight: 700;
        color: #f5f0e8;
        font-family: 'Playfair Display', 'Georgia', serif;
        letter-spacing: -0.02em;
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0 0.75rem;
        flex: 1;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.65rem 0.85rem;
        border-radius: 8px;
        color: #666;
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        transition:
          background 0.15s,
          color 0.15s;
      }

      .nav-item:hover {
        background: #1a1a1a;
        color: #aaa;
      }

      .nav-item.nav-active {
        background: rgba(200, 169, 110, 0.12);
        color: #c8a96e;
      }

      .nav-section-label {
        font-size: 0.62rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #333;
        padding: 0 0.85rem;
        margin: 0.5rem 0 0.2rem;
      }

      .settings-link {
        margin-bottom: 0.25rem;
      }

      .sidebar-footer {
        padding: 1.25rem 1rem 0;
        border-top: 1px solid #1e1e1e;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0 0.5rem;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(200, 169, 110, 0.2);
        color: #c8a96e;
        font-size: 0.8rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .user-meta {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .user-name {
        font-size: 0.8rem;
        font-weight: 600;
        color: #ccc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-role {
        font-size: 0.7rem;
        color: #555;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .logout-btn {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.6rem 0.85rem;
        border-radius: 8px;
        background: transparent;
        border: none;
        color: #555;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition:
          background 0.15s,
          color 0.15s;
        width: 100%;
      }

      .logout-btn:hover {
        background: rgba(220, 38, 38, 0.1);
        color: #f87171;
      }

      /* ── Main ── */
      .admin-main {
        flex: 1;
        overflow: auto;
        background: #0d0d0d;
      }
    `,
  ],
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);

  readonly userName = computed(() => this.auth.currentUser()?.name ?? 'Admin');
  readonly userRole = computed(() => this.auth.currentUser()?.role ?? '');
  readonly userInitial = computed(() => (this.auth.currentUser()?.name ?? 'A')[0].toUpperCase());

  logout() {
    this.auth.logout();
  }
}
