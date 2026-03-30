import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { Article, Category } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterLink, ArticleCardComponent],
  template: `
    <main class="container">
      <!-- Category Hero -->
      <header class="cat-hero">
        <span class="label-sm cat-hero__label">Section</span>
        <h1 class="cat-hero__name">{{ categoryName() }}</h1>
        @if (category()?.description) {
          <p class="cat-hero__desc">{{ category()?.description }}</p>
        }
        <div class="cat-hero__stats label-sm">
          {{ totalArticles() }} articles
        </div>
      </header>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        @for (tab of filterTabs; track tab.value) {
          <button
            class="filter-tab"
            [class.filter-tab--active]="activeFilter() === tab.value"
            (click)="setFilter(tab.value)"
          >{{ tab.label }}</button>
        }
      </div>

      <!-- Articles grid -->
      <div class="cat-grid">
        @for (article of articles(); track article.slug) {
          <app-article-card [article]="article" [aspectRatio]="'4/3'" />
        }
        @if (articles().length === 0 && !loading()) {
          <div class="cat-empty">
            <p class="label-md">No articles found in this category yet.</p>
          </div>
        }
        @if (loading()) {
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="skeleton" style="aspect-ratio:4/3"></div>
          }
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="pagination">
          <button class="btn btn-primary" [disabled]="currentPage() <= 1" (click)="loadPage(currentPage() - 1)">← Prev</button>
          <span class="label-md pagination__info">{{ currentPage() }} of {{ totalPages() }}</span>
          <button class="btn btn-primary" [disabled]="currentPage() >= totalPages()" (click)="loadPage(currentPage() + 1)">Next →</button>
        </div>
      }
    </main>
  `,
  styles: [`
    .cat-hero {
      padding: 3rem 0 2.5rem;
      border-bottom: 1px solid rgba(228,190,186,0.3);
      margin-bottom: 2.5rem;
    }
    .cat-hero__label {
      color: var(--c-primary);
      display: block;
      margin-bottom: 0.75rem;
    }
    .cat-hero__name {
      font-family: var(--font-headline);
      font-size: 4rem;
      font-weight: 900;
      letter-spacing: -0.04em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .cat-hero__desc {
      font-family: var(--font-body);
      font-size: 1.125rem;
      color: var(--c-on-surface-variant);
      max-width: 40rem;
      margin-bottom: 1rem;
    }
    .cat-hero__stats { color: var(--c-on-surface-variant); }

    .filter-tabs {
      display: flex;
      gap: 0;
      margin-bottom: 3rem;
      border-bottom: 1px solid rgba(228,190,186,0.3);
    }
    .filter-tab {
      font-family: var(--font-headline);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.75rem 1.25rem;
      color: var(--c-on-surface-variant);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.2s, border-color 0.2s;
      cursor: pointer;
    }
    .filter-tab:hover { color: var(--c-on-surface); }
    .filter-tab--active {
      color: var(--c-on-surface);
      border-bottom-color: var(--c-primary);
    }

    .cat-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2.5rem;
      margin-bottom: 4rem;
    }
    .cat-empty {
      grid-column: 1 / -1;
      padding: 4rem 0;
      color: var(--c-on-surface-variant);
    }
    .skeleton {
      background: var(--c-surface-container);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      padding: 2rem 0;
    }
    .pagination__info { color: var(--c-on-surface-variant); }

    @media (max-width: 768px) {
      .cat-grid { grid-template-columns: repeat(2, 1fr); }
      .cat-hero__name { font-size: 2.5rem; }
    }
    @media (max-width: 480px) {
      .cat-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class CategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private seo = inject(SeoService);

  articles = signal<Article[]>([]);
  category = signal<Category | null>(null);
  categoryName = signal('');
  totalArticles = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  activeFilter = signal<string>('all');
  loading = signal(false);

  filterTabs = [
    { label: 'All', value: 'all' },
    { label: 'Featured', value: 'featured' },
    { label: 'Trending', value: 'trending' },
  ];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') ?? '';
      this.categoryName.set(slug.charAt(0).toUpperCase() + slug.slice(1));
      this.activeFilter.set('all');
      this.currentPage.set(1);
      this.loadArticles(slug);

      this.api.getCategories().subscribe(res => {
        const cat = res.data.find(c => c.slug === slug) ?? null;
        this.category.set(cat);
        if (cat) {
          this.categoryName.set(cat.name);
          this.seo.updateMeta({ title: cat.name, description: cat.description });
        }
      });
    });
  }

  setFilter(value: string) {
    this.activeFilter.set(value);
    this.currentPage.set(1);
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.loadArticles(slug);
  }

  loadPage(page: number) {
    this.currentPage.set(page);
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.loadArticles(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadArticles(categorySlug: string) {
    this.loading.set(true);
    const params: Record<string, unknown> = {
      category: categorySlug,
      page: this.currentPage(),
      limit: 9,
    };
    if (this.activeFilter() === 'featured') params['featured'] = true;
    if (this.activeFilter() === 'trending') params['trending'] = true;

    this.api.getArticles(params as Parameters<ApiService['getArticles']>[0]).subscribe(res => {
      this.articles.set(res.data);
      this.totalArticles.set(res.meta.total);
      this.totalPages.set(res.meta.totalPages);
      this.loading.set(false);
    });
  }
}
