//
// Change these values
//
export const config = {
  // This is how often the video is captured and sent to the API in millisec
  // - Warning! Low values will result in very high API usage and potentially costs
  // - Values below 1000 are likely to cause errors & timeouts
  // - Set to zero to disable realtime capture, users will need to tap to trigger
  REFRESH_EVERY: 3000,
    
  FACE_API_ENDPOINT: "{{CHANGE_ME}}",
  FACE_API_KEY: "{{CHANGE_ME}}",

  VISION_API_ENDPOINT: "{{CHANGE_ME}}",
  VISION_API_KEY: "{{CHANGE_ME}}"
}