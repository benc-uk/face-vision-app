let colours = [
  "#0BE3F1",
  "#F1E30B",
  "#FC8800",
  "#11E20C",
  "#5E98EF",
  "#D70EF5",
  "#F20829", 
  "#5EF7CA"
]

export function randomColor() {
  return colours[Math.floor(Math.random() * Math.floor(colours.length))]
}

export function setCookie(name, value, days) {
  var expires = ""
  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = "; expires=" + date.toUTCString()
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/"
}

export function getCookie(name) {
  var nameEQ = name + "="
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
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
  var videoRatio = video.videoWidth / video.videoHeight
  var width = video.offsetWidth, height = video.offsetHeight
  var elementRatio = width / height
  if(elementRatio > videoRatio) 
    width = height * videoRatio
  else 
    height = width / videoRatio
  
  return {
    width: width,
    height: height
  }
}

//
// Show a toast message
//
export function showToast(msg) {
  var snackbar = document.getElementById("toast")
  snackbar.innerHTML = msg
  snackbar.className = "show"
  setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000)
}