# Azure Cognitive APIs - Pure HTML5/JS Client
This is a simple demo web client app written in pure JS and HTML5 for capturing images from the device camera, sending them to Azure Cognitive Services, and processing/displaying the results

It is optimized for mobile devices and browsers but can be used on a PC/Desktop browser also


# Pre-Reqs
- Create a **Face API service account/instance** in Azure. Make a note of the endpoint and key. See also https://docs.microsoft.com/en-us/azure/cognitive-services/face/
- Create a **Computer Vision API service account/instance** in Azure. Make a note of the endpoint and key. See also https://docs.microsoft.com/en-us/azure/cognitive-services/computer-vision/

Copy/rename the `config.sample.mjs` file to `config.mjs`

Edit `config.mjs` and change the following: 
- `FACE_API_KEY` and `FACE_API_ENDPOINT` to your values for the face API
- `VISION_API_KEY` and `VISION_API_ENDPOINT` to your values for the computer vision API


# Deployment
The app is completely static so can be deployed almost anywhere including Azure Storage accounts, App Service, Netlify, GitHub Pages etc. Deploy the index.html file as well as `css`, `js` and `img` directories 


# Usage
The app is simple and self explanatory, and is designed for both mobile and desktop use. It will open the first camera on the device, and clicking/tapping the camera icon will switch through available cameras.

Clicking the video output will take a photo snapshot, which you can choose to upload and have analysed. The results will be shown as boxes around detected faces/objects etc, as well as additional details (tags, descriptions, colors, emotions, hair colour etc) shown below the photo snapshot

The first time an image is captured, users will be prompted to agree to terms of use.
