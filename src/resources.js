
// 过滤无效数据
function filterTime (a, b) {
  return parseInt(a > 0 && b > 0 && a - b >= 0 ? a - b : -1)
}

let resolvePerformanceTiming = timing => {
  let o = {
    route: location.href,
    initiatorType: timing.initiatorType, // 资源类型
    name: timing.name, // 资源名称
    duration: parseInt(timing.duration), // 加载时长
    redirect: filterTime(timing.redirectEnd, timing.redirectStart), // 重定向
    dns: filterTime(timing.domainLookupEnd, timing.domainLookupStart), // DNS解析
    tcp: filterTime(timing.connectEnd, timing.connectStart), // TCP建连
    network: filterTime(timing.connectEnd, timing.startTime), // 网络建连总耗时

    send: filterTime(timing.responseStart, timing.requestStart), // 前端从发送到接收到后端第一个返回
    receive: filterTime(timing.responseEnd, timing.responseStart), // 接收资源总时间
    request: filterTime(timing.responseEnd, timing.requestStart), // 请求到完全接受资源总时间
  }

  return o
}

let resolveEntries = entries => entries.map(item => resolvePerformanceTiming(item))

let resources = {
  init: cb => {
    let performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance
    if (!performance || !performance.getEntries) {
      return void 0
    }

    if (window.PerformanceObserver) {
      let observer = new window.PerformanceObserver(list => {
        try {
          let entries = list.getEntries()
          cb(resolveEntries(entries))
        } catch (e) {
          console.error(e)
        }
      })
      observer.observe({
        entryTypes: ['resource'],
      })
    } else {
      window.addEventListener('load', () => {
        let entries = performance.getEntriesByType('resource')
        cb(resolveEntries(entries))
      })
    }
  },
}

export default resources
