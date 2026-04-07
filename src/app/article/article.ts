import { Component, OnInit, OnDestroy, signal, inject, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';
import { Article } from '../core/models/article.model';
import { ArticleCardComponent } from '../shared/article-card/article-card';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, RouterLink, ArticleCardComponent],
  templateUrl: './article.html',
  styleUrl: './article.css',
})
export class ArticleComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private seo = inject(SeoService);
  private sanitizer = inject(DomSanitizer);

  article = signal<Article | null>(null);
  related = signal<Article[]>([]);
  readProgress = signal(0);
  safeBody = signal<SafeHtml>('');
  shareOpen = signal(false);
  shareCopied = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.readProgress.set(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.shareOpen.set(false);
  }

  onAvatarError(event: Event) {
    (event.target as HTMLImageElement).classList.add('error');
  }

  toggleShare(e: Event) {
    e.stopPropagation();
    this.shareOpen.update((v) => !v);
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.shareCopied.set(true);
      setTimeout(() => {
        this.shareCopied.set(false);
        this.shareOpen.set(false);
      }, 2000);
    });
  }

  shareUrl(platform: 'x' | 'facebook' | 'whatsapp') {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.article()?.title ?? '');
    const links = {
      x: `https://x.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
    };
    window.open(links[platform], '_blank', 'noopener,noreferrer');
    this.shareOpen.set(false);
  }

  authorColor(name: string): string {
    const colors = [
      '#e53935',
      '#d81b60',
      '#8e24aa',
      '#5e35b1',
      '#1e88e5',
      '#00897b',
      '#43a047',
      '#f4511e',
      '#6d4c41',
      '#546e7a',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug')!;
      this.api.getArticleBySlug(slug).subscribe((res) => {
        this.article.set(res.data);
        this.related.set(res.related);
        this.safeBody.set(this.sanitizer.bypassSecurityTrustHtml(res.data.body ?? ''));
        this.seo.setArticleMeta(res.data);
      });
    });
  }

  ngOnDestroy() {}
}
