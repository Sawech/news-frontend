import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="brand">
          <span class="brand-icon">✦</span>
          <span class="brand-name">The Chronicler</span>
          <p class="brand-sub">Editorial CMS</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="field-group">
            <label for="email" class="field-label">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              class="field-input"
              placeholder="admin@chronicler.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="field-group">
            <label for="password" class="field-label">Password</label>
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
              <span class="btn-spinner"></span> Signing in…
            } @else {
              Sign In
            }
          </button>
        </form>

        <a routerLink="/" class="back-link">← Back to The Chronicler</a>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        background: #0a0a0a;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        font-family: 'Inter', sans-serif;
      }

      .login-card {
        background: #111;
        border: 1px solid #222;
        border-radius: 16px;
        padding: 3rem 2.5rem;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
      }

      .brand {
        text-align: center;
        margin-bottom: 2.5rem;
      }

      .brand-icon {
        display: block;
        font-size: 2rem;
        color: #c8a96e;
        margin-bottom: 0.5rem;
      }

      .brand-name {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: #f5f0e8;
        letter-spacing: -0.03em;
        font-family: 'Playfair Display', 'Georgia', serif;
      }

      .brand-sub {
        margin-top: 0.25rem;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #555;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .field-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #888;
      }

      .field-input {
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        color: #f5f0e8;
        font-size: 0.95rem;
        transition: border-color 0.2s;
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }

      .field-input:focus {
        border-color: #c8a96e;
      }

      .field-input::placeholder {
        color: #444;
      }

      .error-banner {
        background: rgba(220, 38, 38, 0.15);
        border: 1px solid rgba(220, 38, 38, 0.4);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        color: #f87171;
        font-size: 0.85rem;
      }

      .login-btn {
        background: #c8a96e;
        color: #0a0a0a;
        border: none;
        border-radius: 8px;
        padding: 0.85rem 1.5rem;
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        cursor: pointer;
        transition:
          background 0.2s,
          transform 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .login-btn:hover:not(:disabled) {
        background: #d4b87a;
        transform: translateY(-1px);
      }

      .login-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(0, 0, 0, 0.3);
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

      .back-link {
        display: block;
        text-align: center;
        margin-top: 1.75rem;
        color: #555;
        font-size: 0.8rem;
        text-decoration: none;
        transition: color 0.2s;
      }

      .back-link:hover {
        color: #888;
      }
    `,
  ],
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = 'admin@chronicler.com';
  password = 'admin123!';
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
