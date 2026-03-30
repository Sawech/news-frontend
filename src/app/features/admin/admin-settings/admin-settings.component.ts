import { Component, inject, computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [],
  template: `
    <div class="settings-page">
      <header class="settings-header">
        <h1 class="settings-title">Settings</h1>
        <p class="settings-sub">Account & platform information</p>
      </header>

      <div class="settings-grid">
        <!-- Profile Card -->
        <section class="settings-card">
          <h2 class="card-title">Your Profile</h2>
          <div class="profile-block">
            <div class="profile-avatar">{{ initial() }}</div>
            <div class="profile-meta">
              <span class="profile-name">{{ name() }}</span>
              <span class="profile-email">{{ email() }}</span>
              <span class="role-badge">{{ role() }}</span>
            </div>
          </div>

          <div class="info-rows">
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value">{{ name() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{{ email() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Role</span>
              <span class="info-value">{{ role() }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-page {
        padding: 2.5rem 2rem;
        max-width: 1100px;
        margin: 0 auto;
      }

      .settings-header {
        margin-bottom: 2rem;
      }

      .settings-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #f5f0e8;
        font-family: 'Playfair Display', 'Georgia', serif;
        letter-spacing: -0.03em;
        margin: 0;
      }

      .settings-sub {
        margin: 0.25rem 0 0;
        font-size: 0.8rem;
        color: #555;
      }

      .settings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.25rem;
        align-items: start;
      }

      .settings-card {
        background: #111;
        border: 1px solid #1e1e1e;
        border-radius: 14px;
        padding: 1.5rem;
      }

      .card-title {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #555;
        margin: 0 0 1.25rem;
      }

      /* ── Profile ── */
      .profile-block {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #1e1e1e;
      }

      .profile-avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: rgba(200, 169, 110, 0.15);
        color: #c8a96e;
        font-size: 1.25rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 2px solid rgba(200, 169, 110, 0.2);
      }

      .profile-meta {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .profile-name {
        font-size: 0.95rem;
        font-weight: 600;
        color: #e0dbd0;
      }

      .profile-email {
        font-size: 0.78rem;
        color: #666;
      }

      .role-badge {
        display: inline-flex;
        align-self: flex-start;
        margin-top: 0.2rem;
        background: rgba(200, 169, 110, 0.15);
        color: #c8a96e;
        border-radius: 100px;
        padding: 0.15rem 0.6rem;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      /* ── Info Rows ── */
      .info-rows {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.7rem 0;
        border-bottom: 1px solid #161616;
      }

      .info-row:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: 0.78rem;
        color: #555;
      }

      .info-value {
        font-size: 0.82rem;
        color: #aaa;
        font-weight: 500;
      }

      .version-badge {
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        border-radius: 100px;
        padding: 0.15rem 0.6rem;
        font-size: 0.7rem;
        color: #666;
        font-family: monospace;
      }

      /* ── Quick Links ── */
      .link-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .quick-link {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        padding: 0.9rem 1rem;
        background: #161616;
        border: 1px solid #1e1e1e;
        border-radius: 10px;
        text-decoration: none;
        transition:
          border-color 0.15s,
          background 0.15s;
      }

      .quick-link:hover {
        background: #1a1a1a;
        border-color: #2a2a2a;
      }

      .link-icon {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: rgba(200, 169, 110, 0.1);
        color: #c8a96e;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .link-title {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: #ccc;
      }

      .link-desc {
        display: block;
        font-size: 0.72rem;
        color: #555;
        margin-top: 0.1rem;
      }

      @media (max-width: 700px) {
        .settings-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminSettingsComponent {
  private readonly auth = inject(AuthService);

  readonly name = () => this.auth.currentUser()?.name ?? 'Admin';
  readonly email = () => this.auth.currentUser()?.email ?? '—';
  readonly role = () => this.auth.currentUser()?.role ?? '—';
  readonly initial = () => (this.auth.currentUser()?.name ?? 'A')[0].toUpperCase();
}
