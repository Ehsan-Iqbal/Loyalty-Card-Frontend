import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessPagesComponent } from './business-pages.component';

describe('BusinessPagesComponent', () => {
  let component: BusinessPagesComponent;
  let fixture: ComponentFixture<BusinessPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
