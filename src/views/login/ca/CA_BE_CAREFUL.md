//`js
// ca 文件夹下的 js 文件来自 电子病例组
// 由于提供 js 没有暴露函数，所以如果添加新的 js 文件需要添加暴露函数方法 如下
export {
  Login,
  GetUserList,
  GetSignCert,
  GetUniqueID,
  GetCertNo,
  SignedData
}
// 如需调用更多js文件中的方法，需要在 export 中添加调用的函数
//`
//这里考虑不要使用 md 文件格式,加上之前的```js 的写法,在打包的时候会将 md 文件打进去,导致 ie11 报错,如果只是说明文件,且不在浏览器中显示,可当作普通文件记下注释即可.
