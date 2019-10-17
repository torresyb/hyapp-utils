let perf = {
  init: cb => {
    let cycleFreq = 100 // 循环轮询的时间
    let performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance

    let Util = {
      addEventListener: function (name, callback, useCapture) {
        if (window.addEventListener) {
          return window.addEventListener(name, callback, useCapture)
        } else if (window.attachEvent) {
          return window.attachEvent('on' + name, callback)
        }
      },

      onload: function (callback) {
        let timer = null

        if (document.readyState === 'complete') {
          runCheck()
        } else {
          Util.addEventListener(
            'load',
            function () {
              runCheck()
            },
            false
          )
        }

        function runCheck () {
          if (performance.timing.loadEventEnd) {
            clearTimeout(timer)
            callback()
          } else {
            timer = setTimeout(runCheck, cycleFreq)
          }
        }
      },
    }

    let reportPerf = function () {
      if (!performance) {
        return void 0
      }

      // 过滤无效数据；
      function filterTime (a, b) {
        return parseInt(a > 0 && b > 0 && a - b >= 0 ? a - b : -1)
      }

      /**
       * 各个参数的含义
       * http://javascript.ruanyifeng.com/bom/performance.html
       */

      let timing = performance.timing

      let perfData = {
        route: location.href,
        // 网络建连
        pervPage: filterTime(timing.fetchStart, timing.navigationStart), // 上一个页面到本页面时间
        redirect: filterTime(timing.redirectEnd, timing.redirectStart), // 页面重定向时间
        dns: filterTime(timing.domainLookupEnd, timing.domainLookupStart), // DNS查找时间
        tcp: filterTime(timing.connectEnd, timing.connectStart), // TCP建连时间
        network: filterTime(timing.connectEnd, timing.navigationStart), // 网络建连总耗时

        // 网络接收
        send: filterTime(timing.responseStart, timing.requestStart), // 前端从发送到接收到后端第一个返回
        receive: filterTime(timing.responseEnd, timing.responseStart), // 接受页面时间
        request: filterTime(timing.responseEnd, timing.requestStart), // 请求到完全接受页面总时间

        // 前端渲染
        dom: filterTime(timing.domInteractive, timing.domLoading), // dom解析时间(不包含dom内嵌资源加载时间)
        loadEvent: filterTime(timing.loadEventEnd, timing.loadEventStart), // loadEvent时间
        frontend: filterTime(timing.loadEventEnd, timing.domLoading), // 前端总时间

        // 关键阶段
        load: filterTime(timing.loadEventEnd, timing.navigationStart), // 页面完全加载总时间
        domReady: filterTime(timing.domComplete, timing.domInteractive), // dom加载时间(不包含dom解析时间)
        interactive: filterTime(timing.domContentLoadedEventEnd, timing.navigationStart), // 可操作的时间(可触发点击事件等等)
        ttfb: filterTime(timing.responseStart, timing.navigationStart), // 白屏时间(从页面进来到读取页面第一个字节的耗时)
      }

      return perfData
    }

    Util.onload(function () {
      let perfData = reportPerf('onload')
      perfData.type = 'onload'
      cb(perfData)
    })
  },
}

export default perf
