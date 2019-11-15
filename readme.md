# Azure Cognitive Face API - Pure HTML5/JS Demo
This is a simple demo web app written in pure JS and HTML5 for capturing images from the device camera, sending them to Azure Cognitive Services, and processing/displaying the results


# Pre-Reqs
Create an Face API service account/instance in Azure. Make a note of the endpoint and key. See also https://docs.microsoft.com/en-us/azure/cognitive-services/face/

Copy/rename the `config.sample.js` file to `config.js`

Edit `config.js` and change the `API_KEY` and `API_ENDPOINT` to your values


# Deployment
The app is completely static so can be deployed almost anywhere including Azure Storage accounts, App Service, Netlify, GitHub Pages etc. Deploy the index.html file as well as `css`, `js` and `img` directories 


# Usage
The app is simple and self explanatory, and is designed for both mobile and desktop use. It will open the first camera on the device, and clicking/tapping the camera icon will switch through available cameras.

Clicking the video output will take a photo snapshot, which you can choose to upload and have analysed. The results will be shown as boxes around detected faces, as well as additional details (emotions, hair colour etc) shown below the photo snapshot

The first time an image is captured, users will be prompted to agree to terms of use.