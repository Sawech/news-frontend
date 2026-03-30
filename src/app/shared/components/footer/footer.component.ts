import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer__grid">
        <!-- Brand -->
        <div class="footer__brand">
          <a routerLink="/" class="footer__logo">THE CHRONICLER</a>
          <p class="footer__tagline">
            © 2026 THE CHRONICLER.<br />ARCHITECTURAL PRECISION IN JOURNALISM.
          </p>
        </div>

        <!-- Sections -->
        <div>
          <p class="footer__col-title">Sections</p>
          <ul class="footer__links">
            @for (link of sections; track link.slug) {
              <li>
                <a [routerLink]="['/category', link.slug]" class="footer__link">{{ link.label }}</a>
              </li>
            }
          </ul>
        </div>

        <!-- Company -->
        <div>
          <p class="footer__col-title">Company</p>
          <ul class="footer__links">
            <li><a class="footer__link" href="#">About</a></li>
            <li><a class="footer__link" href="#">Contact</a></li>
            <li><a class="footer__link" href="#">Privacy</a></li>
            <li><a class="footer__link" href="#">Terms</a></li>
          </ul>
        </div>

        <!-- Archives -->
        <div>
          <p class="footer__col-title">Archives</p>
          <div class="footer__archives">
            @for (year of [2026, 2027, 2028, 2029]; track year) {
              <a class="footer__link" href="#">{{ year }}</a>
            }
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        background: var(--c-surface-low);
      }
      .footer__grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 3rem;
        padding-top: 3rem;
        padding-bottom: 3rem;
      }
      .footer__logo {
        display: block;
        font-family: var(--font-headline);
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: -0.02em;
        color: var(--c-on-surface);
        text-decoration: none;
        margin-bottom: 1.5rem;
      }
      .footer__tagline {
        font-family: var(--font-headline);
        font-size: 0.625rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--c-on-surface-variant);
        line-height: 1.8;
        margin-bottom: 1.5rem;
      }
      .footer__social {
        display: flex;
        gap: 1rem;
      }
      .footer__social-icon {
        color: var(--c-on-surface-variant);
        cursor: pointer;
        transition: color 0.2s;
      }
      .footer__social-icon:hover {
        color: var(--c-primary);
      }
      .footer__col-title {
        font-family: var(--font-headline);
        font-size: 0.625rem;
        font-weight: 900;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: var(--c-primary);
        margin-bottom: 1.5rem;
      }
      .footer__links {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .footer__link {
        font-family: var(--font-headline);
        font-size: 0.625rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--c-on-surface-variant);
        text-decoration: none;
        transition: color 0.2s;
      }
      .footer__link:hover {
        color: var(--c-on-surface);
      }
      .footer__archives {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      @media (max-width: 768px) {
        .footer__grid {
          grid-template-columns: 1fr 1fr;
        }
        .footer__brand {
          grid-column: 1 / -1;
        }
      }
    `,
  ],
})
export class FooterComponent {
  sections = [
    { slug: 'world', label: 'World' },
    { slug: 'politics', label: 'Politics' },
    { slug: 'tech', label: 'Tech' },
    { slug: 'business', label: 'Business' },
    { slug: 'culture', label: 'Culture' },
    { slug: 'science', label: 'Science' },
  ];
}
