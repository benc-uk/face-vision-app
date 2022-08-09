let colours = ['#0BE3F1', '#F1E30B', '#FC8800', '#11E20C', '#5E98EF', '#D70EF5', '#F20829', '#5EF7CA']

export function randomColor() {
  return colours[Math.floor(Math.random() * Math.floor(colours.length))]
}

export function setCookie(name, value, days) {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

export function getCookie(name) {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export function toggleFullScreen() {
  if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
    if (document.cancelFullScreen) {
      document.cancelFullScreen()
    } else {
      if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else {
        if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        }
      }
    }
  } else {
    const _element = document.documentElement
    if (_element.requestFullscreen) {
      _element.requestFullscreen()
    } else {
      if (_element.mozRequestFullScreen) {
        _element.mozRequestFullScreen()
      } else {
        if (_element.webkitRequestFullscreen) {
          _element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
        }
      }
    }
  }
}

//
// Helper util gets real video element height
//
export function videoDimensions(video) {
  const videoRatio = video.videoWidth / video.videoHeight
  let width = video.offsetWidth
  let height = video.offsetHeight
  const elementRatio = width / height
  if (elementRatio > videoRatio) {
    width = height * videoRatio
  } else {
    height = width / videoRatio
  }

  return {
    width,
    height,
  }
}

//
// Show a toast message
//
export function showToast(msg) {
  const snackbar = document.getElementById('toast')
  snackbar.innerHTML = msg
  snackbar.className = 'show'
  setTimeout(function () {
    snackbar.className = snackbar.className.replace('show', '')
  }, 3000)
}

export function redText(msg, canvasCtx, canvasScale, overlay) {
  canvasCtx.shadowColor = '#000000'
  canvasCtx.shadowOffsetX = 3 * canvasScale
  canvasCtx.shadowOffsetY = 3 * canvasScale
  canvasCtx.fillStyle = '#ff0000'
  canvasCtx.font = `${50 * canvasScale}px Arial`
  canvasCtx.fillText(msg, overlay.width / 2 - canvasCtx.measureText(msg).width / 2, overlay.height / 2)
}
