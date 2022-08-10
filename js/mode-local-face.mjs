import { randomColor, redText, showToast } from './utils.mjs'
import { canvasScale, showError, overlay, video, showEmoji } from './app.mjs'
let firstDetection = true

//
// Analyze an image for faces with face-api.js
// Image is fetched directly from the video element
//
export async function analyzeFaceTensorflow() {
  try {
    if (firstDetection) {
      showToast(`First detection can take several seconds`)
    }

    let detections = await faceapi.detectAllFaces(video).withFaceExpressions().withAgeAndGender()

    detections = faceapi.resizeResults(detections, {
      width: overlay.width,
      height: overlay.height,
    })

    firstDetection = false

    // Fetch the canvas and clear it
    let canvasCtx = overlay.getContext('2d')
    canvasCtx.clearRect(0, 0, overlay.width, overlay.height)

    if (detections.length <= 0) {
      // Show a message if no faces are found
      redText('No faces found!', canvasCtx, canvasScale, overlay)
      return
    }

    for (let face of detections) {
      processFaceResult(face, canvasCtx)
    }
  } catch (err) {
    showError(err)
  }
}

//
// Display face information with table of details and box around the face
//
function processFaceResult(face, canvasCtx) {
  let color = randomColor({ luminosity: 'light' })

  // Face boxes
  canvasCtx.textAlign = 'start'
  canvasCtx.textBaseline = 'bottom'
  canvasCtx.strokeStyle = color
  canvasCtx.fillStyle = color
  canvasCtx.shadowColor = '#000000'
  canvasCtx.shadowOffsetX = 3 * canvasScale
  canvasCtx.shadowOffsetY = 3 * canvasScale
  canvasCtx.lineWidth = 6 * canvasScale
  canvasCtx.beginPath()
  canvasCtx.rect(face.detection.box.x, face.detection.box.y, face.detection.box.width, face.detection.box.height)
  canvasCtx.stroke()

  // Box title
  canvasCtx.font = `${30 * canvasScale}px Arial`
  let offset = 10 * canvasScale
  canvasCtx.fillText(
    `${face.gender} (${Math.floor(face.age)})`,
    face.detection.box.left,
    face.detection.box.top - offset
  )

  canvasCtx.textAlign = 'start'
  canvasCtx.font = `${20 * canvasScale}px Arial`
  let emoLine = 5
  let topEmoName = ''
  let topEmoValue = 0
  for (let emo in face.expressions) {
    let emoValue = face.expressions[emo]
    if (emoValue > 0.01) {
      if (emoValue > topEmoValue) {
        topEmoValue = emoValue
        topEmoName = emo
      }
      canvasCtx.fillText(
        `${parseFloat(emoValue * 100).toFixed(1)}% ${emo}`,
        face.detection.box.left + face.detection.box.width + offset,
        face.detection.box.top + offset * emoLine
      )
      emoLine += 3
    }
  }

  if (showEmoji) {
    canvasCtx.shadowOffsetX = 0
    canvasCtx.shadowOffsetY = 0
    const emojiFace = new Image()

    // Assume faces are more high than wide (portrait)
    offset = (face.detection.box.height - face.detection.box.width) / 2
    emojiFace.onload = () =>
      canvasCtx.drawImage(
        emojiFace,
        face.detection.box.left,
        face.detection.box.top + offset,
        face.detection.box.width,
        face.detection.box.width
      )

    emojiFace.src = `img/emo/${topEmoName}.svg`
  }
}
