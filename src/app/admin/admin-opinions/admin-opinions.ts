import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { AdminOpinion } from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-opinions',
  imports: [FormsModule],
  templateUrl: './admin-opinions.html',
  styleUrl: './admin-opinions.css',
})
export class AdminOpinionsComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  opinionId = signal<number | null>(null);
  opinions = signal<AdminOpinion[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  saving = signal(false);
  modalError = signal('');
  deleting = signal(false);

  form = { pubName: '', content: '', subject: '', linkUrl: '' };

  ngOnInit() {
    this.loadOpinions();
  }

  loadOpinions() {
    this.loading.set(true);
    this.api.getOpinions().subscribe({
      next: (r) => {
        this.opinions.set(r.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load opinions.');
        this.loading.set(false);
      },
    });
  }

  openModal(opinion: AdminOpinion) {
    this.opinionId.set(opinion.id);
    this.form = {
      pubName: opinion.pubName || '',
      content: opinion.content || '',
      subject: opinion.subject || '',
      linkUrl: opinion.linkUrl || '',
    };
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.opinionId.set(null);
    this.showModal.set(false);
  }

  saveOpinion() {
    this.modalError.set('');
    if (!this.opinionId()) {
      return;
    }
    if (!this.form.pubName.trim()) {
      this.modalError.set('Publisher Name is required.');
      return;
    }
    if (!this.form.content.trim()) {
      this.modalError.set('Content is required.');
      return;
    }

    this.saving.set(true);
    this.api
      .updateOpinion(this.opinionId()!, {
        pubName: this.form.pubName || undefined,
        content: this.form.content || undefined,
        subject: this.form.subject || undefined,
        linkUrl: this.form.linkUrl || undefined,
      })
      .subscribe({
        next: (r) => {
          this.opinions.update((list) => list.map((o) => (o.id === this.opinionId() ? r.data : o)));
          this.saving.set(false);
          this.opinionId.set(null);
          this.form = { pubName: '', content: '', subject: '', linkUrl: '' };
          this.closeModal();
        },
        error: (err) => {
          this.modalError.set(err?.error?.error ?? 'Failed to change opinion.');
          this.opinionId.set(null);
          this.form = { pubName: '', content: '', subject: '', linkUrl: '' };
          this.saving.set(false);
        },
      });
  }

  ClearOpinion() {
    if (!this.opinionId()) {
      return;
    }
    this.deleting.set(true);
    this.api
      .updateOpinion(this.opinionId()!, { pubName: '', content: '', subject: '', linkUrl: '' })
      .subscribe({
        next: () => {
          this.opinions.update((list) =>
            list.map((a) =>
              a.id == this.opinionId()
                ? { id: a.id, pubName: '', content: '', subject: '', linkUrl: '' }
                : a,
            ),
          );
          this.deleting.set(false);
          this.form = { pubName: '', content: '', subject: '', linkUrl: '' };
          this.opinionId.set(null);
        },
        error: (err) => {
          this.error.set(err?.error?.error ?? 'Failed to clear opinion.');
          this.deleting.set(false);
          this.form = { pubName: '', content: '', subject: '', linkUrl: '' };
          this.opinionId.set(null);
        },
      });
  }
}
