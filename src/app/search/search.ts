import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';
import { Article } from '../core/models/article.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private seo = inject(SeoService);

  query = '';
  results = signal<Article[]>([]);
  total = signal(0);
  loading = signal(false);

  private querySubject = new Subject<string>();

  quickCategories = ['World', 'Tech', 'Business', 'Politics', 'Culture'];

  ngOnInit() {
    this.seo.updateMeta({ title: 'Search' });

    // Debounced search
    this.querySubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe((q) => {
      if (q.trim().length < 2) {
        this.results.set([]);
        this.total.set(0);
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.api.search(q).subscribe({
        next: (res) => {
          this.results.set(res.data);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });

    // Handle ?q= from URL
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      this.query = q;
      if (q) this.querySubject.next(q);
    });
  }

  onQueryChange(value: string) {
    this.querySubject.next(value);
  }
}
