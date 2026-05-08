var EnableLocalWeb = '1'
var defaultDllDir = 'https://114.251.235.22:1443/imedical/web/addins/plugin'
var WEBSYSADDINSTYPE = 'ALL-JAVA'
;(function (ss) {
  ss.addinsWs = null
  ss.addinsWsWaitingSendList = []
  ss.addinsWsOpen = function open(openCallback) {
    ss.addinsWs = new WebSocket('ws://localhost:31996/websocket')
    ss.addinsWs.addEventListener('open', function (e) {
      console.log(e)
      if (ss.addinsWsWaitingSendList.length > 0) {
        for (var i = 0; i < ss.addinsWsWaitingSendList.length; i++) {
          ss.addinsWs.send(ss.addinsWsWaitingSendList[i])
        }
        ss.addinsWsWaitingSendList = []
      }
      if ('function' == typeof openCallback) {
        openCallback.call(this, e)
      }
    })
    ss.addinsWs.addEventListener('message', function (e) {
      console.log(e)
      var rtnJson = { status: '200', rtn: e.data, msg: 'success' }
      if (e.data.indexOf('{') == 0) rtnJson = JSON.parse(e.data)
      if ('function' == typeof ss.addinsWsCallback[rtnJson.senderId]) {
        ss.addinsWsCallback[rtnJson.senderId].call(this, rtnJson.rtn, rtnJson)
      }
    })
    ss.addinsWs.onclose = function (arg1) {
      ss.addinsWsOpen()
    }
    ss.addinsWs.onerror = function (err) {}
  }
  ss.addinsWsCallback = {}
  ss.addinsWsSend = function (data, cb) {
    if (data instanceof Array) {
      var senderId = 'S' + Math.random()
      data.push({ _senderId: senderId })
      if ('object' == typeof data) {
        var msg = JSON.stringify(data)
      } else if ('string' == typeof data) {
        var msg = data
      }
      this.addinsWsCallback[senderId] = cb
      if (ss.addinsWs && this.addinsWs.readyState == 1) {
        ss.addinsWs.send(msg)
      } else {
        ss.addinsWsWaitingSendList.push(msg)
      }
    } else {
      console.error('[Addins send]: 发送的数据必须为数组 ')
    }
  }
})(window)
window.addinsWsOpen()
function invokeDll(mode, ass, cls, data, notReturn, c) {
  data.push({ _ass: ass })
  data.push({ _cls: cls })
  window.addinsWsSend(data, c)
}

