import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOpinions } from './admin-opinions';

describe('AdminOpinions', () => {
  let component: AdminOpinions;
  let fixture: ComponentFixture<AdminOpinions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOpinions],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOpinions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
