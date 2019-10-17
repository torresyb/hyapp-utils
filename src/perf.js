let perf = {
  init: cb => {
    let performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance
    // 上传数据
    let list = {
      url: '',
      attribute: {},
      apiList: [],
      resource: {
        cssList: [],
        imageList: [],
        jsList: []
      }
    }

    function extension (str) {
      return str.substring(str.lastIndexOf('.') + 1);
    }

    // 资源数据格式化
    function formData (v) {
      v.forEach(item => {
        if (Array.isArray(item)) {
          return formData(item)
        }
        if (extension(item.name) == 'js') {
          list.resource.jsList.push({
            url: item.name,
            consume: parseInt(item.duration),
          })
        } else if (extension(item.name) == 'png' || extension(item.name) == 'jpg' || extension(item.name) == 'gif' || extension(item.name) == 'jpeg' || extension(item.name) == 'webp') {
          list.resource.imageList.push({
            url: item.name,
            consume: parseInt(item.duration),
          })
        } else if (extension(item.name) == 'css') {
          list.resource.cssList.push({
            url: item.name,
            consume: parseInt(item.duration),
          })
        } else if (item.initiatorType == 'xmlhttprequest') {
          list.apiList.push({
            url: item.name,
            consume: parseInt(item.duration),
          })
        }
      })
    }

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
            timer = setTimeout(runCheck, 100)
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

      list.attribute = {
        navigation: performance.navigation.type, // 导航类型
        // 前端渲染
        parseDomConsume: filterTime(timing.domInteractive, timing.domLoading), // dom解析时间(不包含dom内嵌资源加载时间)
        // 关键阶段
        htmlLoadConsume: filterTime(timing.loadEventEnd, timing.navigationStart), // 页面完全加载总时间
        domLoadConsume: filterTime(timing.domComplete, timing.domInteractive), // dom加载时间(不包含dom解析时间)
        whiteScreen: filterTime(timing.responseStart, timing.navigationStart), // 白屏时间(从页面进来到读取页面第一个字节的耗时)
      }

      // 资源加载耗时
      if (performance.getEntries) {
        let entries = performance.getEntriesByType('resource')
        formData(entries)
      }
      return list
    }

    Util.onload(function () {
      let perfData = reportPerf('onload')
      perfData.url = `[onload] ${location.href}`
      cb(perfData)
      list = {
        attribute: {},
        apiList: [],
        resource: {
          cssList: [],
          imageList: [],
          jsList: []
        }
      }
      if (window.PerformanceObserver) {
        let timer = null
        let entriesData = []
        function runCheck () {
          clearInterval(timer)
          timer = setTimeout(() => {
            formData(entriesData)
            list.url = `[observer] ${location.href}`
            cb(list)
            list = {
              attribute: {},
              apiList: [],
              resource: {
                cssList: [],
                imageList: [],
                jsList: []
              }
            }
            entriesData = []
          }, 1000)
        }
        let observer = new window.PerformanceObserver(list => {
          try {
            let entries = list.getEntries()
            entriesData.push(entries)
            runCheck()
          } catch (e) {
            console.error(e)
          }
        })
        observer.observe({
          entryTypes: ['resource'],
        })
      }
    })
  },
}

export default perf
