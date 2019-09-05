// import isNaN from 'window.$lodash/isNaN'
// import isNumber from 'window.$lodash/isNumber'
// import isBoolean from 'window.$lodash/isBoolean'
// import isEmpty from 'window.$lodash/isEmpty'
// import startsWith from 'window.$lodash/startsWith'
// import window.$lodash from 'window.$lodash'
import os from './browser'
import { appGetInvoked, appInvoked, needRefreshData, setupWebViewJavascriptBridge } from './jsbridge'

var Tools = Object.create(null)

Tools.install = function (Vue) {
  Vue.prototype.$tools = {
    /**
     * 非空判断
     * @param arg
     * @returns {boolean}
     */
    isNotEmpty: function (arg) {
      if (!window.$lodash.isNaN(arg) && window.$lodash.isNumber(arg)) {
        return true
      } else if (window.$lodash.isBoolean(arg)) {
        return true
      }
      return !window.$lodash.isEmpty(arg)
    },
    /**
     * object 转 URL 参数
     * {id:1, name:123} => '?id=1&name=123'
     * @param obj     参数对象
     * @param encode  是否需要编码 默认编码
     * @returns {string}
     */
    objParamsToString: function (obj, encode) {
      if (!this.isNotEmpty(obj)) return ''
      var url = '?'
      for (var key in obj) {
        if (obj[key] !== null) {
          var val = encode ? encodeURIComponent(obj[key]) : obj[key]
          url += key + '=' + val + '&'
        }
      }
      return url.substring(0, url.lastIndexOf('&'))
    },
    /**
     * 是否为对象
     * @param arg
     * @returns {boolean}
     */
    isObject: function (arg) {
      var type = typeof arg
      return arg != null && (type === 'object' || type === 'function')
    },
    /**
     * 添加base64需要的头部分
     * @param  {String} base64Str 后端返回的数据
     * @return {String}           显示的图片
     */
    getBase64: function (base64Str) {
      if (window.$lodash.isEmpty(base64Str)) return base64Str
      if (!window.$lodash.startsWith(base64Str, 'http://') && !window.$lodash.startsWith(base64Str, 'https://')) {
        base64Str = 'data:image/jpeg;base64,' + base64Str
      }
      return base64Str
    },
    /**
     * 获取系统版本
     * @returns {string}
     */
    getBrowser: function () {
      return os
    }
  }
  // 注册jsbrige方法
  Vue.prototype.$appInvoked = appInvoked
  Vue.prototype.$appGetInvoked = appGetInvoked
  // 刷新机制
  Vue.prototype.$needRefreshData = needRefreshData

  // 自动初始化jsBridge
  setupWebViewJavascriptBridge(function (bridge) {
    appInvoked('appWVJBCompleted', { completed: true })
    var appGetAjaxHeaderSdk = function () {

      bridge.registerHandler('webViewWillAppear', function () {
        var appAwake = localStorage.getItem('kAppEnterForegroundTime')
        if (needRefreshData(appAwake)) {
          window.location.reload()
        }
        var timestamp = new Date().getTime()
        localStorage.setItem('kAppEnterForegroundTime', timestamp)
      })
    }
    appGetAjaxHeaderSdk(function (data) {
      console.log(data)
    })
  })
}
export default Tools
