import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminArticleListResponse,
  AdminArticleDetail,
  AdminArticlePayload,
  AdminAuthor,
  AdminCategory,
  AdminTag,
  AdminTicker,
} from '../models/admin.model';

interface AdminCategoryWithCount extends AdminCategory {
  _count?: { articles: number };
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly adminBase = environment.apiUrl.replace('/api', '') + '/api/admin';
  private readonly publicBase = environment.apiUrl;

  private opts = { withCredentials: true };

  // ── ticker ──────────────────────────────────────────────

  getAdminTickers(): Observable<{ data: AdminTicker[] }> {
    return this.http.get<{ data: AdminTicker[] }>(`${this.adminBase}/tickers`, this.opts);
  }

  getTicker(id: string): Observable<{ data: AdminTicker }> {
    return this.http.get<{ data: AdminTicker }>(`${this.adminBase}/tickers/${id}`, this.opts);
  }

  createTicker(paylod: Omit<AdminTicker, 'id'>): Observable<{ data: AdminTicker }> {
    return this.http.post<{ data: AdminTicker }>(`${this.adminBase}/tickers`, paylod, this.opts);
  }

  updateTicker(id: string, paylod: Partial<AdminTicker>): Observable<{ data: AdminTicker }> {
    return this.http.put<{ data: AdminTicker }>(
      `${this.adminBase}/tickers/${id}`,
      paylod,
      this.opts,
    );
  }

  deleteTicker(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminBase}/tickers/${id}`, this.opts);
  }

  // ── Articles ──────────────────────────────────────────────

  getArticles(
    page = 1,
    limit = 20,
    status?: string,
    search?: string,
  ): Observable<AdminArticleListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    return this.http.get<AdminArticleListResponse>(`${this.adminBase}/articles`, {
      params,
      withCredentials: true,
    });
  }

  getArticle(id: string): Observable<{ data: AdminArticleDetail }> {
    return this.http.get<{ data: AdminArticleDetail }>(
      `${this.adminBase}/articles/${id}`,
      this.opts,
    );
  }

  createArticle(payload: AdminArticlePayload): Observable<{ data: AdminArticleDetail }> {
    return this.http.post<{ data: AdminArticleDetail }>(
      `${this.adminBase}/articles`,
      payload,
      this.opts,
    );
  }

  updateArticle(
    id: string,
    payload: Partial<AdminArticlePayload>,
  ): Observable<{ data: AdminArticleDetail }> {
    return this.http.put<{ data: AdminArticleDetail }>(
      `${this.adminBase}/articles/${id}`,
      payload,
      this.opts,
    );
  }

  deleteArticle(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminBase}/articles/${id}`, this.opts);
  }

  // ── Authors ───────────────────────────────────────────────

  getAuthors(): Observable<{ data: AdminAuthor[] }> {
    return this.http.get<{ data: AdminAuthor[] }>(`${this.adminBase}/authors`, this.opts);
  }

  createAuthor(payload: Omit<AdminAuthor, 'id'>): Observable<{ data: AdminAuthor }> {
    return this.http.post<{ data: AdminAuthor }>(`${this.adminBase}/authors`, payload, this.opts);
  }

  deleteAuthor(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminBase}/authors/${id}`, this.opts);
  }

  // ── Categories (admin — with article counts) ──────────────

  getAdminCategories(): Observable<{ data: AdminCategoryWithCount[] }> {
    return this.http.get<{ data: AdminCategoryWithCount[] }>(
      `${this.adminBase}/categories`,
      this.opts,
    );
  }

  createCategory(payload: Omit<AdminCategory, 'id'>): Observable<{ data: AdminCategoryWithCount }> {
    return this.http.post<{ data: AdminCategoryWithCount }>(
      `${this.adminBase}/categories`,
      payload,
      this.opts,
    );
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminBase}/categories/${id}`, this.opts);
  }

  // ── Categories (public — for article editor dropdowns) ────

  getCategories(): Observable<{ data: AdminCategory[] }> {
    return this.http.get<{ data: AdminCategory[] }>(`${this.publicBase}/categories`, this.opts);
  }

  // ── Tags ──────────────────────────────────────────────────

  getTags(): Observable<{ data: AdminTag[] }> {
    return this.http.get<{ data: AdminTag[] }>(`${this.publicBase}/tags`, this.opts);
  }
}
