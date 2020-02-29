import { analyzePhotoFaceDetect } from './results-face.mjs';
import { analyzePhotoVision } from './results-vision.mjs';
import { setCookie, getCookie, toggleFullScreen, videoDimensions, showToast } from './utils.mjs';
import { config } from '../config.mjs';

const VERSION = "0.5.0"
export const dialog = document.querySelector('#dialog');
export const offscreen = document.querySelector('#offscreen');
export var overlay = document.querySelector('#overlay');

const main = document.querySelector('#main');
export const video = document.querySelector('video');
const butModeSel = document.querySelector('#modeselect');
const butCamSel = document.querySelector('#camselect');
const butFullscreen = document.querySelector('#fullscreen');

export var canvasScale;             // Used to scale any drawing done
export var showDetail = true        // Show more detail and face emojis
var selectedDevice = 0;             // Currently selected camera id
var deviceIds = [];                 // List of all cameras (device ids)
var apiMode;                        // Either 'face' or 'vision'
var active = true;                  // Don't process video or call API when inactive
var vidDim = {width: 0, height: 0}; // Video size
var intervalHandle                  // Id of the setInterval to refresh the view

//
// Handle resize and rotate events
//
window.addEventListener('resize', resizeOrRotateHandler)

//
// Start here! 
//
window.addEventListener('load', async evt => {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
  //await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
  await faceapi.nets.faceExpressionNet.loadFromUri('/models')
  await faceapi.nets.ageGenderNet.loadFromUri('/models')

  // Set starting API mode either stored as cookie or fallback to default
  setApiMode(getCookie('mode') ? getCookie('mode') : "face");
  
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if(isSafari) {
    // Call unconstrained getUserMedia first to get past permissions issue on Safari
    navigator.mediaDevices.getUserMedia({audio: false, video: true})
    .then(listDevices)
  } else {
    listDevices()
  }

  if(getCookie('firstRun') !== "false") {
    showHelp()
  }
})

//
// Call mediaDevices.enumerateDevices and populate deviceIds array and selectedDevice
//
function listDevices() {
  // Now list all devices
  navigator.mediaDevices.enumerateDevices()
  .then(deviceList => {
    for (let deviceInfo of deviceList) {
      // Only care about cameras
      if (deviceInfo.kind === 'videoinput') {   
        //alert(JSON.stringify(deviceInfo));  

        // Skip infrared camera
        if(deviceInfo.label && deviceInfo.label.toLowerCase().includes(" ir ")) continue;
        // Store id in array for later use
        deviceIds.push(deviceInfo.deviceId);
      }
    }
    selectedDevice = getCookie('selectedDevice') ? getCookie('selectedDevice') : 0
  })
  .then(openCamera)
  .catch(err => showError(err));
}

//
// Open media stream for camera with id selectedDevice
//
function openCamera() {
  if(intervalHandle) {
    clearInterval(intervalHandle)
  }
  
  const constraints = {
    video: { deviceId: {exact: deviceIds[selectedDevice]} }
  };
  navigator.mediaDevices.getUserMedia(constraints)
  .then(stream => {
    // Display the video
    video.srcObject = stream;
    butCamSel.style.display = "block";
    butModeSel.style.display = "block";
    butFullscreen.style.display = "block";

    if(config.REFRESH_EVERY > 0) {
      intervalHandle = setInterval(captureImage, config.REFRESH_EVERY);
      setTimeout(captureImage, 500);
    }
    
    // Handle the screen (re)sizing
    resizeOrRotateHandler()
  })
  .catch(err => showError(err.toString() + "<br>Make sure you accept camera permissions<br><a href='javascript:location.reload()'>Try reloading page</a>"));
}

//
// Disable capture when out of focus and not visible
//
document.addEventListener("visibilitychange", function() {
  if(document.visibilityState === 'visible') {
    active = true;
    video.play();
    showToast(`Resuming image capture`)
  } else {
    active = false;
    video.pause();
  }
});
window.addEventListener("blur", function(evt) {
  active = false;
  video.pause();
});
window.addEventListener("focus", function(evt) {
  active = true;
  video.play();
  showToast(`Resuming image capture`)
});

