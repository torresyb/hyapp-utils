let formatError = errObj => {
  let col = errObj.column || errObj.columnNumber // Safari Firefox
  let row = errObj.line || errObj.lineNumber // Safari Firefox
  let message = errObj.message
  let name = errObj.name

  // 获取堆栈信息
  let { stack } = errObj
  if (stack) {
    let matchUrl = stack.match(/https?:\/\/[^\n]+/)
    let urlFirstStack = matchUrl ? matchUrl[0] : ''
    let regUrlCheck = /https?:\/\/(\S)*\.js/

    let resourceUrl = ''
    if (regUrlCheck.test(urlFirstStack)) {
      resourceUrl = urlFirstStack.match(regUrlCheck)[0]
    }

    let stackCol = null
    let stackRow = null
    let posStack = urlFirstStack.match(/:(\d+):(\d+)/)
    if (posStack && posStack.length >= 3) {
      ;[, stackCol, stackRow] = posStack
    }

    return {
      content: stack,
      col: Number(col || stackCol),
      row: Number(row || stackRow),
      message,
      name,
      resourceUrl
    }
  }

  return {
    row,
    col,
    message,
    name
  }
}

let ErrorCatch = {
  init: cb => {
    // 防止死循环
    try {
      //  js 错误捕捉
      let _originOnerror = window.onerror
      window.onerror = (...arg) => {
        let [errorMessage, scriptURI, lineNumber, columnNumber, errorObj] = arg
        let errorInfo = formatError(errorObj)
        errorInfo._errorMessage = errorMessage // 错误描述
        errorInfo._scriptURI = scriptURI // 发生错误的url地址
        errorInfo._lineNumber = lineNumber // 发生错误的行
        errorInfo._columnNumber = columnNumber // 发生错误的列
        errorInfo._route = location.href // 当前页面
        errorInfo.userAgent = navigator.userAgent
        errorInfo.type = 'js_onerror'

        // 数据回调
        cb(errorInfo)
        _originOnerror && _originOnerror.apply(window, arg)
      }
    } catch (error) {}
  }
}

export default ErrorCatch
