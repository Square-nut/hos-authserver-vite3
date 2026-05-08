import xss from 'xss'
import Vue from 'vue'

var options = {
  // 默认白名单参考 xss.whiteList
  whiteList: {
    a: ['href', 'style'],
    img: ['src', 'alt'],
  },
  stripIgnoreTag: true, // 去掉不在白名单上的标签   true：去掉不在白名单上的标签
  stripIgnoreTagBody: ['script', 'style'], // 去掉不在白名单上的标签及标签体
  // ['tag1', 'tag2']：仅去掉指定的不在白名单上的标签
  onTagAttr: function () {
    // todo
  },
}
let process = new xss.FilterXSS(options)
import xss from 'xss'

export default {
  install: function (Vue, options = {}) {
    Object.defineProperty(Vue.prototype, '$xss', {
      value: function (html) {
        return xss(html, options)
      }
    })
  }
}