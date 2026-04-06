import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminApiService } from '../../core/services/admin-api.service';
import {
  AdminAuthor,
  AdminCategory,
  AdminTag,
  AdminArticleDetail,
  AdminArticlePayload,
} from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-article-editor',
  imports: [FormsModule, RouterLink, UpperCasePipe],
  templateUrl: './admin-article-editor.html',
  styleUrl: './admin-article-editor.css',
})
export class AdminArticleEditorComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      const locale = this.form.locale ?? 'en';
      this.api.getAuthors().subscribe({ next: (r) => this.authors.set(r.data), error: () => {} });
      this.api
        .getCategories({ locale })
        .subscribe({
          next: (r) => this.categories.set(r.data as AdminCategory[]),
          error: () => {},
        });
      this.api.getTags(locale).subscribe({
        next: (r) => {
          this.allTags.set(r.data);
          this.tagsLoaded.set(true);
        },
        error: () => {
          this.tagsLoaded.set(true);
        },
      });
    });
  }

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
    locale: 'en',
  };

  authors = signal<AdminAuthor[]>([]);
  categories = signal<AdminCategory[]>([]);
  allTags = signal<AdminTag[]>([]);
  tagsLoaded = signal(false);
  showAddTag = signal(false);
  newTagName = signal('');
  addTagError = signal('');

  loadingArticle = signal(false);
  saving = signal(false);
  saveError = signal('');
  saveSuccess = signal('');
  promptCopied = signal(false);

  readonly isRTL = computed(() => this.form.locale === 'ar');

  readonly localeOptions = [
    { value: 'en', label: '🇬🇧 English' },
    { value: 'fr', label: '🇫🇷 Français' },
    { value: 'ar', label: '🇸🇦 العربية' },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.articleId.set(id);
      this.loadArticle(id);
    }
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
          locale: a.locale ?? 'en',
        };
        this.loadingArticle.set(false);
      },
      error: () => {
        this.saveError.set('Failed to load article.');
        this.loadingArticle.set(false);
      },
    });
  }

  openAddTag() {
    this.showAddTag.set(true);
    this.newTagName.set('');
    this.addTagError.set('');
  }

  closeAddTag() {
    this.showAddTag.set(false);
    this.newTagName.set('');
    this.addTagError.set('');
  }

  createTag() {
    const tagName = this.newTagName().trim();
    this.api.createTag({ name: tagName, locale: this.form.locale }).subscribe({
      next: (res) => {
        this.allTags.update((tags) => [...tags, res.data]);
        this.closeAddTag();
      },
      error: () => {
        this.addTagError.set('Failed to create tag.');
      },
    });
  }

  deleteTag(tagId: string) {
    this.api.deleteTag(tagId).subscribe({
      next: () => {
        this.allTags.update((tags) => tags.filter((t) => t.id !== tagId));
      },
      error: () => {
        this.addTagError.set('Failed to delete tag.');
      },
    });
  }

  onTitleChange(title: string) {
    if (!this.isEdit()) {
      this.form.slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 100) +
        '-' +
        this.form.locale;
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
