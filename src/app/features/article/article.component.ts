import { Component, OnInit, OnDestroy, signal, inject, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { Article } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { NewsletterBlockComponent } from '../../shared/components/newsletter/newsletter-block.component';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterLink, ArticleCardComponent, NewsletterBlockComponent],
  template: `
    <!-- Reading progress bar -->
    <div class="reading-progress" [style.width]="readProgress() + '%'"></div>

    <main>
      @if (article(); as a) {
        <article class="container article-page">
          <!-- Header -->
          <header class="article-header">
            <span class="tag-badge article-cat">{{ a.category.name }}</span>
            <h1 class="article-title">{{ a.title }}</h1>
            <p class="article-deck">{{ a.excerpt }}</p>

            <!-- Author row -->
            <div class="author-row">
              <div class="author-info">
                @if (a.author.avatarUrl) {
                  <img class="author-avatar" [src]="a.author.avatarUrl" [alt]="a.author.name" />
                }
                <div>
                  <p class="label-md">By {{ a.author.name }}</p>
                  <p class="author-date">
                    {{ a.category.name }} · {{ a.publishedAt | date: 'MMM d, yyyy' }}
                  </p>
                </div>
              </div>
              <div class="author-actions">
                @if (a.readTime) {
                  <div class="read-time">
                    <span class="label-sm">Read Time</span>
                    <span class="label-md">{{ a.readTime }} MINS</span>
                  </div>
                }
                <button class="icon-action">
                  <span class="material-symbols-outlined">share</span>
                </button>
                <!-- <button class="icon-action">
                  <span class="material-symbols-outlined">bookmark</span>
                </button> -->
              </div>
            </div>
          </header>

          <!-- Feature image -->
          @if (a.imageUrl) {
            <figure class="article-figure">
              <img class="article-hero-img" [src]="a.imageUrl" [alt]="a.title" />
              <figcaption class="article-caption">{{ a.title }} · The Chronicler</figcaption>
            </figure>
          }

          <!-- Body + sticky share sidebar -->
          <div class="article-layout">
            <!-- Sticky social sidebar -->
            <aside class="article-sidebar">
              <button class="sidebar-btn">
                <span class="material-symbols-outlined">share</span>
              </button>
              <button class="sidebar-btn">
                <span class="material-symbols-outlined">bookmark</span>
              </button>
              <button class="sidebar-btn">
                <span class="material-symbols-outlined">alternate_email</span>
              </button>
            </aside>

            <!-- Article body (rendered as HTML) -->
            <div class="article-body" [innerHTML]="safeBody()"></div>
          </div>

          <!-- Tags -->
          @if (a.tags?.length) {
            <div class="tags-row">
              @for (t of a.tags; track t.tag.slug) {
                <a [routerLink]="['/search']" [queryParams]="{ q: t.tag.name }" class="tag-chip">{{
                  t.tag.name
                }}</a>
              }
            </div>
          }
        </article>

        <!-- Related articles -->
        @if (related().length) {
          <section class="container related">
            <div class="section-header">
              <h2 class="headline-md">Read More in {{ article()!.category.name }}</h2>
              <a [routerLink]="['/category', article()!.category.slug]" class="btn-text"
                >View All →</a
              >
            </div>
            <div class="related__grid">
              @for (r of related(); track r.slug) {
                <app-article-card [article]="r" [aspectRatio]="'4/3'" [showExcerpt]="false" />
              }
            </div>
          </section>
        }
      } @else {
        <div class="loading-state container">
          <div class="loading-box"></div>
        </div>
      }
    </main>
  `,
  styles: [
    `
      .article-page {
        padding: 3rem 0;
      }
      .article-header {
        max-width: 52rem;
        margin: 0 auto 2.5rem;
      }
      .article-cat {
        margin-bottom: 1.5rem;
      }
      .article-title {
        font-family: var(--font-body);
        font-size: clamp(2.5rem, 5vw, 4.5rem);
        font-weight: 700;
        line-height: 1.1;
        letter-spacing: -0.02em;
        margin-bottom: 1.5rem;
      }
      .article-deck {
        font-family: var(--font-body);
        font-size: 1.375rem;
        color: var(--c-on-surface-variant);
        font-style: italic;
        line-height: 1.6;
      }
      .author-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 0;
        border-top: 1px solid rgba(228, 190, 186, 0.2);
        border-bottom: 1px solid rgba(228, 190, 186, 0.2);
        margin-top: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .author-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .author-avatar {
        width: 3rem;
        height: 3rem;
        object-fit: cover;
        filter: grayscale(1);
        border-radius: 0;
      }
      .author-date {
        font-family: var(--font-headline);
        font-size: 0.625rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--c-on-surface-variant);
        margin-top: 0.25rem;
      }
      .author-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .read-time {
        text-align: right;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .icon-action {
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--c-surface-container);
        transition:
          background 0.2s,
          color 0.2s;
      }
      .icon-action:hover {
        background: var(--c-primary);
        color: var(--c-on-primary);
      }

      .article-figure {
        margin: 3rem 0;
        max-width: 52rem;
        margin-left: auto;
        margin-right: auto;
      }
      .article-hero-img {
        width: 100%;
        aspect-ratio: 16/9;
        object-fit: cover;
      }
      .article-caption {
        margin-top: 1rem;
        font-family: var(--font-headline);
        font-size: 0.625rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--c-on-surface-variant);
        border-left: 2px solid var(--c-primary);
        padding-left: 1rem;
      }

      .article-layout {
        display: grid;
        grid-template-columns: 1fr 80px;
        gap: 3rem;
        max-width: 52rem;
        margin: 0 auto;
        position: relative;
      }
      .article-sidebar {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 6rem;
        height: fit-content;
        order: 2;
      }
      .sidebar-btn {
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--c-on-surface-variant);
        transition: color 0.2s;
      }
      .sidebar-btn:hover {
        color: var(--c-primary);
      }
      /* body placed first via order */
      .article-body {
        order: 1;
      }

      .tags-row {
        max-width: 52rem;
        margin: 4rem auto 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      /* RELATED */
      .related {
        margin-top: 6rem;
      }
      .related__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
      }
      .btn-text {
        font-family: var(--font-headline);
        font-size: 0.625rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--c-primary);
        text-decoration: none;
      }

      /* NEWSLETTER INSET */
      .newsletter-inset {
        background: var(--c-surface-low);
        padding: 4rem 0;
        margin-top: 6rem;
      }
      .newsletter-inset__layout {
        display: flex;
        gap: 3rem;
        align-items: center;
        flex-wrap: wrap;
      }
      .newsletter-inset__sub {
        font-family: var(--font-body);
        font-size: 1rem;
        color: var(--c-on-surface-variant);
        margin-top: 0.75rem;
        max-width: 24rem;
      }

      /* LOADING */
      .loading-state {
        padding: 4rem 0;
      }
      .loading-box {
        height: 400px;
        background: var(--c-surface-container);
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

      @media (max-width: 768px) {
        .article-layout {
          grid-template-columns: 1fr;
        }
        .article-sidebar {
          display: none;
        }
        .related__grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ArticleComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private sanitizer = inject(DomSanitizer);

  article = signal<Article | null>(null);
  related = signal<Article[]>([]);
  readProgress = signal(0);
  safeBody = signal<SafeHtml>('');

  @HostListener('window:scroll')
  onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.readProgress.set(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug')!;
      this.api.getArticleBySlug(slug).subscribe((res) => {
        this.article.set(res.data);
        this.related.set(res.related);
        this.safeBody.set(this.sanitizer.bypassSecurityTrustHtml(res.data.body ?? ''));
        this.seo.setArticleMeta(res.data);
      });
    });
  }

  ngOnDestroy() {}
}
