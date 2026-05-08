import Vue from 'vue'
/**
 * 以下是缓存处理
 * local:只能手动删除，否则一直有效（高版本浏览器才支持，IE8及以上，存储过多页面会很卡）
 * session:针对标签页，关闭标签页就算不关闭浏览器也作废了（高版本浏览器才支持，IE8及以上，存储过多页面会很卡）
 * cookie:针对浏览器，关闭浏览器就作废了（浏览器几乎通用，还可以指定有效期）
 */

// 设置永久缓存
export function setLocal(key, val,expire) {
    if(expire==null){
        Vue.ls.set(key, val);
    }else{
        Vue.ls.set(key, val,expire);
    }
}
// 获取永久缓存
export function getLocal(key) {
 return  Vue.ls.get(key);
}
// 移除永久缓存
export function removeLocal(key) {
  Vue.ls.remove(key);
}
// 清除全部永久缓存
export function clearLocal() {
  Vue.ls.clear();
}
// 清空所有缓存
export function clearAll() {
  clearLocal();
}

