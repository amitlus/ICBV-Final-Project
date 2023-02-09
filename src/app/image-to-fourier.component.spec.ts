import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageToFourierComponent } from './image-to-fourier.component';

describe('ImageToFourierComponent', () => {
  let component: ImageToFourierComponent;
  let fixture: ComponentFixture<ImageToFourierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageToFourierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageToFourierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
