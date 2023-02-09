import { Component } from '@angular/core';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss']
})
export class DescriptionComponent {
  projectName = "Imaging with Fourier";
  creators = "Amit Lustiger & Idan Yankelev";

}
