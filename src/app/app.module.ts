import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DescriptionComponent } from './description/description.component';
import { ImageToFourierComponent } from './image-to-fourier/image-to-fourier.component';
import { DrawingToFourierComponent } from './drawing-to-fourier/drawing-to-fourier.component';
import { FourierComponent } from './fourier/fourier.component';
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    DescriptionComponent,
    ImageToFourierComponent,
    DrawingToFourierComponent,
    FourierComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
