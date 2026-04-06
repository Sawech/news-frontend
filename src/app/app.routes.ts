import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'article/:slug',
    loadComponent: () => import('./article/article').then((m) => m.ArticleComponent),
  },
  {
    path: 'category/:slug',
    loadComponent: () => import('./category/category').then((m) => m.CategoryComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('./search/search').then((m) => m.SearchComponent),
  },
  {
    path: 'archive/:year',
    loadComponent: () => import('./archive/archive').then((m) => m.ArchiveComponent),
  },

  {
    path: 'admin',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./admin/admin-login/admin-login').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-layout/admin-layout').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'articles/new',
        loadComponent: () =>
          import('./admin/admin-article-editor/admin-article-editor').then(
            (m) => m.AdminArticleEditorComponent,
          ),
      },
      {
        path: 'articles/:id/edit',
        loadComponent: () =>
          import('./admin/admin-article-editor/admin-article-editor').then(
            (m) => m.AdminArticleEditorComponent,
          ),
      },
      {
        path: 'authors',
        loadComponent: () =>
          import('./admin/admin-authors/admin-authors').then((m) => m.AdminAuthorsComponent),
      },
      {
        path: 'opinions',
        loadComponent: () =>
          import('./admin/admin-opinions/admin-opinions').then((m) => m.AdminOpinionsComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./admin/admin-categories/admin-categories').then(
            (m) => m.AdminCategoriesComponent,
          ),
      },
      {
        path: 'tickers',
        loadComponent: () =>
          import('./admin/admin-tickers/admin-tickers').then((m) => m.AdminTickersComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin/admin-settings/admin-settings').then((m) => m.AdminSettingsComponent),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
