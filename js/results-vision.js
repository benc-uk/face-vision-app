let output = document.querySelector('#output')
var scaleFactor

function analyzePhotoVision(blob) { 
  scaleFactor = Math.max(canvas.width / 2000, 0.5);
  let apiUrl = `https://${VISION_API_ENDPOINT}/vision/v2.1/analyze?visualFeatures=Color,Brands,Categories,Faces,Tags,Description,Objects&details=Celebrities,Landmarks`
  fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': VISION_API_KEY,
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

      output.innerHTML = '<br><table id="outtable"></table>';
      let table = document.querySelector('#outtable');

      if(data.faces) {
        for(let face of data.faces) {
          let r = face.faceRectangle;
          visionItemBox(r.left, r.top, r.width, r.height, `${face.gender} (${face.age})`)
        }
      }

      if(data.objects) {
        for(let obj of data.objects) {
          let r = obj.rectangle;
          visionItemBox(r.x, r.y, r.w, r.h, `${obj.object}`)
        }
      }

      if(data.brands) {
        for(let brand of data.brands) {
          let r = brand.rectangle;
          visionItemBox(r.x, r.y, r.w, r.h, `${brand.name}`)
        }
      }

      if(data.description.captions) {
        for(let caption of data.description.captions) {
          table.innerHTML += `<tr><td>Caption:</td><td>${caption.text}</td></tr>`
        }
      }

      if(data.tags) {
        let t = 0;
        for(let tag of data.tags) {
          if(t++ > 4) break;
          table.innerHTML += `<tr><td>${tag.name}:</td><td>${parseFloat(tag.confidence * 100).toFixed(3)+"%"}</td></tr>`
        }
      }

      if(data.color && data.color.dominantColors) {
        let colourList = data.color.dominantColors.join(', ');
        table.innerHTML += `<tr><td>Colours:</td><td>${colourList}</td></tr>`
      }

      if(data.description.tags) {
        let tagList = data.description.tags.join(', ');
        table.innerHTML += `<tr><td>Tags:</td><td>${tagList}</td></tr>`
      }

      if(data.categories) {
        for(let cat of data.categories) {
          table.innerHTML += `<tr><td>Category:</td><td>${cat.name} ${parseFloat(cat.score * 100).toFixed(1)+"%"}</td></tr>`
          // Special case for celebrities in people_ cat
          if(cat.name == 'people_') {
            if(cat.detail && cat.detail.celebrities) {
              for(let celeb of cat.detail.celebrities) {
                table.innerHTML += `<tr><td>Celebrity:</td><td>${celeb.name} ${parseFloat(celeb.confidence * 100).toFixed(1)+"%"}</td></tr>`
              }
            }
          }
        }
      }

    })
    .catch(err => {
      showError(err);
    })
}

//
//
//
function visionItemBox(left, top, width, height, label) {
  let color = randomColor();
  let canvasCtx = document.querySelector('canvas').getContext('2d');

  canvasCtx.strokeStyle = color;
  canvasCtx.fillStyle = color;
  canvasCtx.shadowColor = "#000000"
  canvasCtx.shadowOffsetX = 4 * scaleFactor;
  canvasCtx.shadowOffsetY = 4 * scaleFactor;
  canvasCtx.lineWidth = 6 * scaleFactor;
  canvasCtx.beginPath();
  canvasCtx.rect(left, top, width, height);
  canvasCtx.stroke();
  canvasCtx.font = `${40 * scaleFactor}px Arial`;
  let offset = 10 * scaleFactor;
  let labelY = top - offset
  if(top < 30) {
    labelY = top + height + (offset * 3)
  }
  canvasCtx.fillText(label, left, labelY);
}