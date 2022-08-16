import { randomColor, redText } from './utils.mjs'
import { overlay, canvasScale, showError } from './app.mjs'
import { config } from './app.mjs'

const API_OPTIONS = 'returnFaceAttributes=' //age,gender,smile,facialHair,glasses,emotion,hair,makeup'

//
// Analyze an image for faces with cognitive service API
// Image is passed as a blob from app.js
//
export async function analyzeFaceAzure(blob) {
  const apiUrl = `${config.FACE_API_ENDPOINT}/face/v1.0/detect?${API_OPTIONS}`

  try {
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.FACE_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: blob,
    })

    if (!resp.ok) {
      throw new Error(`API error ${resp.status} ${resp.statusText}`)
    }

    const data = await resp.json()
    if (data) {
      // Fetch the canvas and clear it
      let canvasCtx = overlay.getContext('2d')
      canvasCtx.clearRect(0, 0, overlay.width, overlay.height)

      // Show a message if no faces are found
      if (data.length <= 0) {
        redText('No faces found!', canvasCtx, canvasScale, overlay)
        return
      }

      // Process each face
      for (let face of data) {
        processFaceResult(face, canvasCtx)
      }
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
  canvasCtx.rect(face.faceRectangle.left, face.faceRectangle.top, face.faceRectangle.width, face.faceRectangle.height)
  canvasCtx.stroke()

  // Box title
  canvasCtx.font = `${30 * canvasScale}px Arial`
  let offset = 10 * canvasScale
  const title = `A face` //`${faceAttr.gender} (${faceAttr.age})`
  canvasCtx.fillText(title, face.faceRectangle.left, face.faceRectangle.top - offset)

  canvasCtx.fillStyle = '#ff0000'
  canvasCtx.fillText('The Azure Face API now returns only very basic details without age, emotion or gender', 10, 40)

  // AZURE HAS REMOVED NEARLY ALL OF THE ATTRIBUTES FROM THE FACE API!

  /*
  // Face details on left
  canvasCtx.font = `${20 * canvasScale}px Arial`
  let detailsLine = 2
  canvasCtx.textAlign = 'end'

  if (hairColor !== 'None') {
    canvasCtx.fillText(
      `${hairColor} hair`,
      face.faceRectangle.left - offset,
      face.faceRectangle.top + offset * detailsLine
    )
    detailsLine += 3
  }

  if (face.faceAttributes.hair.bald > 0) {
    canvasCtx.fillText(
      `${parseFloat(face.faceAttributes.hair.bald * 100).toFixed(1)}% bald`,
      face.faceRectangle.left - offset,
      face.faceRectangle.top + offset * detailsLine
    )
    detailsLine += 3
  }

  if (face.faceAttributes.hair.beard > 0) {
    canvasCtx.fillText(
      `${parseFloat(face.faceAttributes.facialHair.beard * 100).toFixed(1)}% beard`,
      face.faceRectangle.left - offset,
      face.faceRectangle.top + offset * detailsLine
    )
    detailsLine += 3
  }

  if (faceAttr.makeup.eyeMakeup) {
    canvasCtx.fillText(`eye makeup`, face.faceRectangle.left - offset, face.faceRectangle.top + offset * detailsLine)
    detailsLine += 3
  }

  if (faceAttr.makeup.lipMakeup) {
    canvasCtx.fillText(`lip makeup`, face.faceRectangle.left - offset, face.faceRectangle.top + offset * detailsLine)
  }

  // Emotion on right
  canvasCtx.textAlign = 'start'
  canvasCtx.fillText(
    `${parseFloat(faceAttr.smile * 100).toFixed(1)}% smile`,
    face.faceRectangle.left + face.faceRectangle.width + offset,
    face.faceRectangle.top + offset * 2
  )

  let emoLine = 5
  let topEmoName = ''
  let topEmoValue = 0
  for (let emo in faceAttr.emotion) {
    let emoValue = faceAttr.emotion[emo]
    if (emoValue > 0.01) {
      if (emoValue > topEmoValue) {
        topEmoValue = emoValue
        topEmoName = emo
      }
      canvasCtx.fillText(
        `${parseFloat(emoValue * 100).toFixed(1)}% ${emo}`,
        face.faceRectangle.left + face.faceRectangle.width + offset,
        face.faceRectangle.top + offset * emoLine
      )
      emoLine += 3
    }
  }

  if (showEmoji) {
    canvasCtx.shadowOffsetX = 0
    canvasCtx.shadowOffsetY = 0

    const emojiFace = new Image()
    emojiFace.onload = () =>
      canvasCtx.drawImage(
        emojiFace,
        face.faceRectangle.left,
        face.faceRectangle.top,
        face.faceRectangle.width,
        face.faceRectangle.height
      )

    emojiFace.src = `img/emo/${topEmoName}.svg`
  }
  */
}
