import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminArticleRow } from '../../../core/models/admin.model';

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT';

@Component({
  selector: 'app-admin-dashboard-articles',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="dashboard-articles">
      <header class="dash-header">
        <div>
          <h1 class="dash-title">Articles</h1>
          <p class="dash-sub">
            {{ totalArticles() }} total · Page {{ page() }} of {{ totalPages() }}
          </p>
        </div>
        <a routerLink="/admin/articles/new" class="new-btn" id="new-article-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Article
        </a>
      </header>

      <!-- Toolbar: tabs + search -->
      <div class="toolbar">
        <div class="filter-tabs" role="tablist">
          @for (tab of filterTabs; track tab.value) {
            <button
              role="tab"
              class="tab-btn"
              [class.tab-active]="activeFilter() === tab.value"
              [id]="'filter-' + tab.value.toLowerCase()"
              (click)="setFilter(tab.value)"
            >
              {{ tab.label }}
            </button>
          }
        </div>
        <div class="search-wrap">
          <svg
            class="search-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            class="search-input"
            id="article-search-input"
            placeholder="Search articles…"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
          />
          @if (searchQuery.length > 0) {
            <button class="search-clear" (click)="clearSearch()" title="Clear search">×</button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="state-msg">
          <div class="spinner"></div>
          <span>Loading articles…</span>
        </div>
      } @else if (error()) {
        <div class="state-msg error">{{ error() }}</div>
      } @else if (articles().length === 0) {
        <div class="state-msg">
          @if (searchQuery || activeFilter() !== 'ALL') {
            No articles match your filters.
          } @else {
            No articles yet. <a routerLink="/admin/articles/new">Create one →</a>
          }
        </div>
      } @else {
        <div class="table-wrap">
          <table class="article-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (article of articles(); track article.id) {
                <tr class="article-row" [class.is-draft]="article.status === 'DRAFT'">
                  <td class="col-title">
                    <span class="article-title">{{ article.title }}</span>
                    <span class="article-slug">/{{ article.slug }}</span>
                  </td>
                  <td class="col-cat">
                    <span class="cat-badge">{{ article.category.name }}</span>
                  </td>
                  <td class="col-author">{{ article.author.name }}</td>
                  <td class="col-status">
                    <button
                      class="status-badge"
                      [class.status-published]="article.status === 'PUBLISHED'"
                      [class.status-draft]="article.status === 'DRAFT'"
                      [class.toggling]="togglingId() === article.id"
                      [id]="'toggle-status-' + article.id"
                      [disabled]="togglingId() === article.id"
                      (click)="toggleStatus(article)"
                      [title]="
                        article.status === 'PUBLISHED' ? 'Click to unpublish' : 'Click to publish'
                      "
                    >
                      @if (togglingId() === article.id) {
                        <span class="toggle-spinner"></span>
                      } @else {
                        {{ article.status }}
                      }
                    </button>
                  </td>
                  <td class="col-date">{{ formatDate(article.createdAt) }}</td>
                  <td class="col-actions">
                    <a
                      [routerLink]="['/admin/articles', article.id, 'edit']"
                      class="action-btn edit-btn"
                      [id]="'edit-' + article.id"
                      >Edit</a
                    >
                    <button
                      class="action-btn delete-btn"
                      [id]="'delete-' + article.id"
                      (click)="confirmDelete(article)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="page() <= 1" (click)="changePage(page() - 1)">
              ← Prev
            </button>
            <span class="page-info">{{ page() }} / {{ totalPages() }}</span>
            <button
              class="page-btn"
              [disabled]="page() >= totalPages()"
              (click)="changePage(page() + 1)"
            >
              Next →
            </button>
          </div>
        }
      }

      <!-- Delete confirm modal -->
      @if (deleteTarget()) {
        <div class="modal-backdrop" (click)="cancelDelete()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h3 class="modal-title">Delete Article?</h3>
            <p class="modal-body">
              "<strong>{{ deleteTarget()!.title }}</strong
              >" will be permanently removed.
            </p>
            <div class="modal-actions">
              <button class="modal-cancel" (click)="cancelDelete()">Cancel</button>
              <button class="modal-confirm" id="confirm-delete-btn" (click)="executeDelete()">
                @if (deleting()) {
                  Deleting…
                } @else {
                  Yes, Delete
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dashboard-articles {
        padding: 2.5rem 2rem;
        max-width: 1100px;
        margin: 0 auto;
      }

      .dash-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 1.5rem;
      }

      .dash-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #f5f0e8;
        font-family: 'Playfair Display', 'Georgia', serif;
        letter-spacing: -0.03em;
        margin: 0;
      }

      .dash-sub {
        margin: 0.25rem 0 0;
        font-size: 0.8rem;
        color: #555;
      }

      .new-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: #c8a96e;
        color: #0a0a0a;
        padding: 0.65rem 1.25rem;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 700;
        text-decoration: none;
        letter-spacing: 0.02em;
        transition:
          background 0.2s,
          transform 0.1s;
      }

      .new-btn:hover {
        background: #d4b87a;
        transform: translateY(-1px);
      }

      /* ── Toolbar ── */
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
      }

      .filter-tabs {
        display: flex;
        gap: 0.25rem;
        background: #111;
        border: 1px solid #1e1e1e;
        border-radius: 10px;
        padding: 0.25rem;
      }

      .tab-btn {
        padding: 0.4rem 1rem;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: #555;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition:
          background 0.15s,
          color 0.15s;
        letter-spacing: 0.02em;
      }

      .tab-btn:hover {
        color: #aaa;
      }

      .tab-btn.tab-active {
        background: rgba(200, 169, 110, 0.15);
        color: #c8a96e;
      }

      /* ── Search ── */
      .search-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 0.8rem;
        color: #444;
        pointer-events: none;
      }

      .search-input {
        background: #111;
        border: 1px solid #1e1e1e;
        border-radius: 9px;
        padding: 0.55rem 2.5rem 0.55rem 2.2rem;
        color: #e0dbd0;
        font-size: 0.85rem;
        width: 220px;
        outline: none;
        transition:
          border-color 0.2s,
          width 0.2s;
        font-family: inherit;
      }

      .search-input:focus {
        border-color: #333;
        width: 280px;
      }

      .search-input::placeholder {
        color: #3a3a3a;
      }

      .search-clear {
        position: absolute;
        right: 0.6rem;
        background: transparent;
        border: none;
        color: #444;
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
        padding: 0.1rem 0.2rem;
        border-radius: 4px;
        transition: color 0.15s;
      }

      .search-clear:hover {
        color: #f87171;
      }

      /* ── States ── */
      .state-msg {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 4rem 2rem;
        color: #555;
        font-size: 0.9rem;
      }

      .state-msg.error {
        color: #f87171;
      }

      .state-msg a {
        color: #c8a96e;
        text-decoration: none;
      }

      .spinner {
        width: 32px;
        height: 32px;
        border: 2px solid #222;
        border-top-color: #c8a96e;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ── Table ── */
      .table-wrap {
        overflow-x: auto;
        border: 1px solid #1e1e1e;
        border-radius: 12px;
      }

      .article-table {
        width: 100%;
        border-collapse: collapse;
      }

      .article-table th {
        background: #111;
        padding: 0.75rem 1rem;
        text-align: center;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #555;
        border-bottom: 1px solid #1e1e1e;
        white-space: nowrap;
      }

      .article-row {
        border-bottom: 1px solid #1a1a1a;
        transition: background 0.15s;
      }

      .article-row:last-child {
        border-bottom: none;
      }

      .article-row:hover {
        background: #111;
      }

      .article-row.is-draft {
        opacity: 0.75;
      }

      .article-row td {
        padding: 1rem;
        vertical-align: middle;
      }

      .col-title {
        max-width: 360px;
      }

      .article-title {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #e0dbd0;
        line-height: 1.35;
      }

      .article-slug {
        display: block;
        font-size: 0.7rem;
        color: #444;
        margin-top: 0.2rem;
        font-family: monospace;
      }

      .cat-badge {
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        border-radius: 4px;
        padding: 0.2rem 0.6rem;
        font-size: 0.72rem;
        color: #888;
        white-space: nowrap;
      }

      .col-author {
        font-size: 0.8rem;
        color: #777;
        white-space: nowrap;
      }

      /* ── Status toggle badge ── */
      .status-badge {
        padding: 0.2rem 0.65rem;
        border-radius: 100px;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        white-space: nowrap;
        border: none;
        cursor: pointer;
        transition:
          opacity 0.15s,
          transform 0.1s,
          filter 0.15s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 72px;
        min-height: 22px;
      }

      .status-badge:hover:not(:disabled) {
        opacity: 0.8;
        transform: scale(1.04);
      }

      .status-badge:disabled {
        cursor: not-allowed;
      }

      .status-published {
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
      }

      .status-draft {
        background: rgba(250, 204, 21, 0.12);
        color: #facc15;
      }

      .status-badge.toggling {
        opacity: 0.6;
      }

      .toggle-spinner {
        display: inline-block;
        width: 10px;
        height: 10px;
        border: 1.5px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }

      .col-date {
        font-size: 0.75rem;
        color: #555;
        white-space: nowrap;
      }

      .col-actions {
        gap: 0.5rem;
        white-space: nowrap;
      }

      .action-btn {
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        text-decoration: none;
        transition: background 0.15s;
      }

      .edit-btn {
        background: #1e1e1e;
        color: #aaa;
      }

      .edit-btn:hover {
        background: #2a2a2a;
        color: #f5f0e8;
      }

      .delete-btn {
        background: rgba(220, 38, 38, 0.1);
        color: #f87171;
      }

      .delete-btn:hover {
        background: rgba(220, 38, 38, 0.2);
      }

      /* ── Pagination ── */
      .pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .page-btn {
        background: #1a1a1a;
        border: 1px solid #2a2a2a;
        border-radius: 8px;
        color: #888;
        padding: 0.45rem 1rem;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.15s;
      }

      .page-btn:hover:not(:disabled) {
        background: #222;
        color: #f5f0e8;
      }

      .page-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      .page-info {
        font-size: 0.8rem;
        color: #555;
      }

      /* ── Modal ── */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
      }

      .modal-card {
        background: #111;
        border: 1px solid #2a2a2a;
        border-radius: 14px;
        padding: 2rem;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7);
      }

      .modal-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #f5f0e8;
        margin: 0 0 0.75rem;
      }

      .modal-body {
        font-size: 0.875rem;
        color: #888;
        margin: 0 0 1.5rem;
      }

      .modal-body strong {
        color: #ccc;
      }

      .modal-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
      }

      .modal-cancel {
        background: #1e1e1e;
        border: 1px solid #2a2a2a;
        border-radius: 8px;
        color: #888;
        padding: 0.6rem 1.25rem;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.15s;
      }

      .modal-cancel:hover {
        color: #ccc;
      }

      .modal-confirm {
        background: rgba(220, 38, 38, 0.85);
        border: none;
        border-radius: 8px;
        color: #fff;
        padding: 0.6rem 1.25rem;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s;
      }

      .modal-confirm:hover {
        background: #dc2626;
      }
    `,
  ],
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
