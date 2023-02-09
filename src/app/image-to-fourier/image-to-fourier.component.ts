import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-image-to-fourier',
  templateUrl: './image-to-fourier.component.html',
  styleUrls: ['./image-to-fourier.component.scss']
})
export class ImageToFourierComponent implements OnInit {

  imageSrc: string = '';
  constructor() { }

  ngOnInit(): void {
  }

  // code to handle uploading the image
  uploadImage(event: any) {
    //The event argument in the uploadImage method is of type any, but it is commonly passed in as a change event from an HTML input element of type file.
    // The input element of type file has a files property that is an array-like object of all the files selected by the user. This property is used to access the selected file, which is the first file in the array event.target.files[0].
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageSrc = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  fourierImage() {
    // code to handle the Fourier transformation of the image
    console.log("Fourier");
  }

}
