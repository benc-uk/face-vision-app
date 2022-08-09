import { randomColor } from './utils.mjs'
import { showDetail, overlay, canvasScale, showError, video } from './app.mjs'
import { config } from '../config.mjs'
var canvasCtx

export async function analyzePhotoFaceDetect(blob) {
  //var detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
  let detections = await faceapi.detectAllFaces(video).withFaceExpressions().withAgeAndGender()
  detections = faceapi.resizeResults(detections, { width: overlay.width, height: overlay.height })

  // Clear the canvas!
  canvasCtx = overlay.getContext('2d')
  canvasCtx.clearRect(0, 0, overlay.width, overlay.height)

  for (let face of detections) {
    console.log(face)
    //console.log(face.box.left);
    processFaceResult(face)
  }
}

//
// Display face information with table of details and box around the face
//
function processFaceResult(face) {
  let color = randomColor({ luminosity: 'light' })
  let faceAttr = face.faceAttributes

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

  canvasCtx.shadowOffsetX = 0
  canvasCtx.shadowOffsetY = 0
  var emojiFace = new Image()
  emojiFace.onload = () =>
    canvasCtx.drawImage(
      emojiFace,
      face.detection.box.left,
      face.detection.box.top,
      face.detection.box.width,
      face.detection.box.height
    )

  emojiFace.src = `img/emo/${topEmoName}.svg`
}
