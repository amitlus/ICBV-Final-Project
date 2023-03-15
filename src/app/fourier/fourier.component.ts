import { Component, Input, OnInit } from "@angular/core";
//In order to use p5 in my Angular project I needed to run: npm install --save @types/p5 in addition to the basic  npm install p5 --save command
import * as p5 from "p5";
import cv from "opencv-ts";

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

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: "app-fourier",
  templateUrl: "./fourier.component.html",
  styleUrls: ["./fourier.component.scss"],
})

export class FourierComponent implements OnInit {
  private drawing: any[] = [];
  edgeCoordinates: any[] = [];
  pointsList: Point[] = [];
  fourier: any;
  time: number = 0;
  path: any[] = [];
  @Input()
  speed: number = 60;
  @Input()
  numberOfCircles: number = Number.MAX_VALUE;
  sliderMaxCircles: number = Number.MAX_VALUE;

  //STATES
  USER_DRAW: number = 0;
  FOURIER: number = 1;
  WAIT_TO_FOURIER: number = 2;
  RESET: number = 3;
  state: number = -1;

  //FLAGS
  @Input()
  isImageMode: boolean = false;
  isEdgeDetectionPressed: boolean = false;

  //PLACE HOLDERS
  originalImage: string = "";
  imageAfterCanny: string = "";

  //CANVAS RELATED
  canvasWidth: number = 600;
  canvasHeight: number = 600;
  canvas: any;
  private sketch: any = null;

  ngOnInit() {
    this.createSketch();
  }

