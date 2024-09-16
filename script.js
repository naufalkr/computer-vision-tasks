const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const useCameraButton = document.getElementById('useCamera');
const uploadButton = document.getElementById('upload');
const fileInput = document.getElementById('fileInput');
const capturedImage = document.getElementById('capturedImage');
const captureButton = document.getElementById('capture');
const originalImage = document.getElementById('originalImage');
const filteredImage = document.getElementById('filteredImage');
const sobelButton = document.getElementById('sobel');
const bwButton = document.getElementById('bw');
const brightnessButton = document.getElementById('brightness');
const glpfButton = document.getElementById('glpf');
const bilateralButton = document.getElementById('bilateral').addEventListener('click', applyBilateral);
// const fftButton = document.getElementById('fft');
// const fftButton = document.getElementById('homomorphic').addEventListener('click', applyHomomorphicFilter);
const laplacianButton = document.getElementById('laplacian').addEventListener('click', applyLaplacian);
const claheButton = document.getElementById('clahe').addEventListener('click', applyCLAHE);
const dftButton = document.getElementById('dft').addEventListener('click', applyDFT);


let currentImageSource = null;

function handleImage(imageSrc) {
    const context = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        capturedImage.src = imageData;
        capturedImage.style.display = 'block';
        originalImage.src = imageData;
        originalImage.style.display = 'block';
    };
    img.src = imageSrc;
    currentImageSource = imageSrc;
}

// navigator.mediaDevices.getUserMedia({ video: true })
//     .then(stream => {
//         video.srcObject = stream;
//     })
//     .catch(err => {
//         console.error("Error accessing webcam: ", err);
//     });

useCameraButton.addEventListener('click', () => {
    video.style.display = 'block';
    fileInput.style.display = 'none';
    canvas.style.display = 'none';

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Error accessing webcam: ", err);
        });
});

uploadButton.addEventListener('click', () => {
    video.style.display = 'none';
    fileInput.style.display = 'block';
    canvas.style.display = 'none';
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            handleImage(reader.result);
        };
        reader.readAsDataURL(file);
    }
});

captureButton.addEventListener('click', () => {
    if (video.style.display === 'block') {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        capturedImage.src = imageData;
        capturedImage.style.display = 'block';
        originalImage.src = imageData;
        originalImage.style.display = 'block';
    } else if (currentImageSource) {
        handleImage(currentImageSource);
    }
});

// Sobel edge detection
sobelButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    function applySobel(x, y, kernel) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const pixelX = Math.min(canvas.width - 1, Math.max(0, x + kx));
                const pixelY = Math.min(canvas.height - 1, Math.max(0, y + ky));
                const index = (pixelY * canvas.width + pixelX) * 4;
                const gray = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
                sum += gray * kernel[ky + 1][kx + 1];
            }
        }
        return sum;
    }

    const outputData = context.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const gx = applySobel(x, y, sobelX);
            const gy = applySobel(x, y, sobelY);
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            const index = (y * canvas.width + x) * 4;
            outputData.data[index] = magnitude;
            outputData.data[index + 1] = magnitude;
            outputData.data[index + 2] = magnitude;
            outputData.data[index + 3] = 255;
        }
    }

    context.putImageData(outputData, 0, 0);
    filteredImage.src = canvas.toDataURL('image/png');
    filteredImage.style.display = 'block';
});

// black and white filter
bwButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let index = 0; index < data.length; index += 4) {
        const v = (data[index] + data[index + 1] + data[index + 2]) / 3;
        data[index] = v;
        data[index + 1] = v;
        data[index + 2] = v;
    }

    context.putImageData(imageData, 0, 0);
    filteredImage.src = canvas.toDataURL('image/png');
    filteredImage.style.display = 'block';
});

// brightness
brightnessButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let index = 0; index < data.length; index += 4) {
        data[index] *= 1.2;     // Red
        data[index + 1] *= 1.2; // Green
        data[index + 2] *= 1.2; // Blue
    }

    context.putImageData(imageData, 0, 0);
    filteredImage.src = canvas.toDataURL('image/png');
    filteredImage.style.display = 'block';
});

// Laplacian
function applyLaplacian() {
    if (typeof cv === 'undefined') {
        alert("OpenCV.js not loaded!");
        return;
    }

    const src = cv.imread('canvas');  
    let dst = new cv.Mat();
    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);

    cv.Laplacian(src, dst, cv.CV_8U, 1, 1, 0, cv.BORDER_DEFAULT);
    cv.imshow('canvas', dst);

    const canvas = document.getElementById('canvas');
    const filteredImage = document.getElementById('filteredImage'); 

    filteredImage.src = canvas.toDataURL('image/png');
    filteredImage.style.display = 'block'; 
    
    src.delete(); dst.delete();
}

// CLAHE
function applyCLAHE() {
    if (typeof cv === 'undefined') {
        alert("OpenCV.js not loaded!");
        return;
    }

    const src = cv.imread('canvas');  
    const gray = new cv.Mat();        
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);  

    // Apply CLAHE
    const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8)); 
    const dst = new cv.Mat();  
    clahe.apply(gray, dst);    
    cv.imshow('canvas', dst);

    const canvas = document.getElementById('canvas');
    const filteredImage = document.getElementById('filteredImage'); 

    filteredImage.src = canvas.toDataURL('image/png');
    filteredImage.style.display = 'block'; 

    src.delete();
    gray.delete();
    dst.delete();
    clahe.delete();
}


