import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ArticleListResponse,
  ArticleDetailResponse,
  SearchResponse,
  CategoryListResponse,
  OpinionListResponse,
  Ticker,
} from '../models/article.model';

export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  trending?: boolean;
  week?: boolean;
  month?: boolean;
  year?: string;
  locale?: string;
}

export interface CategoryQueryParams {
  locale?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getArticles(params: ArticleQueryParams = { locale: 'en' }): Observable<ArticleListResponse> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.featured !== undefined)
      httpParams = httpParams.set('featured', String(params.featured));
    if (params.trending !== undefined)
      httpParams = httpParams.set('trending', String(params.trending));
    if (params.week !== undefined) httpParams = httpParams.set('week', String(params.week));
    if (params.month !== undefined) httpParams = httpParams.set('month', String(params.month));
    if (params.year) httpParams = httpParams.set('year', params.year);
    httpParams = httpParams.set('locale', String(params.locale));
    return this.http.get<ArticleListResponse>(`${this.base}/articles`, { params: httpParams });
  }

  getArticleBySlug(slug: string): Observable<ArticleDetailResponse> {
    return this.http.get<ArticleDetailResponse>(`${this.base}/articles/${slug}`);
  }

  getCategories(params: CategoryQueryParams = {}): Observable<CategoryListResponse> {
    let httpParams = new HttpParams();
    if (params.locale) httpParams = httpParams.set('locale', params.locale);
    return this.http.get<CategoryListResponse>(`${this.base}/categories`, { params: httpParams });
  }

  getOpinions(locale: string): Observable<OpinionListResponse> {
    const params = new HttpParams().set('locale', locale);
    return this.http.get<OpinionListResponse>(`${this.base}/opinions`, { params });
  }

  search(query: string, page = 1): Observable<SearchResponse> {
    const params = new HttpParams().set('q', query).set('page', page);
    return this.http.get<SearchResponse>(`${this.base}/search`, { params });
  }

  getTickers(locale: string): Observable<{ data: Ticker[] }> {
    const params = new HttpParams().set('locale', locale);
    return this.http.get<{ data: Ticker[] }>(`${this.base}/tickers`, { params });
  }
}
