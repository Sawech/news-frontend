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
  publishedAt?: string;
  createdAt?: string;
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
