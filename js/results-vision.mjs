import { randomColor } from './utils.mjs';
import { canvas, output, spinner, canvasScale, showError } from './app.mjs';
import { config } from '../config.mjs';

//
// Analyze an image for content with cognitive service API
// Image is passed as a blob from app.js
//

const API_OPTIONS = 'visualFeatures=Color,Brands,Categories,Faces,Tags,Description,Objects&details=Celebrities,Landmarks'

export function analyzePhotoVision(blob) { 
  let apiUrl = `https://${config.VISION_API_ENDPOINT}/vision/v2.1/analyze?${API_OPTIONS}`
  fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.VISION_API_KEY,
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

      // Find & draw faces (age and gender)
      if(data.faces) {
        for(let face of data.faces) {
          let r = face.faceRectangle;
          visionItemBox(r.left, r.top, r.width, r.height, `${face.gender} (${face.age})`)
        }
      }

      // Find and draw any objects
      if(data.objects) {
        for(let obj of data.objects) {
          let r = obj.rectangle;
          visionItemBox(r.x, r.y, r.w, r.h, `${obj.object}`)
        }
      }

      // Find & draw brands
      if(data.brands) {
        for(let brand of data.brands) {
          let r = brand.rectangle;
          visionItemBox(r.x, r.y, r.w, r.h, `${brand.name}`)
        }
      }

      // Show caption text
      if(data.description.captions) {
        for(let caption of data.description.captions) {
          table.innerHTML += `<tr><td>Caption:</td><td>${caption.text}</td></tr>`
        }
      }

      // Get top 5 tags and confidence score
      if(data.tags) {
        let t = 0;
        for(let tag of data.tags) {
          if(t++ > 4) break;
          table.innerHTML += `<tr><td>${tag.name}:</td><td>${parseFloat(tag.confidence * 100).toFixed(3)+"%"}</td></tr>`
        }
      }

      // Get colours
      if(data.color && data.color.dominantColors) {
        let colourList = data.color.dominantColors.join(', ');
        table.innerHTML += `<tr><td>Colours:</td><td>${colourList}</td></tr>`
      }

      // Other tags, this is a long list so join as a string
      if(data.description.tags) {
        let tagList = data.description.tags.join(', ');
        table.innerHTML += `<tr><td>Tags:</td><td>${tagList}</td></tr>`
      }

      // Categories hold some info and celebrities if they are detected
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
      spinner.style.display = 'none';
    })
    .catch(err => {
      showError(err);
    })

    
}

//
// Draw a box around a "thing" (face, object etc)
//
function visionItemBox(left, top, width, height, label) {
  let color = randomColor();
  let canvasCtx = canvas.getContext('2d');

  canvasCtx.strokeStyle = color;
  canvasCtx.fillStyle = color;
  canvasCtx.shadowColor = "#000000"
  canvasCtx.shadowOffsetX = 4 * canvasScale;
  canvasCtx.shadowOffsetY = 4 * canvasScale;
  canvasCtx.lineWidth = 6 * canvasScale;
  canvasCtx.beginPath();
  canvasCtx.rect(left, top, width, height);
  canvasCtx.stroke();
  canvasCtx.font = `${40 * canvasScale}px Arial`;
  let offset = 10 * canvasScale;
  let labelY = top - offset
  if(top < 30) {
    labelY = top + height + (offset * 3)
  }
  canvasCtx.fillText(label, left, labelY);
}