  private createSketch() {
    this.sketch = (s: {
      setup: () => void;
      createCanvas: (arg0: number, arg1: number) => any;
      background: (arg0: number) => void;
      fill: (arg0: number) => void;
      textSize: (arg0: number) => void;
      text: (arg0: string, arg1: number, arg2: number) => void;
      draw: () => void;
      drawUserDrawing: () => void;
      drawFourierTransform: () => void;
      frameRate: (arg0: number) => void;
      stroke: (
        arg0: number,
        arg1?: number | undefined,
        arg2?: number | undefined
      ) => void;
      noFill: () => void;
      beginShape: () => void;
      vertex: (arg0: any, arg1: any) => void;
      width: number;
      height: number;
      endShape: () => void;
      createVector: (arg0: number, arg1: number) => any;
      mouseX: number;
      mouseY: number;
      renderFourierAnimation: (x: number, y: number, rotation: number, fourier: any) => any;
      drawPath: () => void;
      strokeWeight: (arg0: number) => void;
      ellipse: (arg0: number, arg1: number, arg2: number) => void;
      line: (arg0: number, arg1: number, arg2: number, arg3: number) => void;
      mousePressed: () => void;
      mouseReleased: () => void;
      getDrawingCoordinates: (drawing: any[]) => Complex[];
      dft: (
        x: Complex[]
      ) => {
        re: number;
        im: number;
        freq: number;
        amp: number;
        phase: number;
      }[];
      TWO_PI: number;
      cos: (arg0: number) => number;
      sin: (arg0: number) => number;
      sqrt: (arg0: number) => any;
      atan2: (arg0: number, arg1: number) => any;
      keyPressed: () => void;
      keyCode: any;
      LEFT_ARROW: any;
      max: (arg0: number, arg1: number) => number;
      RIGHT_ARROW: any;
      min: (arg0: number, arg1: number) => number;
      UP_ARROW: any;
      DOWN_ARROW: any;
    }) => {

      s.setup = () => {
        let mainCanvas = s.createCanvas(this.canvasWidth, this.canvasHeight);
        if (this.isImageMode) {
          mainCanvas.parent("sketch-holder-for-upload");
        } else {
          mainCanvas.parent("sketch-holder-for-drawing");
          s.background(35);
          s.fill(255);
          s.textSize(32);
          s.text(
            "Draw Something!",
            this.canvasWidth / 3.5,
            this.canvasHeight / 2
          );
        }
        this.drawing = [];
        this.edgeCoordinates = [];
        this.path = [];
        this.time = 0;
        this.numberOfCircles = Number.MAX_VALUE;
        this.speed = 60;
        this.state = this.WAIT_TO_FOURIER;
      };

      //USER_DRAW mode- to get user's drawing.
      //FOURIER mode- to get the fourier transform drawing.
      //IMAGE_MODE- to identify between uploaded image to a drawing
      s.draw = () => {
        if (this.state === this.FOURIER) {
          this.edgeCoordinates = s.getDrawingCoordinates(this.isImageMode? this.pointsList : this.drawing);
          this.fourier = s.dft(this.edgeCoordinates);
          this.fourier.sort((a: { amp: number }, b: { amp: number }) => b.amp - a.amp);
          s.drawFourierTransform();
        }
        if (this.state === this.USER_DRAW) {
          s.drawUserDrawing();
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
        s.textSize(28);
        s.text(`speed=${this.speed}`, s.width / 2 - 300, s.height - 5);
        s.text(
          `number of circles=${this.numberOfCircles}`,
          s.width / 2 - 50,
          s.height - 5
        );
        const currentPosition = s.renderFourierAnimation(s.width / 2, s.height / 2, 0, this.fourier);
        this.path.unshift(currentPosition);
        s.drawPath();
        this.time += (Math.PI * 2) / this.fourier.length;
        if (this.time > Math.PI * 2) {
          this.time = 0;
          this.path = [];
        }
      };

      // Draw path created by the epicycles. (The drawing itself)
      s.drawPath = () => {
        s.strokeWeight(2);
        s.stroke(0, 255, 255);
        s.noFill();
        s.beginShape();
        for (const element of this.path) {
          s.vertex(element.x, element.y);
        }
        s.endShape();
      };

      // Create all epicycles of fourier and present them as animation & return the current position.
      s.renderFourierAnimation = (x: number, y: number, rotation: number, fourier: any) => {
        this.sliderMaxCircles = fourier.length;
        this.numberOfCircles = Math.min(this.sliderMaxCircles, this.numberOfCircles);
        for (let i: number = 0; i < this.numberOfCircles; i++) {
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
          if (i != this.numberOfCircles - 1) {
            s.line(prevx, prevy, x, y);
          }
        }
        return s.createVector(x, y);
      };

      //Once mouse is pressed we reset - entering USER_DRAW mode.
      s.mousePressed = () => {
        //The mouse position related to the Canvas (s.mouseX and s.mouseY)
        if (!this.isImageMode) {
          if (
            s.mouseX > 0 &&
            s.mouseX < this.canvasWidth &&
            s.mouseY > 0 &&
            s.mouseY < this.canvasHeight
          ) {
            if (this.state !== this.FOURIER) {
              this.state = this.USER_DRAW;
            }
          }
        }
      };

      //Once mouse is released - entering WAIT_TO_FOURIER mode.
      //We get the coordinates of the drawing and using fourier transform get the base signals.
      s.mouseReleased = () => {
        if (!this.isImageMode && this.state !== this.FOURIER) {
          this.state = this.WAIT_TO_FOURIER;
        }
      };

      //Transform x,y coordinates of drawing to set of complex numbers.
      s.getDrawingCoordinates = (drawing: any[]) => {
        let coords = [];
        for (const element of drawing) {
          coords.push(new Complex(element.x, element.y));
        }
        return coords;
      };

      s.dft = (pointsList: Complex[]) => {
        let spectrum: Array<{
          re: number;
          im: number;
          freq: number;
          amp: number;
          phase: number;
        }> = [];
        let numPoints = pointsList.length;
        for (let k = 0; k < numPoints; k++) {
          let sum = new Complex(0, 0);
          for (let n = 0; n < numPoints; n++) {
            let phi = (s.TWO_PI * k * n) / numPoints;
            let c = new Complex(s.cos(phi), -s.sin(phi));
            sum.add(pointsList[n].mult(c));
          }
          sum.re = sum.re / numPoints;
          sum.im = sum.im / numPoints;
          let freq = k;
          let amp = s.sqrt(sum.re * sum.re + sum.im * sum.im);
          let phase = s.atan2(sum.im, sum.re);
          spectrum[k] = { re: sum.re, im: sum.im, freq, amp, phase };
        }
        return spectrum;
      };

    };

    this.canvas = new p5(this.sketch);
  }

  startFourierTransform() {
    this.state = this.FOURIER;
  }

  onClearPress() {
    this.state = this.RESET;
  }

  onUploadImage(event: any) {
    this.isEdgeDetectionPressed = false;
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = reader.result as string;
      this.originalImage = img.src;

      img.onload = (e) => {
        // Create a matrix from the image data
        const baseImage = cv.imread(img);
        const resizedImage = new cv.Mat();
        // Resize the image
        cv.resize(baseImage, resizedImage, new cv.Size(this.canvasWidth, this.canvasHeight), 0, 0, cv.INTER_LINEAR);
        // Create an empty grayscale matrix
        const grayImage = new cv.Mat();
        // Convert the image to grayscale
        cv.cvtColor(resizedImage, grayImage, cv.COLOR_RGBA2GRAY);
        const blurredImage = new cv.Mat();
        cv.GaussianBlur(grayImage, blurredImage, new cv.Size(7, 7), 0, 0, cv.BORDER_DEFAULT);
        const edges = new cv.Mat();
        // Apply the Canny algorithm with the given thresholds
        cv.Canny(blurredImage, edges, 50, 150);

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        cv.imshow(canvas, edges);
        this.imageAfterCanny = canvas.toDataURL();

        // Find the contours of the edges
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
        this.pointsList = [];

        // Extract the coordinates of the contours
        for (let i = 0; i < contours.size(); i++) {
          const contourData = contours.get(i).data32S;
          // Get the contour data as an array of integers
          for (let j = 0; j < contourData.length; j += 10) {
            //We decreased width and height in order to center the drawing
            const point = {
              x: contourData[j] - this.canvasWidth/2,
              y: contourData[j + 1] - this.canvasHeight/2,
            };
            this.pointsList.push(point);
          }
        }
      };
    };
    reader.readAsDataURL(file);
  }

  ngOnDestroy() {
    if (this.sketch) {
      this.sketch.remove();
      this.sketch = null;
    }
  }

  onEdgeDetectionPress() {
    this.isEdgeDetectionPressed = true;
  }
}
