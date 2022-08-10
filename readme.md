# Computer Vision & Face Detection - Pure HTML5/JS Client

This is a simple demo web client app written in pure JS and HTML5 for capturing images from the device camera, and detecting faces and processing/displaying the results

It is optimized for mobile devices and browsers but can be used on a PC/Desktop browser also

The app has three modes:
- Realtime face detection using client side Tensorflow models and [face-api.js](https://justadudewhohacks.github.io/face-api.js/docs/index.html). This has no pre-reqs or config required.
- Face detection using the Azure Face API, see below
- General scene detection and analysis using Computer Vision API, see below

The two Azure modes are optional and are disabled by default

<img src="https://user-images.githubusercontent.com/14982936/183762018-0f76de0d-1517-4b10-934a-df20dcec507a.png" width="500px">
<img src="https://user-images.githubusercontent.com/14982936/183889899-43b5cb40-ebca-408c-bac4-3a9c24c5dd86.png" width="500px">
<img src="https://user-images.githubusercontent.com/14982936/183889457-b213bfb9-13eb-4929-9816-af71067a4a4d.png" width="500px">

## Live Demo

[Live demo hosted on GitHub pages here](https://code.benco.io/face-vision-app/)

## Azure Cognitive Services Mode

- Create a **Face API service account/instance** in Azure. Make a note of the endpoint and key. See also https://docs.microsoft.com/en-us/azure/cognitive-services/face/
- Create a **Computer Vision API service account/instance** in Azure. Make a note of the endpoint and key. See also https://docs.microsoft.com/en-us/azure/cognitive-services/computer-vision/

Copy/rename the `config.sample.json` file to `config.json`

Edit `config.json` and change the following:

- `FACE_API_KEY` and `FACE_API_ENDPOINT` to point to your instance of the 'Face API' along with the key
- `VISION_API_KEY` and `VISION_API_ENDPOINT` to point to your instance of the 'Computer Vision API' along with the key

## Deployment

The app is completely static has no backend or server, so can be deployed almost anywhere including Azure Storage accounts, App Service, Netlify, GitHub Pages etc. Deploy the index.html file as well as `css`, `js`, `img` & `model` directories

## Config

There are two other settings in config.json which can be set:

```jsonc
  // This is how often the video is captured and sent to the Azure APIs in milliseconds
  // - Set to zero to disable realtime capture, users will need to tap to trigger
  // - Low values could result in very high API usage and potentially costs
  // - Values 500 and below will only work on a fast network and will give you a HUGE bill  
  "AZURE_REFRESH_RATE": 4000,

  // How often the capture/analysis is done with the local Tensforflow.js models
  // This can be much higher, as no remote API is called and no costs are involved
  "TF_REFRESH_RATE": 700    
```
## Usage

The app is simple and self explanatory, and is designed for both mobile and desktop use. It will open the first camera on the device, and clicking/tapping the camera icon will switch through available cameras.

It will capture images from the camera/video every 3 seconds by default (configurable in config.mjs) and analyse them. The results are drawn over the video.  
Tapping/clicking the image will change between low & high detail modes (how much information is shown/drawn over the image)
