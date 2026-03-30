import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article } from '../../../core/models/article.model';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="article-card" [routerLink]="['/article', article.slug]">
      <div class="article-card__thumb" [style.aspect-ratio]="aspectRatio">
        @if (article.imageUrl) {
          <img [src]="article.imageUrl" [alt]="article.title" loading="lazy" />
        } @else {
          <div class="article-card__placeholder"></div>
        }
      </div>
      <span class="label-sm article-card__category" [style.color]="'var(--c-primary)'">
        {{ article.category.name }}
      </span>
      <h3 class="article-card__title">{{ article.title }}</h3>
      @if (showExcerpt) {
        <p class="article-card__excerpt body-lg">{{ article.excerpt }}</p>
      }
      @if (article.readTime) {
        <span class="article-card__meta">{{ article.readTime }} min read</span>
      }
    </article>
  `,
  styles: [`
    :host { display: block; }
    .article-card {
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }
    .article-card__placeholder {
      width: 100%;
      height: 100%;
      background: var(--c-surface-container);
    }
    .article-card__meta {
      font-family: var(--font-headline);
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--c-on-surface-variant);
      margin-top: auto;
      padding-top: 0.5rem;
    }
  `],
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: Article;
  @Input() aspectRatio = '1 / 1';
  @Input() showExcerpt = true;
}
