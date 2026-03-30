import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { Article, Category } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { NewsletterBlockComponent } from '../../shared/components/newsletter/newsletter-block.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ArticleCardComponent, NewsletterBlockComponent],
  template: `
    <main>
      <!-- ─── HERO: 8 + 4 asymmetric grid ─────────────────────── -->
      <div class="container hero__title">
        <span class="hero__label">International Desk</span>
        <h1 class="hero__main-title">World News</h1>
        <p class="hero__subtitle">
          Reporting from every corner of the globe. From geopolitical shifts to local narratives
          that resonate across borders.
        </p>
      </div>

      <!-- ─── FILTERS / VIEW TOGGLE ────────────────────────────── -->
      <section class="container filters">
        <div class="filters__tabs">
          <button class="filters__tab filters__tab--active">Latest</button>
          <button class="filters__tab">Most Popular</button>
          <button class="filters__tab">Past 24 Hours</button>
          <button class="filters__tab">Europe</button>
          <button class="filters__tab">Asia-Pacific</button>
          <button class="filters__tab">Americas</button>
        </div>
        <div class="filters__view">
          <span class="filters__view-label">View</span>
          <button class="filters__view-btn filters__view-btn--active material-symbols-outlined">
            grid_view
          </button>
          <button class="filters__view-btn material-symbols-outlined">view_list</button>
        </div>
      </section>

      <section class="hero container">
        <!-- Lead story: 8 cols -->
        @if (featuredArticle(); as hero) {
          <div class="hero__lead" [routerLink]="['/article', hero.slug]">
            <div class="hero__image-wrap">
              @if (hero.imageUrl) {
                <img class="hero__image" [src]="hero.imageUrl" [alt]="hero.title" />
              }
              <div class="hero__badge">Happening Now</div>
            </div>
            <div class="hero__text">
              <span class="label-md hero__category">{{ hero.category.name }}</span>
              <h1 class="display-lg">{{ hero.title }}</h1>
              <p class="hero__deck title-lg">{{ hero.excerpt }}</p>
            </div>
          </div>
        } @else {
          <div class="hero__lead hero__lead--skeleton"></div>
        }

        <!-- Sidebar: 4 cols -->
        <aside class="hero__sidebar">
          <!-- Morning Brief -->
          <div class="brief">
            <h3 class="brief__heading">The Morning Brief</h3>
            <ul class="brief__list">
              @for (item of briefItems; track item.time) {
                <li class="brief__item">
                  <span class="brief__time">{{ item.time }}</span>
                  <h4 class="brief__title">{{ item.title }}</h4>
                </li>
              }
            </ul>
          </div>

          <!-- Opinion -->
          <div class="opinion">
            <h3 class="opinion__heading">Opinion</h3>
            <div class="opinion__items">
              @for (op of opinions; track op.author) {
                <div class="opinion__item">
                  <p class="opinion__quote">&ldquo;{{ op.quote }}&rdquo;</p>
                  <span class="label-sm opinion__author">— {{ op.author }}</span>
                </div>
                @if (!$last) {
                  <div class="opinion__divider"></div>
                }
              }
            </div>
          </div>
        </aside>
      </section>

      <!-- ─── LATEST DISPATCHES ────────────────────────────────── -->
      <section class="container section-gap">
        <div class="section-header">
          <h2 class="headline-xl">Latest Dispatches</h2>
          <a routerLink="/search" class="btn-link">View All Archives →</a>
        </div>
        <div class="articles-grid">
          @for (article of latestArticles(); track article.slug) {
            <app-article-card [article]="article" [aspectRatio]="'1/1'" />
          }
          @if (latestArticles().length === 0) {
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="skeleton-card"></div>
            }
          }
        </div>
      </section>

      <!-- ─── CATEGORY FOCUS: TECH ──────────────────────────────── -->
      <section class="focus section-gap">
        <div class="container focus__grid">
          <div class="focus__intro">
            <h2 class="headline-xl focus__title">Tech<br />Insight.</h2>
            <p class="focus__desc">
              Deep dives into the systems and people defining the next decade of human interaction.
            </p>
            <a routerLink="/category/tech" class="btn btn-primary">Explore Category</a>
          </div>
          <div class="focus__articles">
            @for (article of techArticles(); track article.slug) {
              <div class="focus__card" [routerLink]="['/article', article.slug]">
                <div>
                  @if (article.category) {
                    <span class="tag-badge">{{ article.category.name }}</span>
                  }
                  <h3 class="focus__card-title">{{ article.title }}</h3>
                </div>
                <div class="focus__card-foot">
                  <span class="label-sm" style="color:var(--c-on-surface-variant)"
                    >{{ article.readTime }} min read</span
                  >
                  <span class="material-symbols-outlined" style="color:var(--c-primary)"
                    >arrow_forward</span
                  >
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      /* HERO */
      .hero {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 3rem;
        padding-top: 2.5rem;
        margin-bottom: 6rem;
      }
      .hero__lead {
        cursor: pointer;
      }
      .hero__lead--skeleton {
        background: var(--c-surface-container);
        height: 500px;
        animation: pulse 1.5s infinite;
      }
      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
      }

      .hero__image-wrap {
        position: relative;
        aspect-ratio: 16/9;
        overflow: hidden;
        margin-bottom: 1.5rem;
      }
      .hero__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: grayscale(1);
        transition: filter 0.7s ease;
      }
      .hero__lead:hover .hero__image {
        filter: grayscale(0);
      }
      .hero__badge {
        position: absolute;
        top: 0;
        left: 0;
        background: var(--c-primary);
        color: var(--c-on-primary);
        padding: 0.5rem 1rem;
        font-family: var(--font-headline);
        font-size: 0.625rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }
      .hero__text {
        max-width: 42rem;
      }
      .hero__category {
        display: block;
        color: var(--c-primary);
        margin-bottom: 1rem;
      }
      .hero__title {
        margin-top: 3rem;
        margin-bottom: 1.5rem;
      }
      .hero__label {
        display: block;
        font-family: var(--font-headline);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--c-primary);
        margin-bottom: 1rem;
      }

      .hero__main-title {
        font-family: var(--font-headline);
        font-size: clamp(3rem, 7vw, 4.5rem);
        font-weight: 900;
        letter-spacing: -0.03em;
        line-height: 0.9;
        color: var(--c-on-surface);
        margin-bottom: 1.5rem;
      }

      .hero__subtitle {
        font-family: var(--font-body);
        font-size: clamp(1.125rem, 2vw, 1.5rem);
        color: var(--c-on-surface-variant);
        line-height: 1.6;
        font-style: italic;
        max-width: 42rem;
      }
      .hero__deck {
        color: var(--c-on-surface-variant);
      }

      /* SIDEBAR */
      .hero__sidebar {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
      }
      .brief {
        border-left: 4px solid var(--c-primary);
        padding-left: 1.5rem;
      }
      .brief__heading {
        font-family: var(--font-headline);
        font-size: 0.875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 1.5rem;
      }
      .brief__list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .brief__time {
        display: block;
        font-family: var(--font-headline);
        font-size: 0.625rem;
        font-weight: 700;
        color: var(--c-primary);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-bottom: 0.25rem;
      }
      .brief__title {
        font-family: var(--font-headline);
        font-size: 1rem;
        font-weight: 600;
        line-height: 1.3;
      }

      .opinion {
        background: var(--c-surface-low);
        padding: 2rem;
      }
      .opinion__heading {
        font-family: var(--font-headline);
        font-size: 1.25rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: -0.02em;
        margin-bottom: 1.5rem;
      }
      .opinion__items {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .opinion__item {
      }
      .opinion__quote {
        font-family: var(--font-body);
        font-style: italic;
        font-size: 1.125rem;
        margin-bottom: 0.5rem;
      }
      .opinion__author {
        color: var(--c-on-surface-variant);
      }
      .opinion__divider {
        height: 1px;
        background: rgba(228, 190, 186, 0.3);
      }

      /* ARTICLES GRID */
      .articles-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
      }
      .skeleton-card {
        background: var(--c-surface-container);
        aspect-ratio: 1;
        animation: pulse 1.5s infinite;
      }

      /* FOCUS */
      .focus {
        background: var(--c-surface-low);
        padding: 3rem 0;
      }
      .focus__grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 3rem;
        align-items: start;
      }
      .focus__title {
        font-size: 3.5rem;
        margin-bottom: 1.5rem;
      }
      .focus__desc {
        font-family: var(--font-body);
        font-size: 1.125rem;
        color: var(--c-on-surface-variant);
        margin-bottom: 2rem;
      }
      .focus__articles {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      .focus__card {
        background: var(--c-surface-lowest);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        transition: box-shadow 0.2s;
        min-height: 180px;
      }
      .focus__card:hover {
        box-shadow: var(--shadow-float);
      }
      .focus__card-title {
        font-family: var(--font-headline);
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1.3;
        margin-top: 0.75rem;
      }
      .focus__card-foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1.5rem;
      }

      /* FILTERS / VIEW TOGGLE */
      .filters {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
        margin-top: 3.5rem;
        border-top: 1px solid rgba(var(--c-outline-variant-rgb, 128 128 128) / 0.2);
        border-bottom: 1px solid rgba(var(--c-outline-variant-rgb, 128 128 128) / 0.2);
      }
      .filters__tabs {
        display: flex;
        align-items: center;
        gap: 2rem;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .filters__tabs::-webkit-scrollbar {
        display: none;
      }
      .filters__tab {
        background: none;
        border: none;
        cursor: pointer;
        font-family: var(--font-headline);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--c-on-surface-variant);
        white-space: nowrap;
        padding: 0;
        transition: color 0.2s;
      }
      .filters__tab:hover {
        color: var(--c-on-surface);
      }
      .filters__tab--active {
        color: var(--c-primary);
      }
      .filters__view {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-shrink: 0;
        margin-left: 2rem;
      }
      .filters__view-label {
        font-family: var(--font-headline);
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--c-on-surface-variant);
      }
      .filters__view-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        font-size: 1.25rem;
        color: var(--c-on-surface-variant);
        display: flex;
        align-items: center;
        transition: color 0.2s;
      }
      .filters__view-btn--active {
        color: var(--c-primary);
      }
      .filters__view-btn:hover {
        color: var(--c-on-surface);
      }

      /* MISC */
      .btn-link {
        font-family: var(--font-headline);
        font-size: 0.625rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--c-primary);
        text-decoration: none;
        border-bottom: 2px solid var(--c-primary);
        padding-bottom: 0.25rem;
      }

      @media (max-width: 1024px) {
        .filters {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        .filters__view {
          margin-left: 0;
        }
        .hero {
          grid-template-columns: 1fr;
        }
        .hero__sidebar {
          flex-direction: row;
          flex-wrap: wrap;
        }
        .brief,
        .opinion {
          flex: 1;
          min-width: 240px;
        }
        .articles-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .focus__grid {
          grid-template-columns: 1fr;
        }
        .focus__title {
          font-size: 2.5rem;
        }
      }
      @media (max-width: 640px) {
        .articles-grid {
          grid-template-columns: 1fr;
        }
        .focus__articles {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private seo = inject(SeoService);

  featuredArticle = signal<Article | null>(null);
  latestArticles = signal<Article[]>([]);
  techArticles = signal<Article[]>([]);

  briefItems = [
    { time: '08:30 AM', title: 'European Markets open flat ahead of ECB interest rate decision.' },
    { time: '07:15 AM', title: 'New Quantum computing breakthrough in Zurich laboratory.' },
    {
      time: '06:00 AM',
      title: 'Sports: Global tournament qualifying rounds reach dramatic conclusion.',
    },
  ];

  opinions = [
    {
      quote: 'The death of the suburb was greatly exaggerated, but its rebirth is unrecognizable.',
      author: 'Elena Vance',
    },
    {
      quote:
        'Why the minimalist aesthetic is actually a high-stakes power move in modern office politics.',
      author: 'Julian Thorne',
    },
  ];

  ngOnInit() {
    this.seo.updateMeta({
      title: 'Architectural Precision in Journalism',
      description:
        'The Chronicler — premium editorial journalism covering world affairs, technology, business, and culture.',
    });

    this.api.getArticles({ featured: true, limit: 1 }).subscribe((res) => {
      if (res.data.length) this.featuredArticle.set(res.data[0]);
    });

    this.api.getArticles({ limit: 4 }).subscribe((res) => {
      this.latestArticles.set(res.data);
    });

    this.api.getArticles({ category: 'tech', limit: 4 }).subscribe((res) => {
      this.techArticles.set(res.data);
    });
  }
}
