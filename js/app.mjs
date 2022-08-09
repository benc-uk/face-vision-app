import { analyzePhotoFace } from './results-face.mjs'
import { analyzePhotoFaceTensorflow } from './results-face-tf.mjs'
import { analyzePhotoVision } from './results-vision.mjs'
import { setCookie, getCookie, toggleFullScreen, videoDimensions, showToast } from './utils.mjs'

import { config } from '../config.mjs'

const VERSION = '0.6.0'
export const dialog = document.querySelector('#dialog')
export const offscreen = document.querySelector('#offscreen')
export const overlay = document.querySelector('#overlay')
export const video = document.querySelector('video')

const main = document.querySelector('#main')
const butModeSel = document.querySelector('#modeselect')
const butCamSel = document.querySelector('#camselect')
const butFullscreen = document.querySelector('#fullscreen')
const butEmoji = document.querySelector('#emoji')

export let canvasScale // Used to scale any drawing done
export let showDetail = true // Show more detail and face emojis
let selectedDevice = 0 // Currently selected camera id
let deviceIds = [] // List of all cameras (device ids)
let apiMode // Either 'face-tf', 'face-az' or 'vision'
let active = true // Don't process video or call API when inactive
let vidDim = { width: 0, height: 0 } // Video size
let intervalHandle // Id of the setInterval to refresh the view
export let showEmoji = false

//
// Handle resize and rotate events
//
window.addEventListener('resize', resizeOrRotateHandler)

//
// Start here!
//
window.addEventListener('load', async (evt) => {
  console.log(config)

  // Set starting API mode either stored as cookie or fallback to default
  setApiMode(getCookie('mode') ? getCookie('mode') : 'face-tf')

  //await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
  await faceapi.nets.faceExpressionNet.loadFromUri('/models')
  await faceapi.nets.ageGenderNet.loadFromUri('/models')

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  if (isSafari) {
    // Call unconstrained getUserMedia first to get past permissions issue on Safari
    await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
    listDevices()
  } else {
    listDevices()
  }

  if (getCookie('firstRun') !== 'false') {
    showHelp()
  }
})

//
// Call mediaDevices.enumerateDevices and populate deviceIds array and selectedDevice
//
async function listDevices() {
  try {
    // Now list all devices
    const deviceList = await navigator.mediaDevices.enumerateDevices()

    for (let deviceInfo of deviceList) {
      // Only care about cameras
      if (deviceInfo.kind === 'videoinput') {
        // Skip infrared camera
        if (deviceInfo.label && deviceInfo.label.toLowerCase().includes(' ir ')) continue
        // Store id in array for later use
        deviceIds.push(deviceInfo.deviceId)
      }
    }
    selectedDevice = getCookie('selectedDevice') ? getCookie('selectedDevice') : 0

    // Now we have selected device, open it
    openCamera()
  } catch (err) {
    showError(err)
  }
}

//
// Open media stream for camera with id selectedDevice
//
async function openCamera() {
  if (intervalHandle) {
    clearInterval(intervalHandle)
  }

  let constraints = {
    video: { deviceId: selectedDevice },
  }

  try {
    // Get the camera stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    // Display the video, by attaching the stream to the video element
    video.srcObject = stream

    butCamSel.style.display = 'block'
    butModeSel.style.display = 'block'
    butFullscreen.style.display = 'block'
    butEmoji.style.display = 'block'

    // Set up timers for capturing frames and processing them
    if (apiMode == 'face-tf') {
      intervalHandle = setInterval(captureImage, config.TF_REFRESH_RATE)
    } else {
      intervalHandle = setInterval(captureImage, config.AZURE_REFRESH_RATE)
    }

    // Handle the screen (re)sizing
    resizeOrRotateHandler()
  } catch (err) {
    showError(
      `${err.toString()} <br>
      Make sure you accept camera permissions <br>
      <a href='javascript:location.reload()'>Try reloading page</a>`
    )
  }
}

video.addEventListener('playing', (evt) => {
  captureImage()
})

//
// Disable capture when out of focus and not visible
//
document.addEventListener('visibilitychange', (evt) => {
  if (document.visibilityState === 'visible') {
    active = true
    video.play()
    showToast(`📷 Resuming image capture`)
  } else {
    active = false
    video.pause()
  }
})

window.addEventListener('blur', (evt) => {
  active = false
  showToast(`💤 Pausing image capture`)
  video.pause()
})

window.addEventListener('focus', (evt) => {
  active = true
  video.play()
  showToast(`📷 Resuming image capture`)
})

//
// Deals with landscape/portrait hassles with video object
//
function resizeOrRotateHandler() {
  if (window.innerWidth > window.innerHeight) {
    main.style.width = '100%'
    main.style.height = '95%'
    video.style.width = '100%'
    video.style.height = '100%'
  } else {
    main.style.width = '95%'
    main.style.height = null
    video.style.width = '100%'
    video.style.height = null
  }
}

//
// Button event handler: Change selected camera
//
butCamSel.addEventListener('click', (evt) => {
  selectedDevice = ++selectedDevice % deviceIds.length
  showToast(`📽️ Changing to camera device: ${selectedDevice}`)
  setCookie('selectedDevice', selectedDevice, 3000)
  openCamera()
})

