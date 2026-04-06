import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardArticles } from './admin-dashboard-articles';

describe('AdminDashboardArticles', () => {
  let component: AdminDashboardArticles;
  let fixture: ComponentFixture<AdminDashboardArticles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardArticles],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardArticles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
