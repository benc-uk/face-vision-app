const VERSION = "0.3.1"
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
var selectedDevice = 0;
var deviceIds = [];

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

//
//
//
function openCamera() {
  const constraints = {
    video: { deviceId: {exact: deviceIds[selectedDevice]} }
  };
  navigator.mediaDevices.getUserMedia(constraints)
  .then(stream => {
    window.stream = stream;
    video.srcObject = stream;
    document.querySelector('#camselect').style.display = "block";
    document.querySelector('#modeselect').style.display = "block";
  })
  .catch(err => showError(err.toString() + "<br>Make sure you accept camera permissions<br><a href='javascript:location.reload()'>Try reloading page</a>"));
}

//
//
//
function switchCameras() {
  selectedDevice = ++selectedDevice % deviceIds.length; 
  setCookie('selectedDevice', selectedDevice, 3000);
  openCamera();
}

//
//
//
function cancelPhoto() {
  video.style.display = "inline";
  canvas.style.display = "none";
  document.querySelector('#accept').style.display = "none";
  document.querySelector('#cancel').style.display = "none";
  document.querySelector('#camselect').style.display = "block";
  document.querySelector('#modeselect').style.display = "block";
  document.querySelector('#dialog').style.display = "none";
  document.querySelector('#main').style.height = "95%";
}

//
//
//
function restart() {
  document.querySelector('#restart').style.display = "none";
  document.querySelector('#output').style.display = "none";
  cancelPhoto()
}

//
//
//
video.onclick = function() {
  let vidDim = videoDimensions(video);
  canvas.width = vidDim.width;
  canvas.height = vidDim.height;

  canvas.getContext('2d').drawImage(video, 0, 0, vidDim.width, vidDim.height);

  video.style.display = "none";
  canvas.style.display = "inline";

  document.querySelector('#accept').style.display = "block";
  document.querySelector('#cancel').style.display = "block";
  document.querySelector('#camselect').style.display = "none";
  document.querySelector('#modeselect').style.display = "none";
  // Fix for output being waaay off the bottom of the page
  document.querySelector('#main').style.height = "auto";

  showAgreement();
};

//
//
//
function acceptPhoto() {
  // Set agreement cookie
  setCookie('termsAgreed', 'true', 3000);

  // Calls function in results.js
  if(mode == "vision")
    canvas.toBlob(analyzePhotoVision, "image/jpeg");
  else
    canvas.toBlob(analyzePhotoFaceDetect, "image/jpeg");
  
  document.querySelector('#dialog').style.display = "none";
  document.querySelector('#accept').style.display = "none";
  document.querySelector('#cancel').style.display = "none";
  document.querySelector('#camselect').style.display = "none";
  document.querySelector('#modeselect').style.display = "none";

  document.querySelector('#restart').style.display = "block";
  document.querySelector('#output').style.display = "block";
  document.querySelector('#output').innerHTML = "";
}

//
//
//
function showError(err) {
  document.querySelector('#dialog').style.display = "block";
  document.querySelector('#dialog').innerHTML = `<span class="error">A bad thing happened 😥 <br> ${err.toString()}</span>`
}


//
//
//
function showHelp() {
  document.querySelector('#dialog').style.display = "block";
  document.querySelector('#dialog').innerHTML = `<b>Azure Cognitive Services Demo v${VERSION}</b><br>
  <ul>
    <li>Tap or click anywhere on the image to take a photo snapshot</li>
    <li>Click the camera icon to switch between cameras</li>
    <li>The face/image button switches between cognitive APIs</li>
  </ul>
  &copy; Ben Coleman 2019<br>
  <a href="https://github.com/benc-uk/face-api-app">github.com/benc-uk/cognitive-demo</a> `
  setCookie('firstRun', 'false', 3000);
}
if(getCookie('firstRun') !== "false") {
  showHelp()
}

//
//
//
function showAgreement() {
  // Only show if agreement cookie set true
  if(getCookie('termsAgreed') !== "true") {
    document.querySelector('#dialog').style.display = "block";
    document.querySelector('#dialog').innerHTML = `Press the tick button to upload this photo to the cloud and have Azure Cognitive Services analyse the contents.<br><a href="https://azure.microsoft.com/en-gb/support/legal/cognitive-services-terms/">In doing so you agree to these terms</a>`
  }
}

// function checkOrientation() {
//   if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {    
//     if(screen.orientation.type.toLowerCase().includes('landscape')) {
//       document.querySelector('#top').style.display = "none";
//       document.querySelector('#main').style.height = "100%";
//     } else {
//       document.querySelector('#top').style.display = "block";
//       document.querySelector('#main').style.height = null;
//     }
//   }
// }
// window.addEventListener("orientationchange", checkOrientation);

//
//
//
function setMode(newMode) {
  mode = newMode
  if(mode == 'vision') {
    document.querySelector('#modeselect').innerHTML = '<i class="fas fa-image fa-fw"></i>'
  } else {
    document.querySelector('#modeselect').innerHTML = '<i class="fa fa-grin-alt fa-fw"></i>'
  }
  setCookie('mode', mode, 3000);
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

