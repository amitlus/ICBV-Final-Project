import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingToFourierComponent } from './drawing-to-fourier.component';

describe('DrawingToFourierComponent', () => {
  let component: DrawingToFourierComponent;
  let fixture: ComponentFixture<DrawingToFourierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawingToFourierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingToFourierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
