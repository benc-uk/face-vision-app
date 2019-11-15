//
//
//
function analyzePhotoFaceDetect(blob) {
  let apiUrl = `https://${FACE_API_ENDPOINT}/face/v1.0/detect?returnFaceAttributes=age,gender,smile,facialHair,glasses,emotion,hair,makeup`
  fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': FACE_API_KEY,
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
      console.dir(data); 
      if(data.length < 1)
        throw Error("No faces detected");

      for(let face of data) {
        processFaceResult(face)
      }
    })
    .catch(err => {
      showError(err);
    })
}

//
//
//
function processFaceResult(face) {
  let color = randomColor({ luminosity: 'light' });
  let scaleFactor = Math.max(canvas.width / 2000, 0.5);

  let hairColor = "None";
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
  <h2 style="color:${color}">${faceAttr.gender} ${faceAttr.age}</h2>
  <table style="color:${color}">
    <tr><td>Smile:</td><td>${parseFloat(faceAttr.smile * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Glasses:</td><td>${faceAttr.glasses}</td></tr>
    <tr><td>Hair:</td><td>${hairColor}</td></tr>
    <tr><td>Bald:</td><td>${parseFloat(face.faceAttributes.hair.bald * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Beard:</td><td>${parseFloat(faceAttr.facialHair.beard * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Moustache:</td><td>${parseFloat(faceAttr.facialHair.moustache * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Eye Makeup:</td><td>${faceAttr.makeup.eyeMakeup}</td></tr>
    <tr><td>Lip Makeup:</td><td>${faceAttr.makeup.lipMakeup}</td></tr>
  </table>

  <table style="color:${color}">
    <tr><td>Neutral:</td><td>${parseFloat(faceAttr.emotion.neutral * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Happiness:</td><td>${parseFloat(faceAttr.emotion.happiness * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Sadness:</td><td>${parseFloat(faceAttr.emotion.sadness * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Anger:</td><td>${parseFloat(faceAttr.emotion.anger * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Contempt:</td><td>${parseFloat(faceAttr.emotion.contempt * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Disgust:</td><td>${parseFloat(faceAttr.emotion.disgust * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Fear:</td><td>${parseFloat(faceAttr.emotion.fear * 100).toFixed(1)+"%"}</td></tr>
    <tr><td>Surprise:</td><td>${parseFloat(faceAttr.emotion.surprise * 100).toFixed(1)+"%"}</td></tr>
  </table>`;

  // Face boxes
  let canvasCtx = document.querySelector('canvas').getContext('2d');

  canvasCtx.strokeStyle = color;
  canvasCtx.fillStyle = color;
  canvasCtx.shadowColor = "#000000"
  canvasCtx.shadowOffsetX = 4 * scaleFactor;
  canvasCtx.shadowOffsetY = 4 * scaleFactor;
  canvasCtx.lineWidth = 6 * scaleFactor;
  canvasCtx.beginPath();
  canvasCtx.rect(face.faceRectangle.left, face.faceRectangle.top, face.faceRectangle.width, face.faceRectangle.height);
  canvasCtx.stroke();
  canvasCtx.font = `${40 * scaleFactor}px Arial`;
  let offset = 10 * scaleFactor;
  canvasCtx.fillText(`${faceAttr.gender} (${faceAttr.age})`, face.faceRectangle.left, face.faceRectangle.top - offset);
}