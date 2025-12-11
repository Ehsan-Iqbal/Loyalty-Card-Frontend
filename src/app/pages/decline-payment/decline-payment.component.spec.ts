import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclinePaymentComponent } from './decline-payment.component';

describe('DeclinePaymentComponent', () => {
  let component: DeclinePaymentComponent;
  let fixture: ComponentFixture<DeclinePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclinePaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeclinePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
