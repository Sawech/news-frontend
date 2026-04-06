import { Component } from '@angular/core';
import { AdminDashboardArticlesComponent } from './admin-dashboard-articles/admin-dashboard-articles';

@Component({
  selector: 'app-admin-dashboard',
  imports: [AdminDashboardArticlesComponent],
  template: '<app-admin-dashboard-articles />',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent {
  ngOnInit() {}
}