//
// Button event handler: Change API mode
//
butModeSel.addEventListener('click', (evt) => {
  let modeList = ['face-tf']
  if (config.FACE_API_ENDPOINT !== '') modeList.push('face-az')
  if (config.VISION_API_ENDPOINT !== '') modeList.push('vision')

  let modeIndex = modeList.findIndex((e) => e === apiMode)
  setApiMode(modeList[(modeIndex + 1) % modeList.length])

  if (apiMode == 'face-az' || apiMode == 'vision') {
    if (intervalHandle) {
      clearInterval(intervalHandle)
    }
    intervalHandle = setInterval(captureImage, config.AZURE_REFRESH_RATE)
  }

  if (apiMode == 'face-tf') {
    if (intervalHandle) {
      clearInterval(intervalHandle)
    }
    intervalHandle = setInterval(captureImage, config.TF_REFRESH_RATE)
  }

  captureImage()
})

//
// Toggle fullscreen mode
//
butFullscreen.addEventListener('click', () => {
  showToast(`📺 Switching to/from fullscreen`)
  toggleFullScreen()
})

//
// Toggle emoji mode
//
butEmoji.addEventListener('click', () => {
  showEmoji = !showEmoji
  showToast(`${showEmoji ? '👍 Enabled' : '👎 Disabled'} emoji overlay`)
  if (showEmoji) {
    butEmoji.firstChild.classList.remove('far')
    butEmoji.firstChild.classList.add('fas')
  } else {
    butEmoji.firstChild.classList.remove('fas')
    butEmoji.firstChild.classList.add('far')
  }
})

//
// Capture on tap or click of the video
//
video.addEventListener('click', captureImage)
overlay.addEventListener('click', captureImage)

//
// Capture from video, draw into canvas and send to API
//
function captureImage() {
  if (!active) return

  // Handles resizing and first time loaded
  // Sizes the video, offscreen canvas and overlay canvas
  let newVidDim = videoDimensions(video)
  if (newVidDim.width != vidDim.width || newVidDim.height != vidDim.height) {
    vidDim = newVidDim

    offscreen.width = vidDim.width
    offscreen.height = vidDim.height
    canvasScale = Math.max(vidDim.width / 1500, 0.7)
    if (window.devicePixelRatio > 1) canvasScale /= window.devicePixelRatio / 2

    // Place overlay exactly over video
    overlay.width = vidDim.width
    overlay.height = vidDim.height
    overlay.style.top = `${video.offsetTop}px`
    overlay.style.left = `${window.innerWidth / 2 - vidDim.width / 2}px`
  }

  // Render the video frame to the hidden canvas
  offscreen.getContext('2d').drawImage(video, 0, 0, vidDim.width, vidDim.height)

  // For Azure APIs convert canvas to a blob and process with the selected API
  if (apiMode == 'vision') offscreen.toBlob(analyzePhotoVision, 'image/jpeg')
  if (apiMode == 'face-az') {
    offscreen.toBlob((blob) => {
      analyzePhotoFace(blob)
    }, 'image/jpeg')
  }

  // For local Tensorflow model
  if (apiMode == 'face-tf') analyzePhotoFaceTensorflow(showEmoji)
}

//
// Toggle between API modes
//
function setApiMode(newMode) {
  apiMode = newMode
  if (apiMode == 'vision') {
    showToast(`🖼️ Using image recognition with Azure Vision API`)
    butModeSel.innerHTML = '<i class="fas fa-image fa-fw"></i>'
    butEmoji.style.visibility = 'hidden'
  }
  if (apiMode == 'face-tf') {
    showToast(`😃 Using face recognition with local Tensorflow models`)
    butModeSel.innerHTML = '<i class="fas fa-project-diagram fa-fw"></i>'
    butEmoji.style.visibility = 'visible'
  }
  if (apiMode == 'face-az') {
    showToast(`🙃 Using face recognition with Azure Face API`)
    butModeSel.innerHTML = '<i class="fas fa-cloud fa-fw"></i>'
    butEmoji.style.visibility = 'visible'
  }
  setCookie('mode', apiMode, 3000)
}

//
// Display error message of some kind
//
export function showError(err) {
  dialog.style.display = 'block'
  dialog.innerHTML = `<span class="error">A bad thing happened 😥 <br><br> ${err.toString()}</span>`
}

//
// Display about/help only shown once at first start
//
function showHelp() {
  dialog.style.display = 'block'
  dialog.innerHTML = `<b>Azure Cognitive Services Demo v${VERSION}</b><br>
  <ul>
    <li>Click the camera icon to switch between cameras</li>
    <li>The face/image button switches between recognition modes</li>
  </ul>
  This app will send images from your camera to the cloud & use Azure Cognitive Services APIs to analyse the contents.<br><a href="https://azure.microsoft.com/en-gb/support/legal/cognitive-services-terms/">In doing so you agree to these terms</a>
  <br><br>
  &copy; Ben Coleman 2020<br>
  <a href="https://github.com/benc-uk/face-api-app">github.com/benc-uk/cognitive-demo</a> `
  setCookie('firstRun', 'false', 3000)
}
