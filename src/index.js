import lodash from 'lodash'
import getDevice from './browser'
import Tools from './tools'
import ToolsManual from './toolsManual'
import ErrorCatch from './errorCatch'
import ErrorResource from './errorResource'
import XhrHook from './xhrHook'
import resources from './resources'
import perf from './perf'
// 暴露lodash
window.$lodash = lodash
export default {
  Tools, // 自动初始化jsBridge
  ToolsManual, // 手动初始化jsBridge，用于需在jsBridge初始化完成后添加回调（例如：金融超市）
  ErrorCatch,
  ErrorResource,
  resources,
  perf,
  XhrHook,
  getDevice
}
