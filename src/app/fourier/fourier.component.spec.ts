import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FourierComponent } from './fourier.component';

describe('FourierComponent', () => {
  let component: FourierComponent;
  let fixture: ComponentFixture<FourierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FourierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FourierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
