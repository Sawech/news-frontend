import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { AdminTicker } from '../../core/models/admin.model';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-admin-tickers',
  imports: [FormsModule],
  templateUrl: './admin-tickers.html',
  styleUrl: './admin-tickers.css',
})
export class AdminTickersComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly lang = inject(LanguageService);

  tickers = signal<AdminTicker[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  modalError = signal('');
  saving = signal(false);
  deleteTarget = signal<AdminTicker | null>(null);
  deleting = signal(false);

  form = { content: ' ', locale: 'en' };

  ngOnInit() {
    this.loadTickers();
  }

  loadTickers() {
    this.loading.set(true);
    const locale = String(this.lang.activeLang());
    this.api.getAdminTickers(locale).subscribe({
      next: (res) => {
        this.tickers.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load tickers');
        this.loading.set(false);
      },
    });
  }

  openModal() {
    this.form = { content: '', locale: 'en' };
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveTicker() {
    this.modalError.set('');
    if (!this.form.content.trim) {
      this.modalError.set('Content is required');
      return;
    }
    this.saving.set(true);
    this.api.createTicker({ content: this.form.content, locale: this.form.locale }).subscribe({
      next: (res) => {
        this.tickers.update((ticker) => [...ticker, res.data]);
        this.saving.set(false);
        this.closeModal();
      },
      error: (err) => {
        this.modalError.set(err?.error?.error ?? 'Failed to create ticker. ');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(ticker: AdminTicker) {
    this.deleteTarget.set(ticker);
  }
  cancelDelete() {
    this.deleteTarget.set(null);
  }

  executeDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.api.deleteTicker(target.id).subscribe({
      next: () => {
        this.tickers.update((tickers) => tickers.filter((ticker) => ticker.id !== target.id));
        this.deleting.set(false);
        this.deleteTarget.set(null);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Failed to delete ticker.');
        this.deleting.set(false);
        this.deleteTarget.set(null);
      },
    });
  }
}
