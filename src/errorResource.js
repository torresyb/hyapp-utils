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
          if (/src=""/.test(target.outerHTML)) return
          if (target.localName.toLowerCase() === 'link') {
            target.src = target.href
          }

          let errorInfo = {
            message: '资源加载失败',
            type: `resource_${event.type}`,
            url: target.src, // 加载失败的url
            page: location.href, // 当前页面
            outerHTML: target.outerHTML, // 引入源码
          }
          cb(errorInfo)
        },
        true
      )
    } catch (error) {
      console.log(error)
    }
  }
}

export default ErrorResource
