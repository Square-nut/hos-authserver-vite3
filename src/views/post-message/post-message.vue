<template>
	<div></div>
</template>
<script>
import { getToken } from '@/utils/base/token-util';
export default {
	name: 'post-message',
	data() {
		return {};
	},
	created() {
		// window.addEventListener('message', (e) => {
		//   console.log(e.data, 'e.data', e)
		// })

		// 给调用这个页面的iframe 发送单点登录的token
		let token = getToken();
		window.parent.postMessage(token, '*');
	},
};
</script>
