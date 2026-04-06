import { Component, OnInit, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';
import { LanguageService } from '../core/services/language.service';
import { Article, Category, Opinion } from '../core/models/article.model';
import { ArticleCardComponent } from '../shared/article-card/article-card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ArticleCardComponent, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private lang = inject(LanguageService);

  featuredArticle = signal<Article | null>(null);
  latestArticles = signal<Article[]>([]);
  focusArticles = signal<Article[]>([]);
  opinions = signal<Opinion[]>([]);
  loading = signal(false);
  activeFilter = signal<string>('all');
  viewMode = signal<'grid' | 'list'>('grid');
  briefItems = signal<Article[]>([]);
  focusCategories = signal<Category[]>([]);

  filterTabs = [
    { key: 'FILTERS.LATEST', value: 'all' },
    { key: 'FILTERS.FEATURED', value: 'featured' },
    { key: 'FILTERS.TRENDING', value: 'trending' },
    { key: 'FILTERS.PAST_WEEK', value: 'week' },
    { key: 'FILTERS.PAST_MONTH', value: 'month' },
  ];

  orderedFilterTabs = computed(() =>
    this.lang.activeLang() === 'ar' ? [...this.filterTabs].reverse() : this.filterTabs,
  );

  constructor() {
    effect(() => this.loadData());
  }

  readonly focusCategory = computed(() => {
    const cats = this.focusCategories();
    if (!cats.length) return null;
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    return cats[dayIndex % cats.length];
  });

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  loadArticles(value: string) {
    this.activeFilter.set(value);
    this.loading.set(true);
    const params: Record<string, unknown> = { limit: 8 };
    if (value === 'featured') params['featured'] = true;
    if (value === 'trending') params['trending'] = true;
    if (value === 'week') params['week'] = true;
    if (value === 'month') params['month'] = true;
    params['locale'] = this.lang.activeLang();

    this.api.getArticles(params as Parameters<ApiService['getArticles']>[0]).subscribe((res) => {
      this.latestArticles.set(res.data);
      this.loading.set(false);
    });
  }

  loadData() {
    this.activeFilter.set('all');
    const locale = this.lang.activeLang();

    this.api.getArticles({ featured: true, limit: 1, locale }).subscribe((res) => {
      if (res.data.length) this.featuredArticle.set(res.data[0]);
      else this.featuredArticle.set(null);
    });

    this.api.getArticles({ limit: 4, locale }).subscribe((res) => {
      this.latestArticles.set(res.data);
    });

    this.api.getArticles({ trending: true, limit: 3, locale }).subscribe((res) => {
      this.briefItems.set(res.data);
    });

    this.api.getOpinions(locale).subscribe((res) => {
      this.opinions.set(res.data);
    });

    this.api.getCategories({ locale }).subscribe((res) => {
      this.focusCategories.set(res.data);
      const focus = this.focusCategory();
      if (focus) {
        this.api.getArticles({ category: focus.slug, limit: 8, locale }).subscribe((r) => {
          this.focusArticles.set(r.data);
        });
      } else {
        this.focusArticles.set([]);
      }
    });
    console.log('hihi');
  }

  ngOnInit() {
    this.seo.updateMeta({
      title: 'Architectural Precision in Journalism',
      description:
        'The Chronicler — premium editorial journalism covering world affairs, technology, business, and culture.',
    });
  }
}