// Bilateral
function applyBilateral() {
    if (typeof cv === 'undefined') {
        alert("OpenCV.js not loaded!");
        return;
    }

    const src = cv.imread('canvas');  
    let dst = new cv.Mat();
    cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);

    // You can try more different parameters
    cv.bilateralFilter(src, dst, 9, 75, 75, cv.BORDER_DEFAULT);
    cv.imshow('canvas', dst);

    const canvas = document.getElementById('canvas');
    const filteredImage = document.getElementById('filteredImage'); 

    filteredImage.src = canvas.toDataURL('image/png');
    filteredImage.style.display = 'block'; 

    src.delete(); dst.delete();
}



// DFT
function applyDFT() {
    if (typeof cv === 'undefined') {
        alert("OpenCV.js not loaded!");
        return;
    }

    const src = cv.imread('canvas');  
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

    
    // get optimal size of DFT
    let optimalRows = cv.getOptimalDFTSize(src.rows);
    let optimalCols = cv.getOptimalDFTSize(src.cols);
    let s0 = cv.Scalar.all(0);
    let padded = new cv.Mat();
    cv.copyMakeBorder(src, padded, 0, optimalRows - src.rows, 0,
                    optimalCols - src.cols, cv.BORDER_CONSTANT, s0);

    // use cv.MatVector to distribute space for real part and imaginary part
    let plane0 = new cv.Mat();
    padded.convertTo(plane0, cv.CV_32F);
    let planes = new cv.MatVector();
    let complexI = new cv.Mat();
    let plane1 = new cv.Mat.zeros(padded.rows, padded.cols, cv.CV_32F);
    planes.push_back(plane0);
    planes.push_back(plane1);
    cv.merge(planes, complexI);

    // in-place dft transform
    cv.dft(complexI, complexI);

    // compute log(1 + sqrt(Re(DFT(img))**2 + Im(DFT(img))**2))
    cv.split(complexI, planes);
    cv.magnitude(planes.get(0), planes.get(1), planes.get(0));
    let mag = planes.get(0);
    let m1 = new cv.Mat.ones(mag.rows, mag.cols, mag.type());
    cv.add(mag, m1, mag);
    cv.log(mag, mag);

    // crop the spectrum, if it has an odd number of rows or columns
    let rect = new cv.Rect(0, 0, mag.cols & -2, mag.rows & -2);
    mag = mag.roi(rect);

    // rearrange the quadrants of Fourier image
    // so that the origin is at the image center
    let cx = mag.cols / 2;
    let cy = mag.rows / 2;
    let tmp = new cv.Mat();

    let rect0 = new cv.Rect(0, 0, cx, cy);
    let rect1 = new cv.Rect(cx, 0, cx, cy);
    let rect2 = new cv.Rect(0, cy, cx, cy);
    let rect3 = new cv.Rect(cx, cy, cx, cy);

    let q0 = mag.roi(rect0);
    let q1 = mag.roi(rect1);
    let q2 = mag.roi(rect2);
    let q3 = mag.roi(rect3);

    // exchange 1 and 4 quadrants
    q0.copyTo(tmp);
    q3.copyTo(q0);
    tmp.copyTo(q3);

    // exchange 2 and 3 quadrants
    q1.copyTo(tmp);
    q2.copyTo(q1);
    tmp.copyTo(q2);

    // The pixel value of cv.CV_32S type image ranges from 0 to 1.
    cv.normalize(mag, mag, 0, 1, cv.NORM_MINMAX);

    // cv.imshow('canvasOutput', mag);

    cv.imshow('canvas', mag);

    const canvas = document.getElementById('canvas');
    const filteredImage = document.getElementById('filteredImage'); 

    filteredImage.src = canvas.toDataURL('image/png');
    filteredImage.style.display = 'block'; 
    src.delete(); padded.delete(); planes.delete(); complexI.delete(); m1.delete(); tmp.delete();
}

// Gaussian low pass filter
glpfButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const gaussianKernel = [
        [1/16, 1/8, 1/16],
        [1/8, 1/4, 1/8],
        [1/16, 1/8, 1/16]
    ];

    const width = canvas.width;
    const height = canvas.height;

    function applyGaussian(x, y, kernel) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const pixelX = Math.min(width - 1, Math.max(0, x + kx));
                const pixelY = Math.min(height - 1, Math.max(0, y + ky));
                const index = (pixelY * width + pixelX) * 4;
                const gray = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
                sum += gray * kernel[ky + 1][kx + 1];
            }
        }
        return sum;
    }

    const outputData = context.createImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const gray = applyGaussian(x, y, gaussianKernel);
            const index = (y * width + x) * 4;
            outputData.data[index] = gray;
            outputData.data[index + 1] = gray;
            outputData.data[index + 2] = gray;
            outputData.data[index + 3] = 255;
        }
    }

    context.putImageData(outputData, 0, 0);
    filteredImage.src = canvas.toDataURL('image/png');
    filteredImage.style.display = 'block';
});
