import { randomColor } from './utils.mjs'
import { showDetail, overlay, canvasScale, showError } from './app.mjs'
import { config } from '../config.mjs'
let canvasCtx

//
// Analyze an image for content with cognitive service API
// Image is passed as a blob from app.js
//

const API_OPTIONS =
  'visualFeatures=Color,Brands,Categories,Faces,Tags,Description,Objects&details=Celebrities,Landmarks'

export function analyzePhotoVision(blob) {
  const apiUrl = `https://${config.VISION_API_ENDPOINT}/vision/v2.1/analyze?${API_OPTIONS}`
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': config.VISION_API_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: blob,
  })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response.json()
    })
    .then((data) => {
      //console.dir(data)
      // Clear the canvas!
      canvasCtx = overlay.getContext('2d')
      canvasCtx.clearRect(0, 0, overlay.width, overlay.height)
      canvasCtx.shadowColor = '#000000'
      canvasCtx.shadowOffsetX = 4 * canvasScale
      canvasCtx.shadowOffsetY = 4 * canvasScale
      canvasCtx.textAlign = 'start'

      // Show caption text
      if (data.description.captions[0]) {
        let fs = 35 * canvasScale
        canvasCtx.fillStyle = '#fff'
        canvasCtx.font = `${fs}px Arial`
        canvasCtx.fillText(data.description.captions[0].text, 10, fs)
      }

      // Find & draw faces (age and gender)
      if (data.faces) {
        for (let face of data.faces) {
          let r = face.faceRectangle
          visionItemBox(r.left, r.top, r.width, r.height, `${face.gender} (${face.age})`)
        }
      }

      // Find and draw any objects
      if (data.objects) {
        for (let obj of data.objects) {
          let r = obj.rectangle
          visionItemBox(r.x, r.y, r.w, r.h, `${obj.object}`)
        }
      }

      // Find & draw brands
      if (data.brands) {
        for (let brand of data.brands) {
          let r = brand.rectangle
          visionItemBox(r.x, r.y, r.w, r.h, `${brand.name}`)
        }
      }

      if (!showDetail) return

      // Get top 5 tags and confidence score
      if (data.tags) {
        let t = 0
        let fs = 35 * canvasScale
        for (let tag of data.tags) {
          if (t++ > 4) break
          canvasCtx.fillStyle = '#fff'
          canvasCtx.font = `${fs}px Arial`
          canvasCtx.fillText(
            `${tag.name} (${parseFloat(tag.confidence * 100).toFixed(1)}%)`,
            10,
            (t + 3) * (fs * 2.2) * canvasScale
          )
        }
      }

      // Other tags, this is a long list so join as a string
      if (data.description.tags) {
        let fs = 30 * canvasScale
        canvasCtx.textAlign = 'end'
        for (let t = 0; t <= 7; t++) {
          canvasCtx.fillStyle = '#fff'
          canvasCtx.font = `${30 * canvasScale}px Arial`
          canvasCtx.fillText(data.description.tags[t], overlay.width - 10, (t + 2) * (fs * 2.2) * canvasScale)
        }
      }

      // Get colours
      if (data.color && data.color.dominantColors) {
        let fs = 30 * canvasScale
        canvasCtx.textAlign = 'end'
        for (let c = 0; c < data.color.dominantColors.length; c++) {
          canvasCtx.fillStyle = '#fff'
          canvasCtx.font = `${30 * canvasScale}px Arial`
          canvasCtx.fillText(data.color.dominantColors[c], overlay.width - 10, (c + 14) * (fs * 2.2) * canvasScale)
        }
      }

      /*
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
      }*/
    })
    .catch((err) => {
      showError(err)
    })
}

//
// Draw a box around a "thing" (face, object etc)
//
function visionItemBox(left, top, width, height, label) {
  const color = randomColor()

  canvasCtx.strokeStyle = color
  canvasCtx.fillStyle = color
  canvasCtx.lineWidth = 6 * canvasScale
  canvasCtx.beginPath()
  canvasCtx.rect(left, top, width, height)
  canvasCtx.stroke()
  canvasCtx.font = `${40 * canvasScale}px Arial`
  const offset = 10 * canvasScale
  const labelY = top - offset
  if (top < 30) {
    labelY = top + height + offset * 3
  }
  canvasCtx.fillText(label, left, labelY)
}
