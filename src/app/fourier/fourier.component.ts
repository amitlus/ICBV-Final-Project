import { Component, OnInit } from '@angular/core';
import * as p5 from 'p5';
//In order to use p5 in my Angular project I needed to run: npm install --save @types/p5 in addition to the basic  npm install p5 --save command

export class Complex {
  re: number;
  im: number;


  constructor(a: number, b: number) {
    this.re = a;
    this.im = b;
  }

  add(c: Complex) {
    this.re += c.re;
    this.im += c.im;
  }

  mult(c: Complex): Complex {
    const re = this.re * c.re - this.im * c.im;
    const im = this.re * c.im + this.im * c.re;
    return new Complex(re, im);
  }
}

@Component({
  selector: 'app-fourier',
  templateUrl: './fourier.component.html',
  styleUrls: ['./fourier.component.scss']
})
export class FourierComponent implements OnInit {
  private drawing: any[] = [];
  private p5 : any; //Check how to set it's type to p5 and not any

  //BASE_DRAWING.JS
  x: any[] = [];
  fourier:any;
  time:number = 0;
  path: any[] = [];
  speed:number = 120;
  n_circles:number = 10000;

  //USER_DRAWING
  USER:number = 0;
  FOURIER:number = 1;
  state: number = -1;
  ngOnInit() {
  }

  // Base function calls custom function according to the required drawing scenario.
  setup(){
    this.p5.createCanvas(this.p5.windowWidht, this.p5.windowHeight);
    this.speed=120;
    this.custom_setup()
  }

  // Base function calls custom function according to the required drawing scenario.
  draw(){
    this.custom_draw();
  }

  // Generate epicycles of the signals given by the fourier and draw the path created by them.
  drawFourierTransform() {
    this.p5.background(0);
    this.p5.stroke(255);
    this.p5.fill(255);
    this.p5.textSize(32);
    this.p5.text(`speed=${this.speed}`, this.p5.width / 2 - 300, this.p5.height - 5);
    this.p5.text(`number of circles=${this.n_circles}`, this.p5.width / 2 - 50, this.p5.height - 5);
    const v = this.epicycles(this.p5.width / 2, this.p5.height / 2, 0, this.fourier);
    this.path.unshift(v);
    this.drawPath();
    this.time += (Math.PI * 2) / this.fourier.length;
    if (this.time > Math.PI * 2) {
      this.time = 0;
      this.path = [];
    }
  }

  // Draw path created by the epicycles.
  drawPath() {
    this.p5.strokeWeight(2);
    this.p5.stroke(0, 255, 255);
    this.p5.noFill();
    this.p5.beginShape();
    for (let i = 0; i < this.path.length; i++) {
      this.p5.vertex(this.path[i].x, this.path[i].y);
    }
    this.p5.endShape();
  }

  //Transform x,y coordinates of drawing to set of complex numbers.
  getDrawingCoordinates(drawing: any[]) {
    let coords = [];
    for (let i = 0; i < drawing.length; i ++) {
      coords.push(new Complex(drawing[i].x, drawing[i].y));
    }
    return coords;
  }

  // Create all epicycles of fourier.
  epicycles(x: number, y: number, rotation: number, fourier: any) {
    this.n_circles = Math.min(fourier.length, this.n_circles);
    for (let i:number = 0; i < this.n_circles; i++) {
      let prevx = x;
      let prevy = y;
      let freq = fourier[i].freq;
      let radius = fourier[i].amp;
      let phase = fourier[i].phase;
      x += radius * Math.cos(freq * this.time + phase + rotation);
      y += radius * Math.sin(freq * this.time + phase + rotation);

      this.p5.stroke(255, 100);
      this.p5.noFill();
      this.p5.ellipse(prevx, prevy, radius * 2);
      this.p5.stroke(255);
      if (i != this.n_circles - 1) {
        this.p5.line(prevx, prevy, x, y);
      }
    }
      return this.p5.createVector(x, y);
  }

  //FOURIER.JS
 dft(x: Complex[]): Array<{re: number, im: number, freq: number, amp: number, phase: number}> {
  let X: Array<{re: number, im: number, freq: number, amp: number, phase: number}> = [];
  let N = x.length;
  for (let k = 0; k < N; k++) {
    let sum = new Complex(0, 0);
    for (let n = 0; n < N; n++) {
      let phi = (this.p5.TWO_PI * k * n) / N;
      let c = new Complex(this.p5.cos(phi), -this.p5.sin(phi));
      sum.add(x[n].mult(c));
    }
    sum.re = sum.re / N;
    sum.im = sum.im / N;
    let freq = k;
    let amp = this.p5.sqrt(sum.re * sum.re + sum.im * sum.im);
    let phase = this.p5.atan2(sum.im, sum.re);
    X[k] = { re: sum.re, im: sum.im, freq, amp, phase };
  }
  return X;
}

//USER_DRAWING

//When we want to have user drawing we greet user at start with "draw something!".
custom_setup()
{
  this.p5.background(0);
  this.p5.fill(255);
  this.p5.textAlign(this.p5.CENTER);
  this.p5.textSize(64);
  this.p5.text("Draw Something!", this.p5.width/2, this.p5.height/2);
}

//Once mouse is pressed we reset -  we enter user mode.
mousePressed()
{
  this.state = this.USER;
  this.drawing = [];
  this.x = [];
  this.path = [];
  this.time = 0;
  this.n_circles=100000000000;
  this.speed=120;
}

//Once mouse is released -  we enter fourier mode.
//We get the coordinates of the drawing and using fourier transform get the base signals.
mouseReleased()
{
  this.state = this.FOURIER;
  this.x = this.getDrawingCoordinates(this.drawing);
  this.fourier = this.dft(this.x);
  this.fourier.sort((a: { amp: number; }, b: { amp: number; }) => b.amp - a.amp);
}

//If we are in USER mode, we get user's drawing.
//Else we get the fourier transform drawing.
custom_draw()
{
  if (this.state === this.USER) this.drawUserDrawing();
  else if (this.state === this.FOURIER) this.drawFourierTransform();
  this.p5.frameRate(this.speed);
}

//Follow user's mouse and draw it on screen, save drawing points in drawing.
drawUserDrawing() {
  this.p5.background(0);
  this.p5.stroke(255);
  this.p5.noFill();
  this.p5.beginShape();
  for (let v of this.drawing) {
    this.p5.vertex(v.x + this.p5.width / 2, v.y + this.p5.height / 2);
  }
  this.p5.endShape();
  let point = this.p5.createVector(this.p5.mouseX - this.p5.width / 2, this.p5.mouseY - this.p5.height / 2);
  this.drawing.push(point);
}


}
