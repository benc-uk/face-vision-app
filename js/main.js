
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
var ctx;
var selectedDevice = 0;
var deviceIds = [];


window.addEventListener("orientationchange", function() {
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    if(screen.orientation.type.toLowerCase().includes('landscape')) {
      document.querySelector('#top').style.display = "none";
      document.querySelector('#main').style.height = "100%";
    } else {
      document.querySelector('#top').style.display = "block";
      document.querySelector('#main').style.height = null;
    }
  }
});

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
    window.stream = stream
    video.srcObject = stream
  })
  .catch(err => showError(err));
}


//
//
//
function switchCameras() {
  selectedDevice = ++selectedDevice % deviceIds.length; 
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
  document.querySelector('#dialog').style.display = "none";
}

//
//
//
function restart() {
  document.querySelector('#dialog').style.display = "none";
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

  ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, vidDim.width, vidDim.height);

  video.style.display = "none";
  canvas.style.display = "inline";

  document.querySelector('#accept').style.display = "block";
  document.querySelector('#cancel').style.display = "block";
  document.querySelector('#camselect').style.display = "none";
  
  showAgreement();
};

//
//
//
function acceptPhoto() {
  // Set agreement cookie
  document.cookie = "agreement=true; expires=Fri, 31 Dec 9999 23:59:59 GMT";
  canvas.toBlob(analyzePhotoBlob);
  document.querySelector('#dialog').style.display = "none";
  document.querySelector('#accept').style.display = "none";
  document.querySelector('#cancel').style.display = "none";
  document.querySelector('#camselect').style.display = "none";
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
  document.querySelector('#dialog').innerHTML = `Face API Demo App v0.2.0<br>(C) Ben Coleman 2019<br><a href="https://github.com/benc-uk/face-api-app">github.com/benc-uk/face-api-app</a> `
}

//
//
//
function showAgreement() {
  // Only show if agreement cookie set true
  if (document.cookie.replace(/(?:(?:^|.*;\s*)agreement\s*\=\s*([^;]*).*$)|^.*$/, "$1") !== "true") {
    document.querySelector('#dialog').style.display = "block";
    document.querySelector('#dialog').innerHTML = `Pressing the tick ✅ button will upload this image to the cloud and use Azure Cognitive Services to analyse the contents.<br><a href="https://azure.microsoft.com/en-gb/support/legal/cognitive-services-terms/">In doing so you agree to these terms</a>`
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
