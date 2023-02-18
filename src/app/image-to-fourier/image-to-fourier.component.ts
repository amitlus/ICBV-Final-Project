import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-image-to-fourier',
  templateUrl: './image-to-fourier.component.html',
  styleUrls: ['./image-to-fourier.component.scss']
})

export class ImageToFourierComponent implements OnInit {

  imageSrc: string = '';

  ngOnInit(): void {
  }

  // code to handle uploading the image
  uploadImage(event: any) {
    //The event argument in the uploadImage method is of type any, but it is commonly passed in as a change event from an HTML input element of type file.
    // The input element of type file has a files property that is an array-like object of all the files selected by the user. This property is used to access the selected file, which is the first file in the array event.target.files[0].
    const file = event.target.files[0];
    debugger;

    const reader = new FileReader();
    reader.onload = (e) => {
      debugger;
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const {data, width, height} = new Canny().cannyEdgeDetector(imageData, 50, 100);

        const edgeCanvas = document.createElement("canvas");
        edgeCanvas.width = width;
        edgeCanvas.height = height;
        const edgeCtx = edgeCanvas.getContext("2d")!;
        const edgeImageData = edgeCtx.createImageData(width, height);
        edgeImageData.data.set(data);
        edgeCtx.putImageData(edgeImageData, 0, 0);

        this.imageSrc = edgeCanvas.toDataURL();
      };
      reader.readAsDataURL(file);
    }
  }

  // uploadImage(event: any) {
    //   //The event argument in the uploadImage method is of type any, but it is commonly passed in as a change event from an HTML input element of type file.
    //   // The input element of type file has a files property that is an array-like object of all the files selected by the user. This property is used to access the selected file, which is the first file in the array event.target.files[0].
    //   const file = event.target.files[0];
    //   const reader = new FileReader();
    //   reader.onload = (e) => {
    //     this.imageSrc = reader.result as string;
    //   };
    //   reader.readAsDataURL(file);
    // }

  fourierImage() {
    // code to handle the Fourier transformation of the image
    console.log("Fourier");
  }

}

interface ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

class Canny {

   public cannyEdgeDetector(imageData: ImageData, lowThreshold: number, highThreshold: number) {
    const { data, width, height } = imageData;

    // Convert the image data to grayscale
    const grayscaleData = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      grayscaleData[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Apply Gaussian blur to the grayscale image
    const gaussianKernel = [
      [1, 4, 7, 4, 1],
      [4, 16, 26, 16, 4],
      [7, 26, 41, 26, 7],
      [4, 16, 26, 16, 4],
      [1, 4, 7, 4, 1],
    ];
    const kernelSize = gaussianKernel.length;
    const halfKernelSize = Math.floor(kernelSize / 2);
    const blurredData = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        for (let j = -halfKernelSize; j <= halfKernelSize; j++) {
          for (let i = -halfKernelSize; i <= halfKernelSize; i++) {
            const px = x + i;
            const py = y + j;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const value = grayscaleData[py * width + px];
              const kernelValue = gaussianKernel[j + halfKernelSize][i + halfKernelSize];
              sum += value * kernelValue;
            }
          }
        }
        blurredData[y * width + x] = Math.round(sum / 273);
      }
    }

    // Calculate gradient and orientation using Sobel operator
    const sobelKernelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];
    const sobelKernelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];
    const gradientData = new Float32Array(width * height);
    const orientationData = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let gx = 0;
        let gy = 0;
        for (let j = -1; j <= 1; j++) {
          for (let i = -1; i <= 1; i++) {
            const px = x + i;
            const py = y + j;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const value = blurredData[py * width + px];
              const kernelX = sobelKernelX[j + 1][i + 1];
              const kernelY = sobelKernelY[j + 1][i + 1];
              gx += value * kernelX;
              gy += value * kernelY;
            }
          }
        }
        const gradient = Math.sqrt(gx * gx + gy * gy);
        const orientation = Math.atan2(gy, gx);
        gradientData[y * width + x] = gradient;
        orientationData[y * width + x] = orientation;
      }
    }

    // Non-maximum suppression
    const suppressionData = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const orientation = orientationData[idx];
        let a, b;
        if (orientation < -Math.PI / 8) {
          a = gradientData[idx - width];
          b = gradientData[idx + width];
        } else if (orientation < Math.PI / 8) {
          a = gradientData[idx - 1];
          b = gradientData[idx + 1];
        } else if (orientation < 3 * Math.PI / 8) {
          a = gradientData[idx - width + 1];
          b = gradientData[idx + width - 1];
        } else {
          a = gradientData[idx - width - 1];
          b = gradientData[idx + width + 1];
        }
        suppressionData[idx] = gradientData[idx] >= a && gradientData[idx] >= b ? gradientData[idx] : 0;
      }
    }

    // Hysteresis thresholding
    const resultData = new Uint8ClampedArray(width * height);
    const visited = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!visited[y * width + x] && suppressionData[y * width + x] >= highThreshold) {
          const stack = [{ x, y }];
          while (stack.length > 0) {
            const { x, y } = stack.pop()!;
            const idx = y * width + x;
            if (visited[idx] || suppressionData[idx] < lowThreshold) {
              continue;
            }
            visited[idx] = 1;
            resultData[idx] = 255;
            for (let j = -1; j <= 1; j++) {
              for (let i = -1; i <= 1; i++) {
                const px = x + i;
                const py = y + j;
                if (px >= 0 && px < width && py >= 0 && py < height) {
                  const neighborIdx = py * width + px;
                  if (!visited[neighborIdx]) {
                    stack.push({ x: px, y: py });
                  }
                }
              }
            }
          }
        }
      }
    }

    return {
      data: resultData,
      width,
      height,
    };
  }

}


