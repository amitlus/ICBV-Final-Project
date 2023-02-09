import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DescriptionComponent } from './description.component';
import { ImageToFourierComponent } from './image-to-fourier.component';
import { DrawingToFourierComponent } from './drawing-to-fourier.component';

@NgModule({
  declarations: [
    AppComponent,
    DescriptionComponent,
    ImageToFourierComponent,
    DrawingToFourierComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
