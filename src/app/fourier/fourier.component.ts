import { Component, Input, OnInit } from "@angular/core";
import * as p5 from "p5";
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
  selector: "app-fourier",
  templateUrl: "./fourier.component.html",
  styleUrls: ["./fourier.component.scss"],
})

export class FourierComponent implements OnInit {
  private drawing: any[] = [];
  x: any[] = [];
  fourier: any;
  time: number = 0;
  path: any[] = [];
  @Input()
  speed: number = 60;
  @Input()
  n_circles: number = 10000;
  sliderMaxCircles: number = 99999;

  USER: number = 0;
  FOURIER: number = 1;
  DEFAULT: number = 2;
  RESET: number = 3;

  state: number = -1;
  canvasWidth: number = 600;
  canvasHeight: number = 600;

  canvas: any;
  private sketch: any = null;

  ngOnInit() {
    this.createSketch();
  }

  private createSketch() {
    this.sketch = (s: {
      setup: () => void; createCanvas: (arg0: number, arg1: number) => any; background: (arg0: number) => void; fill: (arg0: number) => void; textSize: (arg0: number) => void; text: (arg0: string, arg1: number, arg2: number) => void; draw: () => void; drawUserDrawing: () => void; drawFourierTransform: () => void; frameRate: (arg0: number) => void; stroke: (arg0: number, arg1?: number | undefined, arg2?: number | undefined) => void; noFill: () => void; beginShape: () => void; vertex: (arg0: any, arg1: any) => void; width: number; height: number; endShape: () => void; createVector: (arg0: number, arg1: number) => any; mouseX: number; mouseY: number; epicycles: (x: number, y: number, rotation: number, fourier: any) => any; drawPath: () => void; strokeWeight: (arg0: number) => void; ellipse: (arg0: number, arg1: number, arg2: number) => void; line: (arg0: number, arg1: number, arg2: number, arg3: number) => void; mousePressed: () => void; mouseReleased: () => void; getDrawingCoordinates: (drawing: any[]) => Complex[]; dft: (x: Complex[]) => { re: number; im: number; freq: number; amp: number; phase: number; }[]; TWO_PI: number; cos: (arg0: number) => number; sin: (arg0: number) => number; sqrt: (arg0: number) => any; atan2: (arg0: number, arg1: number) => any; keyPressed: () => void; keyCode: any; LEFT_ARROW: any; max: (arg0: number, arg1: number) => number; RIGHT_ARROW: any; min: (arg0: number, arg1: number) => number; UP_ARROW: any; DOWN_ARROW: any;
    }) => {
      s.setup = () => {
        let mainCanvas = s.createCanvas(this.canvasWidth, this.canvasHeight);
        // creating a reference to the div here positions it, so you can put things above and below
        // where the sketch is displayed
        mainCanvas.parent("sketch-holder");
        s.background(35);
        s.fill(255);
        s.textSize(32);
        s.text(
          "Draw Something!",
          this.canvasWidth / 3.5,
          this.canvasHeight / 2
        );

        this.drawing = [];
        this.x = [];
        this.path = [];
        this.time = 0;
        this.n_circles = 100000000000;
        this.speed = 60;
        this.state = this.DEFAULT;
      };

      //If we are in USER mode, we get user's drawing.
      //Else we get the fourier transform drawing.
      s.draw = () => {
        if (this.state === this.USER) s.drawUserDrawing();
        if (this.state === this.FOURIER) {
          this.x = s.getDrawingCoordinates(this.drawing);
          this.fourier = s.dft(this.x);
          this.fourier.sort(
            (a: { amp: number }, b: { amp: number }) => b.amp - a.amp
          );
          s.drawFourierTransform();
        }
        if (this.state === this.RESET) {
          s.setup();
        }
        s.frameRate(this.speed);
      };

      //Follow user's mouse and draw it on screen, save drawing points in drawing.
      s.drawUserDrawing = () => {
        s.background(0);
        s.stroke(255);
        s.noFill();
        s.beginShape();
        for (let v of this.drawing) {
          s.vertex(v.x + s.width / 2, v.y + s.height / 2);
        }
        s.endShape();
        let point = s.createVector(
          s.mouseX - s.width / 2,
          s.mouseY - s.height / 2
        );
        this.drawing.push(point);
      };

      // Generate epicycles of the signals given by the fourier and draw the path created by them.
      s.drawFourierTransform = () => {
        s.background(0);
        s.stroke(255);
        s.fill(255);
        s.textSize(32);
        s.text(`speed=${this.speed}`, s.width / 2 - 300, s.height - 5);
        s.text(
          `number of circles=${this.n_circles}`,
          s.width / 2 - 50,
          s.height - 5
        );
        const v = s.epicycles(s.width / 2, s.height / 2, 0, this.fourier);
        this.path.unshift(v);
        s.drawPath();
        this.time += (Math.PI * 2) / this.fourier.length;
        if (this.time > Math.PI * 2) {
          this.time = 0;
          this.path = [];
        }
      };

      // Draw path created by the epicycles.
      s.drawPath = () => {
        s.strokeWeight(2);
        s.stroke(0, 255, 255);
        s.noFill();
        s.beginShape();
        for (let i = 0; i < this.path.length; i++) {
          s.vertex(this.path[i].x, this.path[i].y);
        }
        s.endShape();
      };

      // Create all epicycles of fourier.
      s.epicycles = (x: number, y: number, rotation: number, fourier: any) => {
        this.sliderMaxCircles = fourier.length;
        this.n_circles = Math.min(this.sliderMaxCircles, this.n_circles);
        for (let i: number = 0; i < this.n_circles; i++) {
          let prevx = x;
          let prevy = y;
          let freq = fourier[i].freq;
          let radius = fourier[i].amp;
          let phase = fourier[i].phase;
          x += radius * Math.cos(freq * this.time + phase + rotation);
          y += radius * Math.sin(freq * this.time + phase + rotation);

          s.stroke(255, 100);
          s.noFill();
          s.ellipse(prevx, prevy, radius * 2);
          s.stroke(255);
          if (i != this.n_circles - 1) {
            s.line(prevx, prevy, x, y);
          }
        }
        return s.createVector(x, y);
      };

      //Once mouse is pressed we reset -  we enter user mode.
      s.mousePressed = () => {
        //The mouse position related to the Canvas (s.mouseX and s.mouseY)
        if (
          s.mouseX > 0 &&
          s.mouseX < this.canvasWidth &&
          s.mouseY > 0 &&
          s.mouseY < this.canvasHeight
        ) {
          if (this.state !== this.FOURIER) {
            this.state = this.USER;
          }
        }
      };

      //Once mouse is released -  we enter fourier mode.
      //We get the coordinates of the drawing and using fourier transform get the base signals.
      s.mouseReleased = () => {
        if (this.state !== this.FOURIER) {
          this.state = this.DEFAULT;
        }
      };

      //Transform x,y coordinates of drawing to set of complex numbers.
      s.getDrawingCoordinates = (drawing: any[]) => {
        let coords = [];
        for (let i = 0; i < drawing.length; i++) {
          coords.push(new Complex(drawing[i].x, drawing[i].y));
        }
        return coords;
      };

      s.dft = (x: Complex[]) => {
        let X: Array<{
          re: number;
          im: number;
          freq: number;
          amp: number;
          phase: number;
        }> = [];
        let N = x.length;
        for (let k = 0; k < N; k++) {
          let sum = new Complex(0, 0);
          for (let n = 0; n < N; n++) {
            let phi = (s.TWO_PI * k * n) / N;
            let c = new Complex(s.cos(phi), -s.sin(phi));
            sum.add(x[n].mult(c));
          }
          sum.re = sum.re / N;
          sum.im = sum.im / N;
          let freq = k;
          let amp = s.sqrt(sum.re * sum.re + sum.im * sum.im);
          let phase = s.atan2(sum.im, sum.re);
          X[k] = { re: sum.re, im: sum.im, freq, amp, phase };
        }
        return X;
      };
    };
    this.canvas = new p5(this.sketch);
  }

  onSubmit() {
    console.log(`Speed: ${this.speed}, Circles: ${this.n_circles}`);
  }

  onDrawPress() {
    this.state = this.FOURIER;
  }

  onClearPress() {
    this.state = this.RESET;
  }

  ngOnDestroy() {
    if (this.sketch) {
      debugger;
      this.sketch.remove();
      this.sketch = null;
    }
  }
}
