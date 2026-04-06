import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { AdminCategory } from '../../core/models/admin.model';

interface AdminCategoryWithCount extends AdminCategory {
  _count?: { articles: number };
}

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css',
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

  form = { name: '', slug: '', description: '', locale: 'en' };

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.api.getAdminCategories().subscribe({
      next: (r) => {
        this.categories.set(r.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories.');
        this.loading.set(false);
      },
    });
  }

  openModal() {
    this.form = { name: '', slug: '', description: '', locale: 'en' };
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onNameChange(name: string) {
    this.form.slug = this.buildSlug(name, this.form.locale);
  }

  buildSlug(name: string, locale: string) {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100) +
      '-' +
      locale
    );
  }

  saveCategory() {
    this.modalError.set('');
    if (!this.form.name.trim()) {
      this.modalError.set('Name is required.');
      return;
    }
    if (!this.form.slug.trim()) {
      this.modalError.set('Slug is required.');
      return;
    }

    this.saving.set(true);
    this.api
      .createCategory({
        name: this.form.name,
        slug: this.form.slug,
        description: this.form.description || undefined,
        locale: this.form.locale,
      })
      .subscribe({
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

  confirmDelete(cat: AdminCategoryWithCount) {
    this.deleteTarget.set(cat);
  }
  cancelDelete() {
    this.deleteTarget.set(null);
  }

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
