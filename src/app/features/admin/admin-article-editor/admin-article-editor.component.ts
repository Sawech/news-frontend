import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminApiService } from '../../../core/services/admin-api.service';
import {
  AdminAuthor,
  AdminCategory,
  AdminTag,
  AdminArticleDetail,
  AdminArticlePayload,
} from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-article-editor',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="editor">
      <header class="editor-header">
        <div class="editor-header-left">
          <a routerLink="/admin/dashboard" class="back-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </a>
          <h1 class="editor-title">{{ isEdit() ? 'Edit Article' : 'New Article' }}</h1>
        </div>
        <div class="editor-actions">
          <button class="save-draft-btn" [disabled]="saving()" (click)="save('DRAFT')">
            Save Draft
          </button>
          <button
            class="publish-btn"
            id="publish-btn"
            [disabled]="saving()"
            (click)="save('PUBLISHED')"
          >
            @if (saving()) {
              Saving…
            } @else {
              Publish
            }
          </button>
        </div>
      </header>

      @if (loadingArticle()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Loading article…</span>
        </div>
      } @else {
        @if (saveError()) {
          <div class="save-error" role="alert">{{ saveError() }}</div>
        }
        @if (saveSuccess()) {
          <div class="save-success" role="status">{{ saveSuccess() }}</div>
        }

        <div class="editor-body">
          <!-- Left column: main content -->
          <div class="editor-main">
            <div class="field-group">
              <label class="field-label">Title <span class="req">*</span></label>
              <input
                type="text"
                class="field-input title-input"
                [(ngModel)]="form.title"
                (ngModelChange)="onTitleChange($event)"
                placeholder="The Architecture of Silence…"
                id="field-title"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Slug <span class="req">*</span></label>
              <input
                type="text"
                class="field-input mono"
                [(ngModel)]="form.slug"
                placeholder="the-architecture-of-silence"
                id="field-slug"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Excerpt <span class="req">*</span></label>
              <textarea
                class="field-input"
                [(ngModel)]="form.excerpt"
                placeholder="A concise summary shown on the home page and article cards…"
                rows="3"
                id="field-excerpt"
              ></textarea>
            </div>

            <div class="field-group body-field">
              <label class="field-label">Body (HTML) <span class="req">*</span></label>
              <textarea
                class="field-input body-input"
                [(ngModel)]="form.body"
                placeholder="<p>Start writing here…</p>"
                rows="20"
                id="field-body"
              ></textarea>
            </div>
          </div>

          <!-- Right column: metadata -->
          <aside class="editor-sidebar">
            <div class="meta-section">
              <h3 class="meta-section-title">Status</h3>
              <div class="status-toggle">
                <button class="status-btn" [class.active]="form.status === 'DRAFT'">Draft</button>
                <button class="status-btn" [class.active]="form.status === 'PUBLISHED'">
                  Published
                </button>
              </div>
            </div>
            <div class="meta-section">
              <h3 class="meta-section-title">HTML Prompt</h3>
              <button class="copy-prompt-btn" (click)="copyPrompt()">
                {{ promptCopied() ? '✓ Copied!' : 'Copy Prompt' }}
              </button>
            </div>

            <div class="meta-section">
              <h3 class="meta-section-title">Flags</h3>
              <label class="check-label">
                <input type="checkbox" [(ngModel)]="form.featured" />
                <span>Featured</span>
              </label>
              <label class="check-label">
                <input type="checkbox" [(ngModel)]="form.trending" />
                <span>Trending</span>
              </label>
            </div>

            <div class="meta-section">
              <h3 class="meta-section-title">Read Time (min)</h3>
              <input
                type="number"
                class="field-input"
                [(ngModel)]="form.readTime"
                min="1"
                id="field-readtime"
              />
            </div>

            <div class="meta-section">
              <h3 class="meta-section-title">Category <span class="req">*</span></h3>
              @if (categories().length > 0) {
                <select class="field-input" [(ngModel)]="form.categoryId" id="field-category">
                  <option value="">— Select category —</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              } @else {
                <p class="meta-loading">Loading…</p>
              }
            </div>

            <div class="meta-section">
              <h3 class="meta-section-title">Author <span class="req">*</span></h3>
              @if (authors().length > 0) {
                <select class="field-input" [(ngModel)]="form.authorId" id="field-author">
                  <option value="">— Select author —</option>
                  @for (a of authors(); track a.id) {
                    <option [value]="a.id">{{ a.name }}</option>
                  }
                </select>
              } @else {
                <p class="meta-loading">Loading…</p>
              }
            </div>

            <div class="meta-section">
              <h3 class="meta-section-title">Tags</h3>
              @if (tagsLoaded()) {
                <div class="tags-list">
                  @for (tag of allTags(); track tag.id) {
                    <label class="tag-check">
                      <input
                        type="checkbox"
                        [checked]="isTagSelected(tag.id)"
                        (change)="toggleTag(tag.id)"
                      />
                      {{ tag.name }}
                    </label>
                  }
                </div>
              } @else {
                <p class="meta-loading">Loading…</p>
              }
            </div>

            <div class="meta-section">
              <h3 class="meta-section-title">Cover Image URL</h3>
              <input
                type="url"
                class="field-input"
                [(ngModel)]="form.imageUrl"
                placeholder="https://images.unsplash.com/…"
                id="field-image"
              />
              @if (form.imageUrl) {
                <img [src]="form.imageUrl" alt="Preview" class="image-preview" />
              }
            </div>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .editor {
        padding: 2rem;
        font-family: 'Inter', sans-serif;
        min-height: 100vh;
      }

      .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        gap: 1rem;
      }

      .editor-header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .back-link {
        display: flex;
        align-items: center;
        color: #555;
        text-decoration: none;
        transition: color 0.15s;
      }

      .back-link:hover {
        color: #aaa;
      }

      .editor-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #f5f0e8;
        font-family: 'Playfair Display', 'Georgia', serif;
        letter-spacing: -0.03em;
        margin: 0;
      }

      .editor-actions {
        display: flex;
        gap: 0.75rem;
      }

      .save-draft-btn,
      .publish-btn {
        padding: 0.6rem 1.25rem;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
        border: none;
      }

      .save-draft-btn {
        background: #1e1e1e;
        border: 1px solid #2a2a2a;
        color: #aaa;
      }

      .save-draft-btn:hover:not(:disabled) {
        background: #2a2a2a;
        color: #f5f0e8;
      }

      .publish-btn {
        background: #c8a96e;
        color: #0a0a0a;
      }

      .publish-btn:hover:not(:disabled) {
        background: #d4b87a;
      }

      .save-draft-btn:disabled,
      .publish-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .save-error {
        background: rgba(220, 38, 38, 0.12);
        border: 1px solid rgba(220, 38, 38, 0.35);
        border-radius: 8px;
        color: #f87171;
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
        margin-bottom: 1.5rem;
      }

      .save-success {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 8px;
        color: #4ade80;
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
        margin-bottom: 1.5rem;
      }

      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 4rem 2rem;
        color: #555;
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

      /* ── Layout ── */
      .editor-body {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 2rem;
        align-items: start;
      }

      /* ── Fields ── */
      .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-bottom: 1.25rem;
      }

      .field-label {
        font-size: 0.72rem;
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
        background: #111;
        border: 1px solid #1e1e1e;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        color: #e0dbd0;
        font-size: 0.9rem;
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

      .field-input option {
        background: #111;
        color: #e0dbd0;
      }

      .title-input {
        font-size: 1rem;
        font-family: 'Playfair Display', 'Georgia', serif;
      }

      .copy-prompt-btn {
        width: 100%;
        padding: 0.45rem;
        border-radius: 6px;
        border: 1px solid #2a2a2a;
        background: transparent;
        color: #888;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }

      .copy-prompt-btn:hover {
        background: rgba(200, 169, 110, 0.08);
        border-color: rgba(200, 169, 110, 0.4);
        color: #c8a96e;
      }

      .mono {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.82rem;
      }

      .body-input {
        font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
        font-size: 0.82rem;
        line-height: 1.7;
      }

      /* ── Sidebar ── */
      .editor-sidebar {
        position: sticky;
        top: 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .meta-section {
        background: #111;
        border: 1px solid #1e1e1e;
        border-radius: 10px;
        padding: 1rem;
      }

      .meta-section-title {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #555;
        margin: 0 0 0.75rem;
      }

      .meta-loading {
        font-size: 0.8rem;
        color: #555;
        margin: 0;
      }

      .status-toggle {
        display: flex;
        gap: 0.5rem;
      }

      .status-btn {
        flex: 1;
        padding: 0.45rem;
        border-radius: 6px;
        border: 1px solid #2a2a2a;
        background: transparent;
        color: #555;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: not-allowed;
        transition: all 0.15s;
      }

      .status-btn.active {
        background: rgba(200, 169, 110, 0.15);
        border-color: rgba(200, 169, 110, 0.4);
        color: #c8a96e;
      }

      .check-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.82rem;
        color: #888;
        cursor: pointer;
        margin-bottom: 0.4rem;
      }

      .check-label input[type='checkbox'] {
        accent-color: #c8a96e;
      }

      .tags-list {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .tag-check {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: #777;
        cursor: pointer;
      }

      .tag-check input[type='checkbox'] {
        accent-color: #c8a96e;
      }

      .image-preview {
        width: 100%;
        border-radius: 6px;
        margin-top: 0.75rem;
        object-fit: cover;
        max-height: 120px;
        border: 1px solid #1e1e1e;
      }

      @media (max-width: 900px) {
        .editor-body {
          grid-template-columns: 1fr;
        }

        .editor-sidebar {
          position: static;
        }
      }
    `,
  ],
})
export class AdminArticleEditorComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  articleId = signal<string | null>(null);
  isEdit = computed(() => !!this.articleId());

  form: AdminArticlePayload & { status: 'DRAFT' | 'PUBLISHED' } = {
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    imageUrl: '',
    authorId: '',
    categoryId: '',
    tagIds: [],
    featured: false,
    trending: false,
    readTime: 5,
    status: 'DRAFT',
  };

  authors = signal<AdminAuthor[]>([]);
  categories = signal<AdminCategory[]>([]);
  allTags = signal<AdminTag[]>([]);
  tagsLoaded = signal(false);

  loadingArticle = signal(false);
  saving = signal(false);
  saveError = signal('');
  saveSuccess = signal('');
  promptCopied = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.articleId.set(id);
      this.loadArticle(id);
    }

    this.api.getAuthors().subscribe({ next: (r) => this.authors.set(r.data), error: () => {} });
    this.api
      .getCategories()
      .subscribe({ next: (r) => this.categories.set(r.data as AdminCategory[]), error: () => {} });
    this.api.getTags().subscribe({
      next: (r) => {
        this.allTags.set(r.data);
        this.tagsLoaded.set(true);
      },
      error: () => {
        this.tagsLoaded.set(true);
      },
    });
  }

  loadArticle(id: string) {
    this.loadingArticle.set(true);
    this.api.getArticle(id).subscribe({
      next: (res) => {
        const a: AdminArticleDetail = res.data;
        this.form = {
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          body: a.body,
          imageUrl: a.imageUrl ?? '',
          authorId: a.authorId,
          categoryId: a.categoryId,
          tagIds: (a.tags ?? []).map((t: any) => t.tag?.id ?? t.tagId ?? '').filter(Boolean),
          featured: a.featured,
          trending: a.trending,
          readTime: a.readTime,
          status: a.status as 'DRAFT' | 'PUBLISHED',
        };
        this.loadingArticle.set(false);
      },
      error: () => {
        this.saveError.set('Failed to load article.');
        this.loadingArticle.set(false);
      },
    });
  }

  onTitleChange(title: string) {
    if (!this.isEdit()) {
      this.form.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100);
    }
  }

  isTagSelected(tagId: string): boolean {
    return (this.form.tagIds ?? []).includes(tagId);
  }

  toggleTag(tagId: string) {
    const current = this.form.tagIds ?? [];
    this.form.tagIds = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
  }

  copyPrompt() {
    const prompt = `You are a document-to-HTML converter.
Your task is to convert the provided document (PDF or Word content) into clean, semantic HTML.
STRICT RULES:
- Output ONLY valid HTML. No explanations.
- Preserve the original structure and meaning exactly.
- Use proper semantic tags:
  - <h1>, <h2>, <h3> for headings
  - <p> for paragraphs
  - <ul>, <ol>, <li> for lists
  - <blockquote> for quotes
  - <strong> / <em> for emphasis
- Do NOT wrap everything in <div> unless necessary.
- Do NOT add CSS, classes, or inline styles.
- Do NOT hallucinate or add content.
- Merge broken lines into proper paragraphs.
- Keep logical spacing between sections.
FORMATTING RULES:
- Headings must reflect hierarchy from the document.
- Quotes must be wrapped in <blockquote>.
- Remove page numbers, headers, footers.
- Convert special characters properly (e.g., quotes, symbols).
- Preserve numerical expressions like 10^16 exactly as written.
INPUT:
{{DOCUMENT_TEXT}}
OUTPUT:
Clean HTML only.`;

    navigator.clipboard.writeText(prompt).then(() => {
      this.promptCopied.set(true);
      setTimeout(() => this.promptCopied.set(false), 2000);
    });
  }

  save(status: 'DRAFT' | 'PUBLISHED') {
    this.saveError.set('');
    this.saveSuccess.set('');

    if (!this.form.title.trim()) {
      this.saveError.set('Title is required.');
      return;
    }
    if (!this.form.slug.trim()) {
      this.saveError.set('Slug is required.');
      return;
    }
    if (!this.form.excerpt.trim()) {
      this.saveError.set('Excerpt is required.');
      return;
    }
    if (!this.form.body.trim()) {
      this.saveError.set('Body is required.');
      return;
    }
    if (!this.form.categoryId) {
      this.saveError.set('Please select a category.');
      return;
    }
    if (!this.form.authorId) {
      this.saveError.set('Please select an author.');
      return;
    }

    this.saving.set(true);
    const payload = { ...this.form, status };

    const req$ = this.isEdit()
      ? this.api.updateArticle(this.articleId()!, payload)
      : this.api.createArticle(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(status === 'PUBLISHED' ? 'Article published!' : 'Draft saved.');
        if (!this.isEdit()) {
          setTimeout(() => this.router.navigate(['/admin/dashboard']), 1000);
        }
      },
      error: (err) => {
        this.saving.set(false);
        const msg =
          (err?.error?.error ?? err?.error?.details?.fieldErrors)
            ? JSON.stringify(err?.error?.details?.fieldErrors)
            : 'Failed to save article.';
        this.saveError.set(msg);
      },
    });
  }
}
