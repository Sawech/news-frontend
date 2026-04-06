export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
}

export interface AdminTicker {
  id: string;
  content: string;
  locale: string;
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
  // publishedAt?: string;
  createdAt: string;
  author: { name: string };
  category: { name: string };
  tags: Array<{ tag: { name: string; locale: string } }>;
}

export interface AdminArticleDetail extends AdminArticleRow {
  body: string;
  authorId: string;
  categoryId: string;
  locale: string;
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
  locale: string;
}

export interface AdminTag {
  id: string;
  name: string;
  locale: string;
}

export interface AdminAuthor {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AdminOpinion {
  id: number;
  pubName?: string;
  content?: string;
  subject?: string;
  linkUrl?: string;
  locale?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  locale?: string;
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
