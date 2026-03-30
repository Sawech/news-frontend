import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <!-- Top header -->
      <header class="site-header">
        <span class="site-title">THE CHRONICLER</span>
      </header>

      <!-- Main content -->
      <main class="login-main">
        <div class="login-card">
          <!-- Brand -->
          <div class="brand">
            <span class="brand-icon">★</span>
            <p class="brand-eyebrow">Internal Access Only</p>
            <h1 class="brand-name">Admin Sign In</h1>
            <p class="brand-sub">Editorial CMS</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="login-form">
            <!-- Email -->
            <div class="field-group">
              <label for="email" class="field-label">Admin Email</label>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                class="field-input"
                placeholder="editorial.admin@chronicler.com"
                autocomplete="email"
                required
              />
            </div>

            <!-- Password -->
            <div class="field-group">
              <div class="field-label-row">
                <label for="password" class="field-label">Security Key</label>
              </div>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                class="field-input"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
            </div>

            @if (error()) {
              <div class="error-banner" role="alert">{{ error() }}</div>
            }

            <button type="submit" id="login-submit" class="login-btn" [disabled]="loading()">
              @if (loading()) {
                <span class="btn-spinner"></span> Authorizing…
              } @else {
                Authorize Access
              }
            </button>
          </form>

          <p class="security-notice">
            <em
              >Unauthorized access to this portal is strictly prohibited and subject to
              monitoring.</em
            >
          </p>
        </div>
      </main>

      <!-- Footer -->
      <footer class="site-footer">
        <span class="footer-brand">THE CHRONICLER</span>
        <div class="footer-right">
          <p class="footer-copy">
            © 2026 The Chronicler. All Rights Reserved. Architectural Integrity in Journalism.
          </p>
          <nav class="footer-nav">
            <a href="#" class="footer-link" (click)="$event.preventDefault()">System Status</a>
            <a href="#" class="footer-link" (click)="$event.preventDefault()">Security Policy</a>
            <a href="#" class="footer-link" (click)="$event.preventDefault()">IT Support</a>
          </nav>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Barlow:wght@400;500;600;700&display=swap');

      .login-page {
        min-height: 100vh;
        background: #0a0a0a;
        display: flex;
        flex-direction: column;
        font-family: 'Barlow', sans-serif;
      }

      /* ── Header ── */
      .site-header {
        padding: 1.5rem 2.5rem;
        display: flex;
        justify-content: center;
      }

      .site-title {
        font-family: 'Barlow', sans-serif;
        font-weight: 700;
        font-size: 1rem;
        letter-spacing: 0.25em;
        color: #f5f0e8;
        text-transform: uppercase;
      }

      /* ── Main ── */
      .login-main {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1.5rem;
      }

      .login-card {
        background: #111;
        border: 1px solid #1e1e1e;
        border-radius: 12px;
        padding: 3rem 2.75rem 2.5rem;
        width: 100%;
        max-width: 420px;
        box-shadow: 0 32px 96px rgba(0, 0, 0, 0.7);
      }

      /* ── Brand ── */
      .brand {
        text-align: center;
        margin-bottom: 2.5rem;
      }

      .brand-icon {
        display: block;
        font-size: 1.75rem;
        color: #c8a96e;
        margin-bottom: 1rem;
      }

      .brand-eyebrow {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        color: #555;
        margin: 0 0 0.5rem;
      }

      .brand-name {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 2.1rem;
        font-weight: 700;
        color: #f5f0e8;
        letter-spacing: -0.02em;
        margin: 0 0 0.4rem;
        line-height: 1.15;
      }

      .brand-sub {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        color: #555;
        margin: 0;
      }

      /* ── Form ── */
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }

      .field-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .field-label {
        font-size: 0.68rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #777;
      }

      .reset-link {
        font-size: 0.68rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #c8a96e;
        text-decoration: none;
        transition: opacity 0.2s;
      }

      .reset-link:hover {
        opacity: 0.75;
      }

      .field-input {
        background: #161616;
        border: 1px solid #252525;
        border-radius: 6px;
        padding: 0.8rem 1rem;
        color: #e8e3da;
        font-size: 0.9rem;
        font-family: 'Barlow', sans-serif;
        transition: border-color 0.2s;
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }

      .field-input:focus {
        border-color: #3a3a3a;
      }

      .field-input::placeholder {
        color: #3a3a3a;
      }

      /* ── Checkbox ── */
      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .checkbox-input {
        appearance: none;
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        min-width: 16px;
        border: 1px solid #333;
        border-radius: 3px;
        background: #161616;
        cursor: pointer;
        position: relative;
        transition:
          border-color 0.2s,
          background 0.2s;
      }

      .checkbox-input:checked {
        background: #c8a96e;
        border-color: #c8a96e;
      }

      .checkbox-input:checked::after {
        content: '';
        position: absolute;
        left: 4px;
        top: 1px;
        width: 5px;
        height: 9px;
        border: 2px solid #0a0a0a;
        border-top: none;
        border-left: none;
        transform: rotate(45deg);
      }

      .checkbox-label {
        font-size: 0.68rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #666;
        cursor: pointer;
        user-select: none;
      }

      /* ── Error ── */
      .error-banner {
        background: rgba(220, 38, 38, 0.12);
        border: 1px solid rgba(220, 38, 38, 0.35);
        border-radius: 6px;
        padding: 0.7rem 1rem;
        color: #f87171;
        font-size: 0.82rem;
      }

      /* ── Button ── */
      .login-btn {
        background: #c8a96e;
        color: #0a0a0a;
        border: none;
        border-radius: 6px;
        padding: 1rem 1.5rem;
        font-size: 0.78rem;
        font-family: 'Barlow', sans-serif;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        cursor: pointer;
        transition:
          background 0.2s,
          transform 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 0.25rem;
        width: 100%;
      }

      .login-btn:hover:not(:disabled) {
        background: #d4b87a;
        transform: translateY(-1px);
      }

      .login-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .btn-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(0, 0, 0, 0.25);
        border-top-color: #0a0a0a;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        display: inline-block;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ── Security notice ── */
      .security-notice {
        margin-top: 2rem;
        text-align: center;
        font-size: 0.75rem;
        color: #333;
        line-height: 1.6;
      }

      /* ── Footer ── */
      .site-footer {
        padding: 1.5rem 2.5rem;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        border-top: 1px solid #161616;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .footer-brand {
        font-family: 'Barlow', sans-serif;
        font-weight: 700;
        font-size: 0.85rem;
        letter-spacing: 0.2em;
        color: #f5f0e8;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .footer-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.4rem;
      }

      .footer-copy {
        font-size: 0.65rem;
        color: #333;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin: 0;
      }

      .footer-nav {
        display: flex;
        gap: 1.5rem;
      }

      .footer-link {
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #555;
        text-decoration: none;
        transition: color 0.2s;
      }

      .footer-link:hover {
        color: #888;
      }
    `,
  ],
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async onSubmit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      const msg = err?.error?.error ?? 'Login failed. Please check your credentials.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
