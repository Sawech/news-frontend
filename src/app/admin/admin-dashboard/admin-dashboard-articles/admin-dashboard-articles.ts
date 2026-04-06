import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminArticleRow } from '../../../core/models/admin.model';

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT';

@Component({
  selector: 'app-admin-dashboard-articles',
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-dashboard-articles.html',
  styleUrl: './admin-dashboard-articles.css',
})
export class AdminDashboardArticlesComponent implements OnInit, OnDestroy {
  private readonly api = inject(AdminApiService);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly filterTabs: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Draft', value: 'DRAFT' },
  ];

  articles = signal<AdminArticleRow[]>([]);
  loading = signal(true);
  error = signal('');
  page = signal(1);
  totalPages = signal(1);
  totalArticles = signal(0);
  deleteTarget = signal<AdminArticleRow | null>(null);
  deleting = signal(false);
  activeFilter = signal<StatusFilter>('ALL');
  togglingId = signal<string | null>(null);

  searchQuery = '';

  ngOnInit() {
    this.loadArticles();
  }

  ngOnDestroy() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  loadArticles() {
    this.loading.set(true);
    this.error.set('');
    const status = this.activeFilter() === 'ALL' ? undefined : this.activeFilter();
    const search = this.searchQuery.trim() || undefined;
    this.api.getArticles(this.page(), 20, status, search).subscribe({
      next: (res) => {
        this.articles.set(res.data);
        this.totalArticles.set(res.meta.total);
        this.totalPages.set(Math.ceil(res.meta.total / res.meta.limit));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Failed to load articles.');
        this.loading.set(false);
      },
    });
  }

  setFilter(filter: StatusFilter) {
    this.activeFilter.set(filter);
    this.page.set(1);
    this.loadArticles();
  }

  onSearchChange(value: string) {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      this.loadArticles();
    }, 350);
  }

  clearSearch() {
    this.searchQuery = '';
    this.page.set(1);
    this.loadArticles();
  }

  changePage(p: number) {
    this.page.set(p);
    this.loadArticles();
  }

  toggleStatus(article: AdminArticleRow) {
    const newStatus = article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    this.togglingId.set(article.id);
    this.api.updateArticle(article.id, { status: newStatus as 'DRAFT' | 'PUBLISHED' }).subscribe({
      next: () => {
        this.articles.update((list) =>
          list.map((a) => (a.id === article.id ? { ...a, status: newStatus } : a)),
        );
        this.togglingId.set(null);
      },
      error: () => {
        this.togglingId.set(null);
      },
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  confirmDelete(article: AdminArticleRow) {
    this.deleteTarget.set(article);
  }

  cancelDelete() {
    this.deleteTarget.set(null);
  }

  executeDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.api.deleteArticle(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.loadArticles();
      },
      error: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
      },
    });
  }
}
