//
// Change these values
//
export const config = {
  // Use Azure Cognitive Services, Face API, put endpoint and key here
  // Set endpoint to an empty string to disable this mode
  FACE_API_ENDPOINT: "",
  FACE_API_KEY: "",

  // Use Azure Cognitive Services, Vision API, put endpoint and key here
  // Set endpoint to an empty string to disable this mode  
  VISION_API_ENDPOINT: "",
  VISION_API_KEY: "",

  // This is how often the video is captured and sent to the Azure APIs in millisec
  // - Set to zero to disable realtime capture, users will need to tap to trigger
  // - Low values could result in very high API usage and potentially costs
  // - Values 500 and below will only work on a fast network and will give you a HUGE bill  
  AZURE_REFRESH_RATE: 5000,

  // How often the capture/analysis is done with the local Tensforflow.js models
  // This can be much higher, as no remote API is called and no costs are involved
  TF_REFRESH_RATE: 700    
}