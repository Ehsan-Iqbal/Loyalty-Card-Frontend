import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalTouchesComponent } from './final-touches.component';

describe('FinalTouchesComponent', () => {
  let component: FinalTouchesComponent;
  let fixture: ComponentFixture<FinalTouchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalTouchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalTouchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
