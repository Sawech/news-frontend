import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { Article } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ArticleCardComponent],
  template: `
    <main class="container search-page">
      <!-- Search header -->
      <div class="search-header">
        <h1 class="search-title display-lg">Search</h1>
        <div class="search-field-wrap">
          <input
            class="search-field"
            type="text"
            placeholder="Search articles, topics, authors…"
            [(ngModel)]="query"
            (ngModelChange)="onQueryChange($event)"
            autocomplete="off"
          />
          <span class="material-symbols-outlined search-icon">search</span>
        </div>
        @if (query) {
          <p class="search-summary label-md">
            @if (loading()) { Searching… }
            @else { {{ total() }} result{{ total() !== 1 ? 's' : '' }} for &ldquo;{{ query }}&rdquo; }
          </p>
        }
      </div>

      <!-- Results -->
      @if (results().length) {
        <div class="search-results">
          @for (article of results(); track article.slug) {
            <div class="search-result" [routerLink]="['/article', article.slug]">
              @if (article.imageUrl) {
                <div class="search-result__thumb">
                  <img [src]="article.imageUrl" [alt]="article.title" />
                </div>
              }
              <div class="search-result__body">
                <span class="label-sm search-result__cat">{{ article.category.name }}</span>
                <h2 class="search-result__title">{{ article.title }}</h2>
                <p class="search-result__excerpt">{{ article.excerpt }}</p>
                <span class="label-sm search-result__meta">{{ article.readTime }} min · {{ article.publishedAt | date:'MMM d, yyyy' }}</span>
              </div>
            </div>
          }
        </div>
      } @else if (query && !loading()) {
        <div class="search-empty">
          <span class="material-symbols-outlined search-empty__icon">search_off</span>
          <h2 class="headline-md">No results for &ldquo;{{ query }}&rdquo;</h2>
          <p class="search-empty__hint">Try a different term or browse by category.</p>
          <div class="search-empty__cats">
            @for (cat of quickCategories; track cat) {
              <a [routerLink]="['/category', cat.toLowerCase()]" class="tag-chip">{{ cat }}</a>
            }
          </div>
        </div>
      } @else if (!query) {
        <div class="search-prompt">
          <p class="title-lg" style="color:var(--c-on-surface-variant)">Start typing to search the archive.</p>
        </div>
      }
    </main>
  `,
  styles: [`
    .search-page { padding: 3rem 0 6rem; }
    .search-header { border-bottom: 1px solid rgba(228,190,186,0.3); padding-bottom: 2rem; margin-bottom: 3rem; }
    .search-title { margin-bottom: 1.5rem; }
    .search-field-wrap { position: relative; max-width: 48rem; }
    .search-field {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 2px solid var(--c-primary);
      padding: 1rem 3rem 1rem 0;
      font-family: var(--font-headline);
      font-size: 1.25rem;
      color: var(--c-on-surface);
      outline: none;
      border-radius: 0;
    }
    .search-field::placeholder { color: var(--c-on-surface-variant); opacity: 0.5; }
    .search-icon {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--c-primary);
    }
    .search-summary { color: var(--c-on-surface-variant); margin-top: 1rem; }

    /* RESULTS */
    .search-results { display: flex; flex-direction: column; gap: 0; }
    .search-result {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 1.5rem;
      padding: 1.5rem 0;
      cursor: pointer;
      border-bottom: 1px solid rgba(228,190,186,0.15);
      transition: background 0.15s;
    }
    .search-result:hover { background: var(--c-surface-low); padding-left: 0.5rem; }
    .search-result__thumb {
      aspect-ratio: 1;
      overflow: hidden;
    }
    .search-result__thumb img {
      width: 100%; height: 100%;
      object-fit: cover;
      filter: grayscale(1);
      transition: filter 0.3s;
    }
    .search-result:hover .search-result__thumb img { filter: grayscale(0); }
    .search-result__body { display: flex; flex-direction: column; gap: 0.5rem; }
    .search-result__cat { color: var(--c-primary); }
    .search-result__title {
      font-family: var(--font-headline);
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.3;
    }
    .search-result__excerpt {
      font-family: var(--font-body);
      color: var(--c-on-surface-variant);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .search-result__meta { color: var(--c-on-surface-variant); margin-top: auto; }

    /* EMPTY */
    .search-empty {
      padding: 5rem 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1rem;
    }
    .search-empty__icon { font-size: 4rem; color: var(--c-outline-variant); }
    .search-empty__hint { color: var(--c-on-surface-variant); }
    .search-empty__cats { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin-top: 0.5rem; }
    .search-prompt { padding: 4rem 0; }

    @media (max-width: 480px) {
      .search-result { grid-template-columns: 80px 1fr; }
    }
  `],
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private seo = inject(SeoService);

  query = '';
  results = signal<Article[]>([]);
  total = signal(0);
  loading = signal(false);

  private querySubject = new Subject<string>();

  quickCategories = ['World', 'Tech', 'Business', 'Politics', 'Culture'];

  ngOnInit() {
    this.seo.updateMeta({ title: 'Search' });

    // Debounced search
    this.querySubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(q => {
      if (q.trim().length < 2) {
        this.results.set([]);
        this.total.set(0);
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.api.search(q).subscribe({
        next: res => {
          this.results.set(res.data);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });

    // Handle ?q= from URL
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q') ?? '';
      this.query = q;
      if (q) this.querySubject.next(q);
    });
  }

  onQueryChange(value: string) {
    this.querySubject.next(value);
  }
}
