

  document.getElementById('file').addEventListener('change', evt => {
    let file = evt.target.files[0];
    if (file) {
      if (/^image\//i.test(file.type)) {
        processFile(file);
      } else {
        alert('Not a valid image!');
      }
    }
  });
  
  var ctx;
  var scaleFactor;

  function processFile(file) {
    document.querySelector('#spinner').classList.remove('hidden');
    document.querySelector('#output').innerHTML = "";
    document.querySelector('#photoCanvas').classList.add('hidden');
    document.querySelector('#photobutton').classList.add('hidden');

    var previewImg = document.querySelector('#photo');
    var previewReader = new FileReader();

    // Display the file
    previewReader.readAsDataURL(file);

    // When readAsDataURL is completed, update the src of the img with the result
    previewReader.addEventListener("load", function () {
      previewImg.src = previewReader.result;
    }, false);

    // When the src attribute of the image changes, draw img as a canvas istead
    previewImg.addEventListener("load", function () {
      let canvas = document.querySelector('#photoCanvas')
      canvas.width = previewImg.width;
      canvas.height = previewImg.height;
      
      scaleFactor = Math.max(canvas.width / 2000, 0.5);

      ctx = canvas.getContext('2d');
      ctx.drawImage(previewImg, 0, 0, previewImg.width, previewImg.height, 0, 0, previewImg.width, previewImg.height);

      // This CSS magic scales the canvas to a nice maximum height
      canvas.style.maxHeight = '60vh';
      canvas.style.maxWidth = '95%';

      // We remove the image
      previewImg.style.display = "none"
    });

    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
        'Content-Type': 'application/octet-stream'
      },
      body: file
    })
    .then(response => {
      if(!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if(!data || data.length < 1) {
        document.querySelector('#spinner').classList.add('hidden');
        document.querySelector('#photoCanvas').classList.add('hidden');
        document.querySelector('#output').innerHTML = "No faces detected in that photo 😕<br>Please try again!<br>";
        document.querySelector('#photobutton').classList.remove('hidden');
        return;
      }

      let faceNum = 0;
      for(let face of data) {
        processFace(face, ++faceNum)
      }

      document.querySelector('#spinner').classList.add('hidden');
      document.querySelector('#photoCanvas').classList.remove('hidden');
      document.querySelector('#photobutton').classList.remove('hidden');
    })
    .catch(error => {
      document.querySelector('#spinner').classList.add('hidden');
      document.querySelector('#photoCanvas').classList.add('hidden');
      document.querySelector('#photobutton').classList.remove('hidden');
      document.querySelector('#output').innerHTML = "😖 Something whent wrong!<br>" + error.toString() + "<br><br>";
    });
  }

  function processFace(face, faceNum) {
    let color = randomColor({luminosity: 'light'});

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