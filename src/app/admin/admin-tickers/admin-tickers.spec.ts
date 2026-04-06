import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTickers } from './admin-tickers';

describe('AdminTickers', () => {
  let component: AdminTickers;
  let fixture: ComponentFixture<AdminTickers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTickers],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTickers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
