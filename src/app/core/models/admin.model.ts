export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
}

export interface AdminTicker {
  id: string;
  content: string;
}

export interface AdminArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED';
  featured: boolean;
  trending: boolean;
  readTime: number;
  publishedAt?: string;
  createdAt: string;
  author: { name: string };
  category: { name: string };
  tags: Array<{ tag: { name: string; slug: string } }>;
}

export interface AdminArticleDetail extends AdminArticleRow {
  body: string;
  authorId: string;
  categoryId: string;
}

export interface AdminArticlePayload {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  imageUrl?: string;
  authorId: string;
  categoryId: string;
  tagIds?: string[];
  featured?: boolean;
  trending?: boolean;
  readTime?: number;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface AdminTag {
  id: string;
  name: string;
  slug: string;
}

export interface AdminAuthor {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface AdminListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface AdminArticleListResponse {
  data: AdminArticleRow[];
  meta: AdminListMeta;
}
