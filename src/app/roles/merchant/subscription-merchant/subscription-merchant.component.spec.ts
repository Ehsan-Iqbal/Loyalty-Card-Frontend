import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionMerchantComponent } from './subscription-merchant.component';

describe('SubscriptionMerchantComponent', () => {
  let component: SubscriptionMerchantComponent;
  let fixture: ComponentFixture<SubscriptionMerchantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionMerchantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionMerchantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
