import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-newsletter-block',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="newsletter">
      <div class="newsletter__deco"></div>
      <div class="newsletter__content">
        <h2 class="display-lg newsletter__heading">Precision in your inbox.</h2>
        <p class="newsletter__sub title-lg">
          Join 200,000+ global professionals who start their day with our curated intelligence brief.
          No clutter, just the facts that matter.
        </p>

        @if (success()) {
          <div class="newsletter__success">
            <span class="material-symbols-outlined">check_circle</span>
            You're subscribed. Welcome to The Chronicler.
          </div>
        } @else {
          <form class="newsletter__form" (ngSubmit)="subscribe()">
            <input
              class="newsletter__input"
              type="email"
              placeholder="Professional Email Address"
              [(ngModel)]="email"
              name="email"
              required
            />
            <button class="btn btn-primary newsletter__btn" type="submit" [disabled]="loading()">
              @if (loading()) { Subscribing… } @else { Subscribe Now }
            </button>
          </form>
          @if (error()) {
            <p class="newsletter__error">{{ error() }}</p>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    .newsletter {
      background: var(--c-on-surface);
      color: var(--c-surface);
      padding: 4rem 3rem;
      position: relative;
      overflow: hidden;
    }
    .newsletter__deco {
      position: absolute;
      right: -5rem;
      bottom: -5rem;
      width: 24rem;
      height: 24rem;
      background: var(--c-primary);
      opacity: 0.15;
      transform: rotate(12deg);
    }
    .newsletter__content {
      position: relative;
      z-index: 1;
      max-width: 42rem;
    }
    .newsletter__heading {
      color: var(--c-surface);
      margin-bottom: 1.5rem;
    }
    .newsletter__sub {
      color: rgba(252,249,248,0.75);
      margin-bottom: 2.5rem;
    }
    .newsletter__form {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .newsletter__input {
      flex: 1;
      min-width: 240px;
      background: rgba(252,249,248,0.1);
      border: none;
      border-bottom: 2px solid rgba(252,249,248,0.3);
      color: var(--c-surface);
      padding: 1rem 1.25rem;
      font-family: var(--font-headline);
      font-size: 1rem;
      outline: none;
      border-radius: 0;
      transition: border-color 0.2s;
    }
    .newsletter__input::placeholder { color: rgba(252,249,248,0.4); }
    .newsletter__input:focus { border-bottom-color: var(--c-primary); }
    .newsletter__btn {
      padding: 1rem 2.5rem;
      white-space: nowrap;
    }
    .newsletter__success {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: var(--font-headline);
      font-size: 0.875rem;
      font-weight: 600;
      color: #4ade80;
    }
    .newsletter__error {
      margin-top: 0.75rem;
      font-family: var(--font-headline);
      font-size: 0.75rem;
      color: #fca5a5;
    }
  `],
})
export class NewsletterBlockComponent {
  private api = inject(ApiService);

  email = '';
  loading = signal(false);
  success = signal(false);
  error = signal('');

  subscribe() {
    if (!this.email.trim()) return;
    this.loading.set(true);
    this.error.set('');

    this.api.subscribeNewsletter(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.details?.email?.[0] ?? err?.error?.error ?? 'Something went wrong. Please try again.';
        this.error.set(msg);
      },
    });
  }
}
