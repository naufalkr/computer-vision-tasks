# Image Filtering in Spatial Domain

This project demonstrates image filtering techniques in the spatial domain, where different filters are applied to images using OpenCV.js. 

### Filters Used
- Black and White (Grayscale Filter)
  
  Converts the input image to grayscale by averaging the RGB values of each pixel. The grayscale value is computed as
  ```
  grayscale_value = (R + G + B) / 3
  ```
  It simplifies the image, making it easier to apply other filters like edge detection.

- Brightness Adjustment

  Increases the brightness of the image by multiplying the RGB values of each pixel by a factor (e.g., 1.2 in this case)
  ```
  new_value = original_value * brightness_factor
  ```
  It enhances the visibility of darker images by making the pixels brighter.

- Bilateral Smoothing

  This filter reduces noise while keeping edges sharp by applying a bilateral filter, which smooths similar colors while preserving edge detail.
  Parameters include:
  ```
  diameter: The size of the pixel neighborhood.
  sigmaColor: The filter sigma in the color space.
  sigmaSpace: The filter sigma in the coordinate space
  ```
  It is ideal for noise reduction without blurring the edges.

- Sobel Edge Detection

  Detects edges in the image by calculating the gradient in both horizontal (X) and vertical (Y) directions. The Sobel operator highlights regions of high spatial frequency (edges).

- Laplacian Edge Detection
  
  Detects edges using the Laplacian operator, which highlights regions where the intensity changes sharply. This filter captures both horizontal and vertical edges. It enhances edge detection by detecting variations in intensity, making it useful for identifying edges     in smooth or less contrasted images.

- CLAHE (Contrast Limited Adaptive Histogram Equalization)
  Enhances the contrast of an image by applying histogram equalization in small sections (tiles) of the image. It limits the contrast amplification to avoid noise. It improves local contrast and enhances edges, making details more visible in underexposed or low-contrast   areas.

OpenCV Documentation: 
https://docs.opencv.org/3.4/d2/df0/tutorial_js_table_of_contents_imgproc.html
