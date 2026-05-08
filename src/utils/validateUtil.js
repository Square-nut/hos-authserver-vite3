/**
 * 判断是否为空
 * @param {*} val
 * @returns
 */
 export function validateNull(val) {
    // 特殊判断
    if (val && parseInt(val) === 0) return false;
    const list = ["$parent"];
    if (
      val instanceof Date ||
      typeof val === "boolean" ||
      typeof val === "number"
    )
      return false;
    if (val instanceof Array) {
      if (val.length === 0) return true;
    } else if (val instanceof Object) {
      val = cloneDeep(val);
      list.forEach(ele => {
        delete val[ele];
      });
      for (var o in val) {
        return false;
      }
      return true;
    } else {
      if (
        val === "null" ||
        val == null ||
        val === "undefined" ||
        val === undefined ||
        val === ""
      ) {
        return true;
      }
      return false;
    }
    return false;
  }
  // 小数或整数(不可以负数)
  export function validNumberIntegerAndFloat(val) {
    // 匹配空格
    let v = val.replace(/(^\s*)|(\s*$)/g, "");
    // 只能是数字和小数点，不能是其他输入
    v = v.replace(/[^\d.]/g, "");
    // 以0开始只能输入一个
    v = v.replace(/^0{2}$/g, "0");
    // 保证第一位只能是数字，不能是点
    v = v.replace(/^\./g, "");
    // 小数只能出现1位
    v = v
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".");
    // 小数点后面保留2位
    v = v.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3");
    // 返回结果
    return v;
  }
  // 正整数验证
  export function validNumberInteger(val) {
    // 匹配空格
    let v = val.replace(/(^\s*)|(\s*$)/g, "");
    // 去掉 '.' , 防止贴贴的时候出现问题 如 0.1.12.12
    v = v.replace(/[\.]*/g, "");
    // 去掉以 0 开始后面的数, 防止贴贴的时候出现问题 如 00121323
    v = v.replace(/(^0[\d]*)$/g, "0");
    // 首位是0,只能出现一次
    v = v.replace(/^0\d$/g, "0");
    // 只匹配数字
    v = v.replace(/[^\d]/g, "");
    // 返回结果
    return v;
  }
  // 去掉中文及空格
  export function validCnAndSpace(val) {
    // 匹配中文与空格
    let v = val.replace(/[\u4e00-\u9fa5\s]+/g, "");
    // 匹配空格
    v = v.replace(/(^\s*)|(\s*$)/g, "");
    // 返回结果
    return v;
  }
  // 去掉英文及空格
  export function validEnAndSpace(val) {
    // 匹配英文与空格
    let v = val.replace(/[a-zA-Z]+/g, "");
    // 匹配空格
    v = v.replace(/(^\s*)|(\s*$)/g, "");
    // 返回结果
    return v;
  }
  // 禁止输入空格
  export function validAndSpace(val) {
    // 匹配空格
    let v = val.replace(/(^\s*)|(\s*$)/g, "");
    // 返回结果
    return v;
  }
  // 金额用 `,` 区分开
  export function validNumberComma(val) {
    // 调用小数或整数(不可以负数)方法
    let v = validNumberIntegerAndFloat(val);
    // 字符串转成数组
    v = v.toString().split(".");
    // \B 匹配非单词边界，两边都是单词字符或者两边都是非单词字符
    v[0] = v[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // 数组转字符串
    v = v.join(".");
    // 返回结果
    return v;
  }
  // 匹配文字变色（搜索时）
  export function validTextColor(val, text = "", color = "red") {
    // 返回内容，添加颜色
    let v = text.replace(
      new RegExp(val, "gi"),
      `<span style='color: ${color}'>${val}</span>`
    );
    // 返回结果
    return v;
  }
  // 数字转中文大写
  export function validNumberCnUppercase(
    val,
    unit = "仟佰拾亿仟佰拾万仟佰拾元角分",
    v = ""
  ) {
    // 当前内容字符串添加 2个0，为什么??
    val += "00";
    // 返回某个指定的字符串值在字符串中首次出现的位置，没有出现，则该方法返回 -1
    let lookup = val.indexOf(".");
    // substring：不包含结束下标内容，substr：包含结束下标内容
    if (lookup >= 0) val = val.substring(0, lookup) + val.substr(lookup + 1, 2);
    // 根据内容 val 的长度，截取返回对应大写
    unit = unit.substr(unit.length - val.length);
    // 循环截取拼接大写
    for (let i = 0; i < val.length; i++) {
      v += "零壹贰叁肆伍陆柒捌玖".substr(val.substr(i, 1), 1) + unit.substr(i, 1);
    }
    // 正则处理
    v = v
      .replace(/零角零分$/, "整")
      .replace(/零[仟佰拾]/g, "零")
      .replace(/零{2,}/g, "零")
      .replace(/零([亿|万])/g, "$1")
      .replace(/零+元/, "元")
      .replace(/亿零{0,3}万/, "亿")
      .replace(/^元/, "零元");
    // 返回结果
    return v;
  }
  // 手机号码
  export function validPhone(val) {
    // false: 手机号码不正确
    if (
      !/^((12[0-9])|(13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/.test(
        val
      )
    )
      return false;
    // true: 手机号码正确
    else return true;
  }
  // 只校验11位的手机号
  export function validPhone11(val) {
    // false: 手机号码不正确
    if (val.length !== 11){
      return false;
    }
    // true: 手机号码正确
    else return true;
  }
  // 国内电话号码
  export function validTelPhone(val) {
    // false: 国内电话号码不正确
    if (!/\d{3}-\d{8}|\d{4}-\d{7}/.test(val)) return false;
    // true: 国内电话号码正确
    else return true;
  }
  // 登录账号 (字母开头，允许5-16字节，允许字母数字下划线)
  export function validAccount(val) {
    // false: 登录账号不正确
    if (!/^[a-zA-Z][a-zA-Z0-9_]{4,15}$/.test(val)) return false;
    // true: 登录账号正确
    else return true;
  }
  // 密码 (以字母开头，长度在6~16之间，只能包含字母、数字和下划线)
  export function validPassword(val) {
    // false: 密码不正确
    if (!/^[a-zA-Z]\w{5,15}$/.test(val)) return false;
    // true: 密码正确
    else return true;
  }
  // 强密码 (字母+数字+特殊字符，长度在6-16之间)
  export function validPasswordPowerful(val) {
    // false: 强密码不正确
    if (
      !/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&\.*]+$)(?![\d!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(
        val
      )
    )
      return false;
    // true: 强密码正确
    else return true;
  }
  // 密码强度
  export function validPasswordStrength(val) {
    let v = "";
    // 弱：纯数字，纯字母，纯特殊字符
    if (/^(?:\d+|[a-zA-Z]+|[!@#$%^&\.*]+){6,16}$/.test(val)) v = "弱";
    // 中：字母+数字，字母+特殊字符，数字+特殊字符
    if (
      /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(
        val
      )
    )
      v = "中";
    // 强：字母+数字+特殊字符
    if (
      /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&\.*]+$)(?![\d!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(
        val
      )
    )
      v = "强";
    // 返回结果
    return v;
  }
  // IP地址
  export function validIPAddress(val) {
    // false: IP地址不正确
    if (
      !/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(
        val
      )
    )
      return false;
    // true: IP地址正确
    else return true;
  }
  // 邮箱
  export function validEmail(val) {
    // false: 邮箱不正确
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        val
      )
    )
      return false;
    // true: 邮箱正确
    else return true;
  }
  // 身份证
  export function validIdCard(val) {
    // false: 身份证不正确
    if (
      !/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
        val
      )
    )
      return false;
    // true: 身份证正确
    else return true;
  }
  // 姓名
  export function validFullName(val) {
    // false: 姓名不正确
    if (!/^[\u4e00-\u9fa5]{1,6}(·[\u4e00-\u9fa5]{1,6}){0,2}$/.test(val))
      return false;
    // true: 姓名正确
    else return true;
  }
  // 邮政编码
  export function validPostalCode(val) {
    // false: 邮政编码不正确
    if (!/^[1-9][0-9]{5}$/.test(val)) return false;
    // true: 邮政编码正确
    else return true;
  }
  // url
  export function validUrl(val) {
    // false: url不正确
    var reg=/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
    if (
      !reg.test(
        val
      )
    )
      return false;
    // true: url正确
    else return true;
  }
  // 车牌号
  export function validCarNum(val) {
    // false: 车牌号不正确
    if (
      !/^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/.test(
        val
      )
    )
      return false;
    // true：车牌号正确
    else return true;
  }
  // 小写字母
  export function validLowerCase(str) {
    const reg = /^[a-z]+$/;
    return reg.test(str);
  }
  // 大写字母
  export function validUpperCase(str) {
    const reg = /^[A-Z]+$/;
    return reg.test(str);
  }
  // 字母（大小写）
  export function validAlphabets(str) {
    const reg = /^[A-Za-z]+$/;
    return reg.test(str);
  }
  
  // 验证域名
  export function validDoMain(str) {
    const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return reg.test(str)
  }