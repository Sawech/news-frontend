import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { AdminTicker } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-tickers',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="ticker-page">
      <header class="ticker-header">
        <div>
          <h1 class="ticker-title">Ticker</h1>
          <p class="ticker-sub">{{ tickers().length }} total</p>
        </div>
        <button class="new-btn" id="open-ticker-modal-btn" (click)="openModal()">
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
          New Ticker
        </button>
      </header>
      @if (loading()) {
        <div class="state-msg">
          <div class="spinner"></div>
          <span>Loading…</span>
        </div>
      } @else if (error()) {
        <div class="state-msg error">{{ error() }}</div>
      } @else if (tickers().length === 0) {
        <div class="state-msg">No tickers yet. Create your first ticker.</div>
      } @else {
        <div class="ticker-table-wrap">
          <div class="ticker-table">
            <thead>
              <tr>
                <th>id</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              @for (ticker of tickers(); track ticker.id; let i = $index) {
                <tr class="ticker-row" [id]="'ticker-' + ticker.id">
                  <td class="col-id">{{ i + 1 }}</td>
                  <td class="col-content">{{ ticker.content }}</td>
                  <td class="col-actions">
                    <button
                      class="delete-btn"
                      [id]="'delete-cat-' + ticker.id"
                      title="Delete Ticker"
                      (click)="confirmDelete(ticker)"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </div>
        </div>
      }
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h3 class="modal-title">New Ticker</h3>
            @if (modalError()) {
              <div class="modal-error">{{ modalError() }}</div>
            }
            <div class="field-group">
              <label class="field-label">Content</label>
              <textarea
                class="field-input"
                [(ngModel)]="form.content"
                placeholder="Ticker content"
                rows="5"
                id="ticker-content-input"
              ></textarea>
            </div>
            <div class="modal-actions">
              <button class="modal-cancel" (click)="closeModal()">Cancel</button>
              <button
                class="modal-confirm"
                id="save-ticker-btn"
                [disabled]="saving()"
                (click)="saveTicker()"
              >
                @if (saving()) {
                  Saving...
                } @else {
                  Create Ticker
                }
              </button>
            </div>
          </div>
        </div>
      }

      @if (deleteTarget()) {
        <div class="modal-backdrop" (click)="cancelDelete()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h3 class="modal-title">Delete Ticker?</h3>
            <div class="modal-actions">
              <button class="modal-cancel" (click)="cancelDelete()">Cancel</button>
              <button
                class="modal-confirm danger"
                id="confirm-delete-ticker-btn"
                (click)="executeDelete()"
              >
                @if (deleting()) {
                  Deleting...
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
      .ticker-page {
        margin: 0 auto;
        padding: 2.5rem 2rem;
        max-width: 1100px;
      }

      .ticker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
      }

      .ticker-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #f5f0e8;
        font-family: 'Playfair Display', 'Georgia', serif;
        letter-spacing: -0.03em;
        margin: 0;
      }

      .ticker-sub {
        maring: 0.25rem 0 0;
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
        border: none;
        cursor: pointer;
        letter-spacing: 0.02em;
        transition:
          background 0.2s,
          transform 0.1s;
      }
      .new-btn:hover {
        background: #d4b87a;
        transform: translateY(-1px);
      }

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

      .ticker-table-wrap {
        overflow-x: auto;
        border: 1px solid #1e1e1e;
        border-radius: 12px;
      }

      .ticker-table {
        width: 100%;
        border-collapse: collapse;
      }

      .ticker-table th {
        background: #111;
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #555;
        border-bottom: 1px solid #1e1e1e;
        white-space: nowrap;
      }

      .ticker-table th:nth-child(2),
      .ticker-table td.col-content {
        width: 100%;
      }

      .ticker-row {
        border-bottom: 1px solid #1a1a1a;
        transition: background 0.15s;
      }
      .ticker-row:last-child {
        border-bottom: none;
      }
      .ticker-row:hover {
        background: #111;
      }

      .ticker-row td {
        padding: 1rem;
        vertical-align: middle;
      }

      .ticker-content {
        font-size: 0.8rem;
        font-weight: 400;
        color: #d4cbcb;
      }

      .col-id {
        font-size: 0.875rem;
        font-weight: 600;
        color: #e0dbd0;
      }

      .col-content {
        font-size: 0.875rem;
        font-weight: 600;
        color: #e0dbd0;
      }

      .col-actions {
        display: flex;
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
        background: transparent;
        border: none;
        color: #333;
        cursor: pointer;
        padding: 0.35rem;
        border-radius: 4px;
        transition:
          color 0.15s,
          background 0.15s;
      }

      .delete-btn:hover {
        color: #f87171;
        background: rgba(220, 38, 38, 0.08);
      }

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-bottom: 1rem;
      }

      .field-label {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #666;
      }

      .req {
        color: #c8a96e;
        margin-left: 2px;
      }

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

      .field-input:focus {
        border-color: #c8a96e;
      }

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
        max-width: 440px;
        width: 100%;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7);
      }

      .modal-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #f5f0e8;
        margin: 0 0 1.25rem;
      }

      .modal-error {
        background: rgba(220, 38, 38, 0.12);
        border: 1px solid rgba(220, 38, 38, 0.3);
        border-radius: 8px;
        color: #f87171;
        padding: 0.65rem 0.9rem;
        font-size: 0.82rem;
        margin-bottom: 1rem;
      }

      .modal-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
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
        background: #c8a96e;
        border: none;
        border-radius: 8px;
        color: #0a0a0a;
        padding: 0.6rem 1.25rem;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s;
      }

      .modal-confirm:hover {
        background: #d4b87a;
      }
      .modal-confirm.danger {
        background: rgba(220, 38, 38, 0.85);
        color: #fff;
      }
      .modal-confirm.danger {
        background: #dc2626;
      }
    `,
  ],
})
export class AdminTickersComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  tickers = signal<AdminTicker[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  modalError = signal('');
  saving = signal(false);
  deleteTarget = signal<AdminTicker | null>(null);
  deleting = signal(false);

  form = { content: ' ' };

  ngOnInit() {
    this.loadTickers();
  }

  loadTickers() {
    this.loading.set(true);
    this.api.getAdminTickers().subscribe({
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
    this.form = { content: '' };
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
    this.api.createTicker({ content: this.form.content }).subscribe({
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
