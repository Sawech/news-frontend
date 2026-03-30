import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminCategory } from '../../../core/models/admin.model';

interface AdminCategoryWithCount extends AdminCategory {
  _count?: { articles: number };
}

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mgmt-page">
      <header class="mgmt-header">
        <div>
          <h1 class="mgmt-title">Categories</h1>
          <p class="mgmt-sub">{{ categories().length }} total</p>
        </div>
        <button class="new-btn" id="open-category-modal-btn" (click)="openModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          New Category
        </button>
      </header>

      @if (loading()) {
        <div class="state-msg"><div class="spinner"></div><span>Loading…</span></div>
      } @else if (error()) {
        <div class="state-msg error">{{ error() }}</div>
      } @else if (categories().length === 0) {
        <div class="state-msg">No categories yet. Create your first category.</div>
      } @else {
        <div class="cat-table-wrap">
          <table class="cat-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Articles</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (cat of categories(); track cat.id) {
                <tr class="cat-row" [id]="'cat-' + cat.id">
                  <td class="col-name">{{ cat.name }}</td>
                  <td class="col-slug"><span class="slug-text">/{{ cat.slug }}</span></td>
                  <td class="col-desc">{{ cat.description || '—' }}</td>
                  <td class="col-count">
                    <span class="count-badge">{{ cat._count?.articles ?? 0 }}</span>
                  </td>
                  <td class="col-actions">
                    <button
                      class="delete-btn"
                      [id]="'delete-cat-' + cat.id"
                      [disabled]="(cat._count?.articles ?? 0) > 0"
                      [title]="(cat._count?.articles ?? 0) > 0 ? 'Cannot delete: has articles' : 'Delete category'"
                      (click)="confirmDelete(cat)"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Create Modal -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <h3 class="modal-title">New Category</h3>
          @if (modalError()) {
            <div class="modal-error">{{ modalError() }}</div>
          }
          <div class="field-group">
            <label class="field-label">Name <span class="req">*</span></label>
            <input
              type="text"
              class="field-input"
              [(ngModel)]="form.name"
              (ngModelChange)="onNameChange($event)"
              placeholder="World Affairs"
              id="cat-name-input"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Slug <span class="req">*</span></label>
            <input
              type="text"
              class="field-input mono"
              [(ngModel)]="form.slug"
              placeholder="world-affairs"
              id="cat-slug-input"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Description</label>
            <textarea
              class="field-input"
              [(ngModel)]="form.description"
              placeholder="Brief description of this category…"
              rows="3"
              id="cat-desc-input"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button class="modal-cancel" (click)="closeModal()">Cancel</button>
            <button class="modal-confirm" id="save-category-btn" [disabled]="saving()" (click)="saveCategory()">
              @if (saving()) { Saving… } @else { Create Category }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirm Modal -->
    @if (deleteTarget()) {
      <div class="modal-backdrop" (click)="cancelDelete()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <h3 class="modal-title">Delete Category?</h3>
          <p class="modal-body">
            "<strong>{{ deleteTarget()!.name }}</strong>" will be permanently removed.
          </p>
          <div class="modal-actions">
            <button class="modal-cancel" (click)="cancelDelete()">Cancel</button>
            <button class="modal-confirm danger" id="confirm-delete-cat-btn" [disabled]="deleting()" (click)="executeDelete()">
              @if (deleting()) { Deleting… } @else { Yes, Delete }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .mgmt-page { padding: 2.5rem 2rem; max-width: 1100px; margin: 0 auto; }

    .mgmt-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 2rem;
    }

    .mgmt-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f5f0e8;
      font-family: 'Playfair Display', 'Georgia', serif;
      letter-spacing: -0.03em;
      margin: 0;
    }

    .mgmt-sub { margin: 0.25rem 0 0; font-size: 0.8rem; color: #555; }

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
      border: none;
      cursor: pointer;
      letter-spacing: 0.02em;
      transition: background 0.2s, transform 0.1s;
    }

    .new-btn:hover { background: #d4b87a; transform: translateY(-1px); }

    .state-msg {
      display: flex; flex-direction: column; align-items: center;
      gap: 1rem; padding: 4rem 2rem; color: #555; font-size: 0.9rem;
    }

    .state-msg.error { color: #f87171; }

    .spinner {
      width: 32px; height: 32px; border: 2px solid #222;
      border-top-color: #c8a96e; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Table ── */
    .cat-table-wrap {
      overflow-x: auto;
      border: 1px solid #1e1e1e;
      border-radius: 12px;
    }

    .cat-table {
      width: 100%;
      border-collapse: collapse;
    }

    .cat-table th {
      background: #111;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #555;
      border-bottom: 1px solid #1e1e1e;
    }

    .cat-row { border-bottom: 1px solid #1a1a1a; transition: background 0.15s; }
    .cat-row:last-child { border-bottom: none; }
    .cat-row:hover { background: #111; }

    .cat-row td { padding: 1rem; vertical-align: middle; }

    .col-name { font-size: 0.875rem; font-weight: 600; color: #e0dbd0; }

    .col-slug .slug-text {
      font-size: 0.72rem;
      color: #444;
      font-family: monospace;
    }

    .col-desc { font-size: 0.8rem; color: #666; max-width: 300px; }

    .count-badge {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 100px;
      padding: 0.2rem 0.75rem;
      font-size: 0.75rem;
      color: #666;
    }

    .col-actions { text-align: right; }

    .delete-btn {
      background: transparent;
      border: none;
      color: #333;
      cursor: pointer;
      padding: 0.35rem;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }

    .delete-btn:hover:not(:disabled) {
      color: #f87171;
      background: rgba(220, 38, 38, 0.08);
    }

    .delete-btn:disabled { opacity: 0.25; cursor: not-allowed; }

    /* ── Form Fields ── */
    .field-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }

    .field-label {
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #666;
    }

    .req { color: #c8a96e; margin-left: 2px; }

    .field-input {
      background: #161616;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 0.7rem 0.9rem;
      color: #e0dbd0;
      font-size: 0.875rem;
      width: 100%;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
      resize: vertical;
      font-family: inherit;
    }

    .field-input:focus { border-color: #c8a96e; }
    .mono { font-family: monospace; font-size: 0.82rem; }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.75);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 1rem;
    }

    .modal-card {
      background: #111; border: 1px solid #2a2a2a; border-radius: 14px;
      padding: 2rem; max-width: 440px; width: 100%;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7);
    }

    .modal-title { font-size: 1.1rem; font-weight: 700; color: #f5f0e8; margin: 0 0 1.25rem; }
    .modal-body { font-size: 0.875rem; color: #888; margin: 0 0 1.5rem; }
    .modal-body strong { color: #ccc; }

    .modal-error {
      background: rgba(220, 38, 38, 0.12); border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 8px; color: #f87171; padding: 0.65rem 0.9rem;
      font-size: 0.82rem; margin-bottom: 1rem;
    }

    .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }

    .modal-cancel {
      background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 8px;
      color: #888; padding: 0.6rem 1.25rem; font-size: 0.85rem; cursor: pointer; transition: all 0.15s;
    }

    .modal-cancel:hover { color: #ccc; }

    .modal-confirm {
      background: #c8a96e; border: none; border-radius: 8px; color: #0a0a0a;
      padding: 0.6rem 1.25rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: background 0.15s;
    }

    .modal-confirm:hover:not(:disabled) { background: #d4b87a; }
    .modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
    .modal-confirm.danger { background: rgba(220, 38, 38, 0.85); color: #fff; }
    .modal-confirm.danger:hover:not(:disabled) { background: #dc2626; }
  `],
})
export class AdminCategoriesComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  categories = signal<AdminCategoryWithCount[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  saving = signal(false);
  modalError = signal('');
  deleteTarget = signal<AdminCategoryWithCount | null>(null);
  deleting = signal(false);

  form = { name: '', slug: '', description: '' };

  ngOnInit() { this.loadCategories(); }

  loadCategories() {
    this.loading.set(true);
    this.api.getAdminCategories().subscribe({
      next: (r) => { this.categories.set(r.data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load categories.'); this.loading.set(false); },
    });
  }

  openModal() {
    this.form = { name: '', slug: '', description: '' };
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  onNameChange(name: string) {
    this.form.slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100);
  }

  saveCategory() {
    this.modalError.set('');
    if (!this.form.name.trim()) { this.modalError.set('Name is required.'); return; }
    if (!this.form.slug.trim()) { this.modalError.set('Slug is required.'); return; }

    this.saving.set(true);
    this.api.createCategory({
      name: this.form.name,
      slug: this.form.slug,
      description: this.form.description || undefined,
    }).subscribe({
      next: (r) => {
        this.categories.update((list) => [...list, r.data]);
        this.saving.set(false);
        this.closeModal();
      },
      error: (err) => {
        this.modalError.set(err?.error?.error ?? 'Failed to create category.');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(cat: AdminCategoryWithCount) { this.deleteTarget.set(cat); }
  cancelDelete() { this.deleteTarget.set(null); }

  executeDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.api.deleteCategory(target.id).subscribe({
      next: () => {
        this.categories.update((list) => list.filter((c) => c.id !== target.id));
        this.deleting.set(false);
        this.deleteTarget.set(null);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Failed to delete category.');
        this.deleting.set(false);
        this.deleteTarget.set(null);
      },
    });
  }
}
