import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'article/:slug',
    loadComponent: () =>
      import('./features/article/article.component').then((m) => m.ArticleComponent),
  },
  {
    path: 'category/:slug',
    loadComponent: () =>
      import('./features/category/category.component').then((m) => m.CategoryComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component').then((m) => m.SearchComponent),
  },

  {
    path: 'admin',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/admin-login/admin-login.component').then(
        (m) => m.AdminLoginComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'articles/new',
        loadComponent: () =>
          import('./features/admin/admin-article-editor/admin-article-editor.component').then(
            (m) => m.AdminArticleEditorComponent,
          ),
      },
      {
        path: 'articles/:id/edit',
        loadComponent: () =>
          import('./features/admin/admin-article-editor/admin-article-editor.component').then(
            (m) => m.AdminArticleEditorComponent,
          ),
      },
      {
        path: 'authors',
        loadComponent: () =>
          import('./features/admin/admin-authors/admin-authors.component').then(
            (m) => m.AdminAuthorsComponent,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/admin-categories/admin-categories.component').then(
            (m) => m.AdminCategoriesComponent,
          ),
      },
      {
        path: 'tickers',
        loadComponent: () =>
          import('./features/admin/admin-tickers/admin-tickers.component').then(
            (m) => m.AdminTickersComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/admin-settings/admin-settings.component').then(
            (m) => m.AdminSettingsComponent,
          ),
      },
    ],
  },

  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];
