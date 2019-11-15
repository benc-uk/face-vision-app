const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
var ctx;
var selectedDevice = 0;
var deviceIds = [];

navigator.mediaDevices.enumerateDevices()
.then(gotDevices)
.then(openCamera)
.catch(handleError);

function gotDevices(deviceList) {
  for (let deviceInfo of deviceList) {
    if (deviceInfo.kind === 'videoinput') {      
      // Skip infrared camera
      if(deviceInfo.label && deviceInfo.label.toLowerCase().includes(" ir ")) continue;
      deviceIds.push(deviceInfo.deviceId);
    }
  }
}

function openCamera() {
  const constraints = {
    video: { deviceId: {exact: deviceIds[selectedDevice]} }
  };

  navigator.mediaDevices.getUserMedia(constraints)
  .then(streamOpen)
  .catch(handleError);
}

function switchCameras() {
  selectedDevice = ++selectedDevice % deviceIds.length; 
  openCamera();
}

function streamOpen(stream) {
  window.stream = stream; 
  video.srcObject = stream;
}

function handleError(error) {
  console.error('Error: ', error);
}

function cancelPhoto() {
  video.style.display = "inline";
  canvas.style.display = "none";
  document.querySelector('#accept').style.display = "none";
  document.querySelector('#cancel').style.display = "none";
  document.querySelector('#camselect').style.display = "block";
}

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
};

function acceptPhoto() {
  canvas.toBlob(sendPhoto);
  document.querySelector('#accept').style.display = "none";
  document.querySelector('#cancel').style.display = "none";
  document.querySelector('#camselect').style.display = "none";
  document.querySelector('#restart').style.display = "block";
}

function sendPhoto(blob) {
  fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
        'Content-Type': 'application/octet-stream'
      },
      body: blob
    })
    .then(response => {
      if(!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then(data => {

      let faceNum = 0;
      for(let face of data) {
        processFace(face, ++faceNum)
      }

    })
    .catch(err => {
      console.log(err);
    })
}

function processFace(face, faceNum) {
  let color = randomColor({luminosity: 'light'});
  let scaleFactor = Math.max(canvas.width / 2000, 0.5);

  let hairColor = "Unknown";
  let hairColorConfidence = 0;
  for(let hair of face.faceAttributes.hair.hairColor) {
    if(hair.confidence > hairColorConfidence) {
      hairColorConfidence = hair.confidence;
      hairColor = hair.color
    }
  }

  // Process results
  let faceAttr = face.faceAttributes;
  document.querySelector('#output').innerHTML += `
  <h2 style="color:${color}">Face ${faceNum}</h2>
  <table class="center" cellspacing="0" cellpadding="0" style="color:${color}">
    <tr><td>Gender: ${faceAttr.gender}</td><td>Age: ${faceAttr.age}</td></tr>
    <tr><td>Smile: ${parseFloat(faceAttr.smile * 100).toFixed(1)+"%"}</td><td>Glasses: ${faceAttr.glasses}</td></tr>
    <tr><td>Hair: ${hairColor}</td><td>Bald: ${parseFloat(face.faceAttributes.hair.bald * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Beard: ${parseFloat(faceAttr.facialHair.beard * 100).toFixed(1)+"%"}</td><td>Moustache: ${parseFloat(faceAttr.facialHair.moustache * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Eye Makeup: ${faceAttr.makeup.eyeMakeup}</td><td>Lip Makeup: ${faceAttr.makeup.lipMakeup}</td></tr>
    <tr><td>Anger: ${parseFloat(faceAttr.emotion.anger * 100).toFixed(1)+"%"}</td><td>Contempt: ${parseFloat(faceAttr.emotion.contempt * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Disgust: ${parseFloat(faceAttr.emotion.disgust * 100).toFixed(1)+"%"}</td><td>Fear: ${parseFloat(faceAttr.emotion.fear * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Happiness: ${parseFloat(faceAttr.emotion.happiness * 100).toFixed(1)+"%"}</td><td>Neutral: ${parseFloat(faceAttr.emotion.neutral * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Sadness: ${parseFloat(faceAttr.emotion.sadness * 100).toFixed(1)+"%"}</td><td>Surprise: ${parseFloat(faceAttr.emotion.surprise * 100).toFixed(1)+"%"}</td></tr>
  </table>
  `;

  // Face boxes
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.shadowColor = "#000000"
  ctx.shadowOffsetX = 4 * scaleFactor;
  ctx.shadowOffsetY = 4 * scaleFactor;
  ctx.lineWidth = 10 * scaleFactor;
  ctx.beginPath();
  ctx.rect(face.faceRectangle.left, face.faceRectangle.top, face.faceRectangle.width, face.faceRectangle.height);
  ctx.stroke();
  ctx.font = (60 * scaleFactor)+"px Arial";
  let offset = 15 * scaleFactor;
  ctx.fillText(`${faceAttr.gender} (${faceAttr.age})`, face.faceRectangle.left, face.faceRectangle.top - offset);
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
