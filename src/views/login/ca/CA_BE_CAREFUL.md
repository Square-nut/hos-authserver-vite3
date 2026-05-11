//`js
// 厂商 CA 脚本放在项目根目录 public/ca/，由登录配置里的 jsPath 在运行时动态加载（见 src/utils/load-ca-vendor.ts）；common.data.js 同目录并在 index.html 中静态引入。
// 以下说明仍适用：js 来自电子病例组等；若新文件未暴露函数，需在文件末尾显式 export，例如：
export {
  Login,
  GetUserList,
  GetSignCert,
  GetUniqueID,
  GetCertNo,
  SignedData
}
// 如需调用更多方法，在 export 中补充。
//`
//这里考虑不要使用 md 文件格式,加上之前的```js 的写法,在打包的时候会将 md 文件打进去,导致 ie11 报错,如果只是说明文件,且不在浏览器中显示,可当作普通文件记下注释即可.
