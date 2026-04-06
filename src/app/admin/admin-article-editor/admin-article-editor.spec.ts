import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArticleEditor } from './admin-article-editor';

describe('AdminArticleEditor', () => {
  let component: AdminArticleEditor;
  let fixture: ComponentFixture<AdminArticleEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticleEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminArticleEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
