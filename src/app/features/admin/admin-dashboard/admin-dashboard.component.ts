import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { AdminDashboardArticlesComponent } from './admin-dashboard-articles.component';

type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AdminDashboardArticlesComponent],
  template: '<app-admin-dashboard-articles />',
})
export class AdminDashboardComponent {
  ngOnInit() {}
}
