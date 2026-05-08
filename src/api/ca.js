// 获取二维码
export const getQRData = (params) => {
	return {
		url: '/security/ca/getQRData',
		method: 'get',
		params: params,
	};
};
// 获取扫描二维码结果
export const getQRResultData = (params) => {
	return {
		url: '/security/ca/getQRResultData',
		method: 'get',
		params: params,
	};
};

// ca uk初始化参数
export const getCAInitParams = (params) => {
	return {
		url: '/security/ca/getCAInitParams',
		method: 'get',
		params: params,
	};
};

// PIN码 登录
export const authPinPhone = (param) => {
	return {
		url: '/security/ca/authPinPhone',
		method: 'post',
		params: param,
	};
};

// 根据用户名查询支持的 ca 二次登陆方式
export const getSupportCAType = (param) => {
	return {
		url: '/ca-auth/getSupportCAType',
		method: '',
		params: param,
	};
};