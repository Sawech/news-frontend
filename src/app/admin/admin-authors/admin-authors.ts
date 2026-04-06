import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { AdminAuthor } from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-authors',
  imports: [FormsModule],
  templateUrl: './admin-authors.html',
  styleUrl: './admin-authors.css',
})
export class AdminAuthorsComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  authors = signal<AdminAuthor[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  saving = signal(false);
  modalError = signal('');
  deleteTarget = signal<AdminAuthor | null>(null);
  deleting = signal(false);

  form = { name: '', bio: '', avatarUrl: '' };

  ngOnInit() {
    this.loadAuthors();
  }

  loadAuthors() {
    this.loading.set(true);
    this.api.getAuthors().subscribe({
      next: (r) => {
        this.authors.set(r.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load authors.');
        this.loading.set(false);
      },
    });
  }

  openModal() {
    this.form = { name: '', bio: '', avatarUrl: '' };
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveAuthor() {
    this.modalError.set('');
    if (!this.form.name.trim()) {
      this.modalError.set('Name is required.');
      return;
    }

    this.saving.set(true);
    this.api
      .createAuthor({
        name: this.form.name,
        bio: this.form.bio || undefined,
        avatarUrl: this.form.avatarUrl || undefined,
      })
      .subscribe({
        next: (r) => {
          this.authors.update((list) => [...list, r.data]);
          this.saving.set(false);
          this.closeModal();
        },
        error: (err) => {
          this.modalError.set(err?.error?.error ?? 'Failed to create author.');
          this.saving.set(false);
        },
      });
  }

  confirmDelete(author: AdminAuthor) {
    this.deleteTarget.set(author);
  }
  cancelDelete() {
    this.deleteTarget.set(null);
  }

  executeDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.api.deleteAuthor(target.id).subscribe({
      next: () => {
        this.authors.update((list) => list.filter((a) => a.id !== target.id));
        this.deleting.set(false);
        this.deleteTarget.set(null);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Failed to delete author.');
        this.deleting.set(false);
        this.deleteTarget.set(null);
      },
    });
  }
}
