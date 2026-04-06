import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Article } from '../models/article.model';

interface SeoData {
  title: string;
  description?: string;
  imageUrl?: string;
  type?: 'website' | 'article';
  canonicalUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  private readonly siteName = 'The Chronicler';
  private readonly siteUrl = 'http://localhost:4200';

  updateMeta(data: SeoData): void {
    const fullTitle = `${data.title} | ${this.siteName}`;
    this.title.setTitle(fullTitle);

    this.meta.updateTag({ name: 'description', content: data.description ?? '' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: data.description ?? '' });
    this.meta.updateTag({ property: 'og:type', content: data.type ?? 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });

    if (data.imageUrl) {
      this.meta.updateTag({ property: 'og:image', content: data.imageUrl });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.meta.updateTag({ name: 'twitter:image', content: data.imageUrl });
    }

    if (data.canonicalUrl) {
      this.setCanonical(data.canonicalUrl);
    }
  }

  setArticleMeta(article: Article): void {
    this.updateMeta({
      title: article.title,
      description: article.excerpt,
      imageUrl: article.imageUrl,
      type: 'article',
      canonicalUrl: `${this.siteUrl}/article/${article.slug}`,
    });

    this.injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.excerpt,
      image: article.imageUrl,
      author: {
        '@type': 'Person',
        name: article.author.name,
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
      },
      // 'datePublished': article.publishedAt,
      mainEntityOfPage: `${this.siteUrl}/article/${article.slug}`,
    });
  }

  private setCanonical(url: string): void {
    let link: HTMLLinkElement = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private injectJsonLd(schema: object): void {
    const existing = this.doc.querySelector('script[type="application/ld+json"]');
    if (existing) existing.remove();

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }
}
