import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article } from '../../core/models/article.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-article-card',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './article-card.html',
  styleUrl: './article-card.css',
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: Article;
  @Input() aspectRatio = '1 / 1';
  @Input() showExcerpt = true;
  @Input() listView = false;
}