//
// Deals with landscape/portrait hassles with video object
//
function resizeOrRotateHandler() {
  if(window.innerWidth > window.innerHeight) {
    main.style.width = "100%";   
    main.style.height = "95%";
    video.style.width = "100%"; 
    video.style.height = "100%";
  } else {
    main.style.width = "95%";  
    main.style.height = null;
    video.style.width = "100%";  
    video.style.height = null;
  } 
}

//
// Button event handler: Change selected camera
//
butCamSel.addEventListener('click', evt => {
  selectedDevice = ++selectedDevice % deviceIds.length; 
  showToast(`Changing to camera device: ${selectedDevice}`)
  setCookie('selectedDevice', selectedDevice, 3000);
  openCamera();
})

//
// Button event handler: Change API mode
//
butModeSel.addEventListener('click', evt => {
  setApiMode(apiMode == 'face' ? 'vision' : 'face')
  showToast(`Detection mode is now: ${apiMode}`)
  captureImage()
})

//
// Toggle fullscreen mode
//
butFullscreen.addEventListener('click', () => {
  showToast(`Switching to/from fullscreen`)
  toggleFullScreen()
})

//
// Toggle detail on and off
//
// overlay.addEventListener('click', () => {
//   showDetail = !showDetail
//   showToast(`Extra detail & emoji ${showDetail==true?'enabled':'disabled'}`)
// })

video.addEventListener('click', captureImage)
overlay.addEventListener('click', captureImage)

//
// Capture from video, draw into canvas and send to API
//
function captureImage() {
  if(!active) return;

  // Handles resizing and first time loaded
  // Sizes the video, offscreen canvas and overlay canvas
  let newVidDim = videoDimensions(video);
  if(newVidDim.width != vidDim.width || newVidDim.height != vidDim.height) {
    vidDim = newVidDim
  
    offscreen.width = vidDim.width;
    offscreen.height = vidDim.height;
    canvasScale = Math.max(vidDim.width / 1500, 0.7);
    if(window.devicePixelRatio > 1) canvasScale /= (window.devicePixelRatio/2)
    
    // var foo = faceapi.createCanvasFromMedia(video)
    // foo.style.display = 'inline'
    // main.appendChild(foo)
    //console.log(overlay.style)

    // Place overlay exactly over video
    overlay.width = vidDim.width;
    overlay.height = vidDim.height;
    overlay.style.top = `${video.offsetTop}px`;
    overlay.style.left = `${window.innerWidth/2 - vidDim.width/2}px`;
  }

  // Render the video frame to the hidden canvas
  offscreen.getContext('2d').drawImage(video, 0, 0, vidDim.width, vidDim.height);
  
  // Convert canvas to a blob and process with the selected API
  if(apiMode == "vision")
    offscreen.toBlob(analyzePhotoVision, "image/jpeg");
  else
    offscreen.toBlob(analyzePhotoFaceDetect, "image/jpeg");
}

//
// Toggle between API modes
//
function setApiMode(newMode) {
  apiMode = newMode
  if(apiMode == 'vision') {
    butModeSel.innerHTML = '<i class="fas fa-image fa-fw"></i>'
  } else {
    butModeSel.innerHTML = '<i class="fa fa-grin-alt fa-fw"></i>'
  }
  setCookie('mode', apiMode, 3000);
}

//
// Display error message of some kind
//
export function showError(err) {
  dialog.style.display = "block";
  dialog.innerHTML = `<span class="error">A bad thing happened 😥 <br><br> ${err.toString()}</span>`
}

//
// Display about/help only shown once at first start
//
function showHelp() {
  dialog.style.display = "block";
  dialog.innerHTML = `<b>Azure Cognitive Services Demo v${VERSION}</b><br>
  <ul>
    <li>Click the camera icon to switch between cameras</li>
    <li>The face/image button switches between cognitive APIs</li>
    <li>Click the image to toggle detail</li>
  </ul>
  This app will upload images from your camera to the cloud & use Azure Cognitive Services APIs to analyse the contents.<br><a href="https://azure.microsoft.com/en-gb/support/legal/cognitive-services-terms/">In doing so you agree to these terms</a>
  <br><br>
  &copy; Ben Coleman 2020<br>
  <a href="https://github.com/benc-uk/face-api-app">github.com/benc-uk/cognitive-demo</a> `
  setCookie('firstRun', 'false', 3000);
}
