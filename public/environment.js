;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
    ? define(factory)
    : (global.__hos = factory())
})(this, function () {
  return {
    _: {},
    debug: false,
    isForceMAC: false, // 是否强制使用MAC地址，设置为true后登录时必须获取到MAC地址才能登录
    showLoginDeviceInfo: true, // 是否在登录页右下角显示本机IP和MAC
    VUE_APP_BASE_URL: '/api', // baseUrl
    VUE_APP_WEBSYS_WS: false, // 新websys客户端,使用ws进行连接
    QRCODE_DOMAIN: '10.10.119.77' // 当qrType 为 4 时，项目nginx转发的https域名，格式为：ip地址或域名，不包括协议和端口号和path
  }
})
