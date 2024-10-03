import baseUtils from './base-functions.ts'
import themeUtils from './theme-functions'
import routerUtils from './router-functions'
import mouseUtils from './mouse-functions.ts'
import piniaUtils from './pinia'
import fileUtils from './file'
import imageUtils from './image'
import videoUtils from './video'
import audioUtils from './audio'
// import { App } from 'vue'

export {
  themeUtils,
  routerUtils,
  mouseUtils,
  baseUtils,
  piniaUtils,
  fileUtils,
  imageUtils,
  audioUtils,
  videoUtils
}

// export default function registerFunctions(app: App) {
//   // app.config.globalProperties.$baseUtils = baseUtils
//   // app.config.globalProperties.$themeUtils = themeUtils
//   // app.config.globalProperties.$routerUtils = routerUtils
//   // app.config.globalProperties.$mouseUtils = mouseUtils
//   // app.config.globalProperties.$piniaUtils = piniaUtils
//   // app.config.globalProperties.$fileUtils = fileUtils
// }
