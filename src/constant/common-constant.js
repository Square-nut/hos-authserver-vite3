/**
 * 以下是登录相关的常量
 */
const Constant = {
    httpCode: {
        // 正常请求
        OK: 200,
        // 请求参数有问题
        BAD_REQUEST: 400,
        // 未认证（没登录）
        UNAUTHORIZED: 401,
        // 未授权（无权限）
        NOT_PERMISSION: 403,
        // 没有该资源
        NOT_FOUND: 404,
        // 内部错误
        INTERNAL_SERVER_ERROR: 500,
    }

};

export default Constant;
