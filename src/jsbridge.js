import os from './browser'
var isIos = os === 'iOS'
var isAndroid = os === 'android'
// 这段代码是固定的，必须要放到js中
function setupWebViewJavascriptBridge(callback) {
  // console.log(`>>>>>>os: ${os}, setupWebViewJavascriptBridge`)
  // Android
  if (isAndroid) {
    if (window.WebViewJavascriptBridge) {
      callback(window.WebViewJavascriptBridge)
    } else {
      document.addEventListener(
        'WebViewJavascriptBridgeReady',
        function() {
          callback(window.WebViewJavascriptBridge)
        },
        false
      )
    }
  } else if (isIos) {
    // iOS
    if (window.WebViewJavascriptBridge) {
      return callback(window.WebViewJavascriptBridge)
    }

    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback)
    }

    window.WVJBCallbacks = [callback]
    var WVJBIframe = document.createElement('iframe')
    WVJBIframe.style.display = 'none'
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__'
    document.documentElement.appendChild(WVJBIframe)
    setTimeout(function() {
      document.documentElement.removeChild(WVJBIframe)
    }, 0)
  }
}
// js调用原生方法
export function appInvoked(name, params, cb, errcb) {
  if (typeof params === 'object') {
    params = JSON.stringify(params)
  } else {
    try {
      params = eval('(' + params + ')')
      if (typeof params === 'object') {
        params = JSON.stringify(params)
      }
    } catch (e) {
      console.log(e)
    }
  }
  if (window.WebViewJavascriptBridge && window.WebViewJavascriptBridge.callHandler) {
    window.WebViewJavascriptBridge.callHandler(name, params, function(res) {
      try {
        res = JSON.parse(res)
      } catch (e) {
        console.log(e)
      }
      var code = res.code
      if (code === 'success') {
        cb && cb(res.result)
      } else {
        errcb && errcb(res)
      }
    })
  } else if (isIos || isAndroid) {
    // 如果首次调用时候webviewbridge未能初始化成功，需要主动再初始化一下
    setupWebViewJavascriptBridge(function() {
      appInvoked(name, params, cb, errcb)
    })
  } else {
    if (name === 'appOpenWebview') {
      window.location.href = JSON.parse(params).url
    }
    console.log('请在APP内调用' + name + params)
  }
}

// 接受原生方法
export function appGetInvoked(name, cb) {
  if (window.WebViewJavascriptBridge && window.WebViewJavascriptBridge.callHandler) {
    window.WebViewJavascriptBridge.registerHandler(name, cb)
  } else if (isIos || isAndroid) {
    // 如果首次调用时候webviewbridge未能初始化成功，需要主动再初始化一下
    setupWebViewJavascriptBridge(function(bridge) {
      bridge.registerHandler(name, cb)
    })
  } else {
    console.log('请在APP内调用' + name)
  }
}

setupWebViewJavascriptBridge(function(bridge) {
  appInvoked('appWVJBCompleted', { completed: true })
  var appGetAjaxHeaderSdk = function() {
    bridge.registerHandler('webViewWillDisappear', function() {})

    bridge.registerHandler('webViewWillAppear', function() {
      var appAwake = localStorage.getItem('kAppEnterForegroundTime')
      if (needRefreshData(appAwake)) {
        window.location.reload()
      }
      var timestamp = new Date().getTime()
      localStorage.setItem('kAppEnterForegroundTime', timestamp)
    })
  }
  appGetAjaxHeaderSdk(function(data) {
    console.log(data)
  })
})

export function needRefreshData(lasttime) {
  if (!lasttime || lasttime === '') {
    return false
  }
  var timestamp = new Date().getTime()
  var distance = timestamp - lasttime
  distance = distance / (60 * 1000) // 换算成分
  if (distance >= 10) {
    return true
  } else {
    return false
  }
}
