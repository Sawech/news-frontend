export interface Author {
  id?: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { articles: number };
}

export interface Opinion {
  id?: number;
  pubName?: string;
  content?: string;
  subject?: string;
  linkUrl?: string;
  locale?: string;
}

export interface Tag {
  name: string;
  slug: string;
}

export interface Article {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body?: string;
  imageUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  featured?: boolean;
  trending?: boolean;
  readTime?: number;
  // publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  author: Author;
  category: Category;
  tags?: Array<{ tag: Tag }>;
}

export interface ArticleListResponse {
  data: Article[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArticleDetailResponse {
  data: Article;
  related: Article[];
}

export interface SearchResponse {
  data: Article[];
  query: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoryListResponse {
  data: Category[];
}

export interface OpinionListResponse {
  data: Opinion[];
}

export interface Ticker {
  id: string;
  content: string;
  locale: string;
}
