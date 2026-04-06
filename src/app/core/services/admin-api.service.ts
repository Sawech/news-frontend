import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import {
  AdminArticleListResponse,
  AdminArticleDetail,
  AdminArticlePayload,
  AdminAuthor,
  AdminCategory,
  AdminTag,
  AdminTicker,
  AdminOpinion,
} from '../models/admin.model';
import { CategoryQueryParams } from './api.service';

interface AdminCategoryWithCount extends AdminCategory {
  _count?: { articles: number };
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly adminBase = environment.apiUrl.replace('/api', '') + '/api/admin';
  private readonly publicBase = environment.apiUrl;

  private opts = { withCredentials: true };

  getAdminTickers(locale: string): Observable<{ data: AdminTicker[] }> {
    const params = new HttpParams().set('locale', locale);
    return this.http.get<{ data: AdminTicker[] }>(`${this.adminBase}/tickers`, {
      ...this.opts,
      params,
    });
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

  getAuthors(): Observable<{ data: AdminAuthor[] }> {
    return this.http.get<{ data: AdminAuthor[] }>(`${this.adminBase}/authors`, this.opts);
  }

  createAuthor(payload: Omit<AdminAuthor, 'id'>): Observable<{ data: AdminAuthor }> {
    return this.http.post<{ data: AdminAuthor }>(`${this.adminBase}/authors`, payload, this.opts);
  }

  deleteAuthor(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminBase}/authors/${id}`, this.opts);
  }

  getOpinions(): Observable<{ data: AdminOpinion[] }> {
    return this.http.get<{ data: AdminOpinion[] }>(`${this.adminBase}/opinions`, this.opts);
  }

  updateOpinion(id: number, payload: Partial<AdminOpinion>): Observable<{ data: AdminOpinion }> {
    return this.http.put<{ data: AdminOpinion }>(
      `${this.adminBase}/opinions/${id}`,
      payload,
      this.opts,
    );
  }

  // deleteOpinion(id: number): Observable<{ message: string }> {
  //   return this.http.delete<{ message: string }>(`${this.adminBase}/opinions/${id}`, this.opts);
  // }

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

  getCategories(params: CategoryQueryParams = {}): Observable<{ data: AdminCategory[] }> {
    const httpParams = new HttpParams().set('locale', String(params.locale));
    return this.http.get<{ data: AdminCategory[] }>(`${this.publicBase}/categories`, {
      ...this.opts,
      params: httpParams,
    });
  }

  getTags(locale: string): Observable<{ data: AdminTag[] }> {
    const params = new HttpParams().set('locale', locale);
    return this.http.get<{ data: AdminTag[] }>(`${this.publicBase}/tags`, { ...this.opts, params });
  }

  createTag(payload: Omit<AdminTag, 'id'>): Observable<{ data: AdminTag }> {
    return this.http.post<{ data: AdminTag }>(`${this.adminBase}/tags`, payload, this.opts);
  }

  deleteTag(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminBase}/tags/${id}`, this.opts);
  }
}