function ICls() {
  this.data = []
  this.mode = 0
  this.notReturn = 0
  this.ass = ''
  this.cls = ''
  this.focusClassName = ''
  this.focusWindowName = ''
  this.focusLazyTime = 1000
  this.timeout = 60000
}
ICls.prototype.constructor = ICls
ICls.prototype.invk = function (c) {
  if (this.focusClassName != '') this.data.push({ _focusClassName: this.focusClassName })
  if (this.focusWindowName != '') this.data.push({ _focusWindowName: this.focusWindowName })
  if (this.focusClassName != '' || this.focusWindowName != '') this.data.push({ _focusLazyTime: this.focusLazyTime })
  this.data.push({ _timeout: this.timeout })
  var rtn = invokeDll(this.mode, this.ass, this.cls, this.data, this.notReturn, c)
  return rtn
}
ICls.prototype.clear = function () {
  this.data.length = 3
  return this
}
ICls.prototype.prop = function (k, v) {
  var o = {}
  o[k] = v
  this.data.push(o)
  return this
}
ICls.prototype.getMthParam = function (arg) {
  if (!arg.length) return ''
  var len = arg.length,
    hasCallback = 0
  if (len > 0 && 'function' == typeof arg[len - 1]) {
    hasCallback = 1
  }
  var param = ''
  if (arg.length > 0) {
    param = 'P_COUNT=' + (len - hasCallback)
    for (var i = 0; i < arg.length - hasCallback; i++) {
      param += '&P_' + i + '=' + encodeURIComponent(arg[i])
    }
  }
  return param
}
ICls.prototype.cmd = function (c) {
  this.data.push({ _cmd: c })
  if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
    return this.invk(arguments[arguments.length - 1])
  }
  return this.invk()
}
ICls.AssDirList = []
/*获取客户端信息*/
ICls.CmdShell = function () {
  this.ass = 'cmd'
  this.cls = 'cmd'
  this.data.push({ _dllDir: defaultDllDir + '/' })
  this.data.push({ _version: '' })
  this.data.push({ _clientIPExp: '' })
  this.GetInfo = function () {
    this.data.push({ M_GetInfo: this.getMthParam(arguments) })
    return this
  }
  this.GetIP = function () {
    this.data.push({ M_GetIP: this.getMthParam(arguments) })
    return this
  }
  this.Run = function () {
    this.clear()
    this.data.push({ M_Run: this.getMthParam(arguments) })
    if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
      return this.invk(arguments[arguments.length - 1])
    }
    return this.invk()
  }
  this.EvalJs = function () {
    this.clear()
    this.data.push({ M_EvalJs: this.getMthParam(arguments) })
    if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
      return this.invk(arguments[arguments.length - 1])
    }
    return this.invk()
  }
  this.GetConfig = function () {
    this.clear()
    this.data.push({ M_GetConfig: this.getMthParam(arguments) })
    if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
      return this.invk(arguments[arguments.length - 1])
    }
    return this.invk()
  }
  this.CurrentUserEvalJs = function () {
    this.clear()
    this.data.push({ M_CurrentUserEvalJs: this.getMthParam(arguments) })
    if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
      return this.invk(arguments[arguments.length - 1])
    }
    return this.invk()
  }
  this.Write = function () {
    this.clear()
    this.data.push({ M_Write: this.getMthParam(arguments) })
    if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
      return this.invk(arguments[arguments.length - 1])
    }
    return this.invk()
  }
  this.PrintPdf = function () {
    this.clear()
    this.data.push({ M_PrintPdf: this.getMthParam(arguments) })
    if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
      return this.invk(arguments[arguments.length - 1])
    }
    return this.invk()
  }
}
ICls.CmdShell.prototype = new ICls()
ICls.CmdShell.prototype.constructor = ICls.CmdShell
var CmdShell = new ICls.CmdShell()
export default {
  CmdShell
}
/*中间件管理*/
ICls.CMgr = function () {
  this.ass = 'mgr'
  this.cls = 'mgr'
  this.data.push({ _dllDir: defaultDllDir + '/WebsysAddins/WebsysAddins.zip' })
  this.data.push({ _version: '1.0.9' })
  this.data.push({ _clientIPExp: '' })
  this.getVersion = function () {
    this.clear()
    this.data.push({ M_getVersion: this.getMthParam(arguments) })
    if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
      return this.invk(arguments[arguments.length - 1])
    }
    return this.invk()
  }
  this.getScreens = function () {
    this.clear()
    this.data.push({ M_getScreens: this.getMthParam(arguments) })
    if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
      return this.invk(arguments[arguments.length - 1])
    }
    return this.invk()
  }
  this.moveWindow = function () {
    this.clear()
    this.data.push({ M_moveWindow: this.getMthParam(arguments) })
    if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
      return this.invk(arguments[arguments.length - 1])
    }
    return this.invk()
  }
  this.updater = function () {
    this.clear()
    this.data.push({ M_updater: this.getMthParam(arguments) })
    if (arguments.length > 0 && 'function' == typeof arguments[arguments.length - 1]) {
      return this.invk(arguments[arguments.length - 1])
    }
    return this.invk()
  }
}
ICls.CMgr.prototype = new ICls()
ICls.CMgr.prototype.constructor = ICls.CMgr
var CMgr = new ICls.CMgr()
