import { App } from 'vue'
import registerElementDirectives from './element-directives'
import registerMouseDirectives from './mouse-directives'

export default function registerDirectives(app: App) {
  registerElementDirectives(app)
  registerMouseDirectives(app)
}
