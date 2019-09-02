import Tools from './src/tools'
import ToolsManual from './src/toolsManual'
import ErrorCatch from './src/errorCatch'
import ErrorResource from './src/errorResource'
import XhrHook from './src/xhrHook'
export default {
  Tools, // 自动初始化jsBridge
  ToolsManual, // 手动初始化jsBridge，用于需在jsBridge初始化完成后添加回调（例如：金融超市）
  ErrorCatch,
  ErrorResource,
  XhrHook
}
