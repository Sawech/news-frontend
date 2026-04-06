import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';
import { Article, Category } from '../core/models/article.model';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../core/services/language.service';

@Component({
  selector: 'app-category',
  imports: [RouterLink, CommonModule, TranslatePipe],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class CategoryComponent implements OnInit {
  route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private lang = inject(LanguageService);

  articles = signal<Article[]>([]);
  category = signal<Category | null>(null);
  categoryName = signal('');
  totalArticles = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  activeFilter = signal<string>('all');
  loading = signal(false);

  featuredArticle = computed(() => this.articles()[0] ?? null);
  dispatchArticles = computed(() => this.articles().slice(1, 4));
  latestArticles = computed(() => this.articles().slice(4));

  filterTabs = [
    { key: 'FILTERS.LATEST', value: 'all' },
    { key: 'FILTERS.FEATURED', value: 'featured' },
    { key: 'FILTERS.TRENDING', value: 'trending' },
    { key: 'FILTERS.PAST_WEEK', value: 'week' },
    { key: 'FILTERS.PAST_MONTH', value: 'month' },
  ];

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.categoryName.set(slug.charAt(0).toUpperCase() + slug.slice(1));
      this.activeFilter.set('all');
      this.currentPage.set(1);
      this.loadArticles(slug);

      this.api.getCategories().subscribe((res) => {
        const cat = res.data.find((c) => c.slug === slug) ?? null;
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
      limit: 10,
    };
    if (this.activeFilter() === 'featured') params['featured'] = true;
    if (this.activeFilter() === 'trending') params['trending'] = true;
    if (this.activeFilter() === 'week') params['week'] = true;
    if (this.activeFilter() === 'month') params['month'] = true;
    params['locale'] = this.lang.activeLang();

    this.api.getArticles(params as Parameters<ApiService['getArticles']>[0]).subscribe((res) => {
      this.articles.set(res.data);
      this.totalArticles.set(res.meta.total);
      this.totalPages.set(res.meta.totalPages);
      this.loading.set(false);
    });
  }
}
