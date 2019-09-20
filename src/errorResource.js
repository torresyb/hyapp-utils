/**
 * 只处理资源加载错误
 */
let ErrorResource = {
  init: cb => {
    // 防止死循环
    try {
      window.addEventListener(
        'error',
        event => {
          var target = event.target || event.srcElement
          var isElementTarget = target instanceof HTMLScriptElement || target instanceof HTMLLinkElement || target instanceof HTMLImageElement
          // js error不再处理
          if (!isElementTarget) return
          // src 为空不处理
          if(/src=""/.test(target.outerHTML)) return
          if (target.localName.toLowerCase() === 'link') {
            target.src = target.href
          }

          let errorInfo = {
            message: '资源加载失败',
            type: `resource_${event.type}`,
            url: target.src, // 加载失败的url
            route: location.href, // 当前页面
            outerHTML: target.outerHTML, // 引入源码
            userAgent: navigator.userAgent
          }
          if (navigator.connection) {
            const { rtt, downlink, effectiveType } = navigator.connection
            errorInfo.rtt = `有效网络连接类型${effectiveType}`
            errorInfo.downlink = `估算的下行速度/带宽${downlink}Mb/s`
            errorInfo.effectiveType = `估算的往返时间${rtt}ms`
          }
          cb(errorInfo)
        },
        true
      )
    } catch (error) {}
  }
}

export default ErrorResource
