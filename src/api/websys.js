var protocol = window.location.protocol;
var port = protocol === 'http:' ? '11996' : '21996';
var WEBSYSHTTPSERVERURL = `${protocol}//localhost:${port}/websys/`;

var _version = '1.0.0.0'

export const $config = {
    baseURL: WEBSYSHTTPSERVERURL, //  存放于环境变量文件
}

// 获取字典分类树节点
export const cmd = () => {
    return {
        url: '/cmd/cmd',
        method: 'post',
        emulateJSON: true,
        data: {
            '_version': _version,
            '_clientIPExp':'',
            'M_GetConfig':''
        }
    }
}