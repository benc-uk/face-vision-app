import { analyzePhotoFaceDetect } from './results-face.mjs';
import { analyzePhotoVision } from './results-vision.mjs';
import { setCookie, getCookie, toggleFullScreen, videoDimensions } from './utils.mjs';

const VERSION = "0.4.0"
export const main = document.querySelector('#main');
export const output = document.querySelector('#output');
export const dialog = document.querySelector('#dialog');
export const spinner = document.querySelector('#spinner');
export const video = document.querySelector('video');
export const canvas = document.querySelector('canvas');

const butRestart = document.querySelector('#restart');
const butModeSel = document.querySelector('#modeselect');
const butCamSel = document.querySelector('#camselect');
const butFullscreen = document.querySelector('#fullscreen');
const butCancel = document.querySelector('#cancel');
const butAccept = document.querySelector('#accept');

export var canvasScale;   // Used to scale any drawing done
var selectedDevice = 0;   // Currently selected camera id
var deviceIds = [];       // List of all cameras (device ids)
var apiMode;              // Either 'face' or 'vision'

//
// Handle resize and rotate events
//
window.addEventListener('resize', resizeOrRotateHandler)

//
// Start here! 
//
window.addEventListener('load', evt => {
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
    // Handle the screen (re)sizing
    resizeOrRotateHandler()
  })
  .catch(err => showError(err.toString() + "<br>Make sure you accept camera permissions<br><a href='javascript:location.reload()'>Try reloading page</a>"));
}

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
  setCookie('selectedDevice', selectedDevice, 3000);
  openCamera();
})

//
// Button event handler: Change API mode
//
butModeSel.addEventListener('click', evt => {
  setApiMode(apiMode == 'face' ? 'vision' : 'face')
})

//
// Button event handler: User cancels the photo, return to video mode
//
function cancelPhoto() {
  video.style.display = "inline";
  canvas.style.display = "none";
  butAccept.style.display = "none";
  butCancel.style.display = "none";
  butCamSel.style.display = "block";
  butModeSel.style.display = "block";
  butFullscreen.style.display = "block";
  dialog.style.display = "none";
  spinner.style.display = 'none';
}
butCancel.addEventListener('click', cancelPhoto);

//
// Button event handler: Restart and take another photo
//
butRestart.addEventListener('click', evt => {
  butRestart.style.display = "none";
  output.style.display = "none";
  cancelPhoto()
})

//
// TButton event handler: oggle fullscreen mode
//
butFullscreen.addEventListener('click', toggleFullScreen)

//
// Take a snap of the video as a photo 
//
video.onclick = function() {
  let vidDim = videoDimensions(video);
  canvas.width = vidDim.width;
  canvas.height = vidDim.height;
  canvasScale = Math.max(canvas.width / 2000, 0.5);

  canvas.getContext('2d').drawImage(video, 0, 0, vidDim.width, vidDim.height);

  video.style.display = "none";
  canvas.style.display = "block";

  butAccept.style.display = "block";
  butCancel.style.display = "block";
  butCamSel.style.display = "none";
  butModeSel.style.display = "none";
  butFullscreen.style.display = "none";

  showAgreement();
};

//
// Button event handler: user accepts the photo, analyze it with the cognitive API
//
butAccept.addEventListener('click', evt => {
  // Set agreement cookie
  setCookie('termsAgreed', 'true', 3000);

  spinner.style.display = 'block';

  // Convert canvas to a blob and process with the selected API
  if(apiMode == "vision")
    canvas.toBlob(analyzePhotoVision, "image/jpeg");
  else
    canvas.toBlob(analyzePhotoFaceDetect, "image/jpeg");
  
  dialog.style.display = "none";
  butAccept.style.display = "none";
  butCancel.style.display = "none";
  butCamSel.style.display = "none";
  butModeSel.style.display = "none";

  butRestart.style.display = "block";
  output.style.display = "block";
  output.innerHTML = "";
})

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
  spinner.style.display = 'none';
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
    <li>Tap or click anywhere on the image to take a photo snapshot</li>
    <li>Click the camera icon to switch between cameras</li>
    <li>The face/image button switches between cognitive APIs</li>
  </ul>
  &copy; Ben Coleman 2019<br>
  <a href="https://github.com/benc-uk/face-api-app">github.com/benc-uk/cognitive-demo</a> `
  setCookie('firstRun', 'false', 3000);
}

//
// Display terms of use, legal blah, only shown on first upload
//
function showAgreement() {
  // Only show if agreement cookie set true
  if(getCookie('termsAgreed') !== "true") {
    dialog.style.display = "block";
    dialog.innerHTML = `Press the tick button to upload this photo to the cloud and have Azure Cognitive Services analyse the contents.<br><a href="https://azure.microsoft.com/en-gb/support/legal/cognitive-services-terms/">In doing so you agree to these terms</a>`
  }
}