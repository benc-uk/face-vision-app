import { analyzePhotoFaceDetect } from './results-face.mjs';
import { analyzePhotoVision } from './results-vision.mjs';
import { setCookie, getCookie } from './utils.mjs';

const VERSION = "0.3.1"
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

export var canvasScale;
var selectedDevice = 0;
var deviceIds = [];
var mode;

window.addEventListener('resize', resizeOrRotateHandler)
window.addEventListener('load', evt => {
  setMode(getCookie('mode') ? getCookie('mode') : "face");
  // Start by finding all media devices
  navigator.mediaDevices.enumerateDevices()
  .then(deviceList => {
    
    for (let deviceInfo of deviceList) {
      if (deviceInfo.kind === 'videoinput') {   
        // For debugging
        console.log(deviceInfo);  
        // Skip infrared camera
        if(deviceInfo.label && deviceInfo.label.toLowerCase().includes(" ir ")) continue;
        deviceIds.push(deviceInfo.deviceId);
      }
    }
    selectedDevice = getCookie('selectedDevice') ? getCookie('selectedDevice') : 0
  })
  .then(openCamera)
  .catch(err => showError(err));

  if(getCookie('firstRun') !== "false") {
    showHelp()
  }
})


//
//
//
function openCamera() {
  const constraints = {
    video: { deviceId: {exact: deviceIds[selectedDevice]} }
  };
  navigator.mediaDevices.getUserMedia(constraints)
  .then(stream => {
    video.srcObject = stream;
    butCamSel.style.display = "block";
    butModeSel.style.display = "block";
    butFullscreen.style.display = "block";
    resizeOrRotateHandler()
  })
  .catch(err => showError(err.toString() + "<br>Make sure you accept camera permissions<br><a href='javascript:location.reload()'>Try reloading page</a>"));
}

//
//
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
//
//
butCamSel.addEventListener('click', evt => {
  selectedDevice = ++selectedDevice % deviceIds.length; 
  setCookie('selectedDevice', selectedDevice, 3000);
  openCamera();
})

butModeSel.addEventListener('click', evt => {
  setMode(mode == 'face' ? 'vision' : 'face')
})

//
//
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
//
//
butRestart.addEventListener('click', evt => {
  butRestart.style.display = "none";
  output.style.display = "none";
  cancelPhoto()
})

butFullscreen.addEventListener('click', evt => {
  if(document.fullscreenElement && document.fullscreenElement !== null)
    document.exitFullscreen();
  else 
    document.querySelector('html').requestFullscreen()
})

//
//
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
//
//
butAccept.addEventListener('click', evt => {
  // Set agreement cookie
  setCookie('termsAgreed', 'true', 3000);

  spinner.style.display = 'block';

  // Calls function in results.js
  if(mode == "vision")
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
//
//
function setMode(newMode) {
  mode = newMode
  if(mode == 'vision') {
    butModeSel.innerHTML = '<i class="fas fa-image fa-fw"></i>'
  } else {
    butModeSel.innerHTML = '<i class="fa fa-grin-alt fa-fw"></i>'
  }
  setCookie('mode', mode, 3000);
}

//
//
//
export function showError(err) {
  spinner.style.display = 'none';
  dialog.style.display = "block";
  dialog.innerHTML = `<span class="error">A bad thing happened 😥 <br><br> ${err.toString()}</span>`
}


//
//
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
//
//
function showAgreement() {
  // Only show if agreement cookie set true
  if(getCookie('termsAgreed') !== "true") {
    dialog.style.display = "block";
    dialog.innerHTML = `Press the tick button to upload this photo to the cloud and have Azure Cognitive Services analyse the contents.<br><a href="https://azure.microsoft.com/en-gb/support/legal/cognitive-services-terms/">In doing so you agree to these terms</a>`
  }
}



//
// Helper util gets real video element height
//
function videoDimensions(video) {
  var videoRatio = video.videoWidth / video.videoHeight;
  var width = video.offsetWidth, height = video.offsetHeight;
  var elementRatio = width / height;
  if(elementRatio > videoRatio) 
    width = height * videoRatio;
  else 
    height = width / videoRatio;
  
  return {
    width: width,
    height: height
  };
}

