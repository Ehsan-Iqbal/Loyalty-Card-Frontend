import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFaPageComponent } from './two-fa-page.component';

describe('TwoFaPageComponent', () => {
  let component: TwoFaPageComponent;
  let fixture: ComponentFixture<TwoFaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoFaPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoFaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
