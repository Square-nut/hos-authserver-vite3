<template>
	<div>
		<img src="../../assets/images/loading.png" alt="" class="loadding-img" />
	</div>
</template>

<script>
import { setCurrentLocale } from '@/utils/i18n/i18n-util';
import Qs from 'qs';
import { useUserStore } from '@/stores/user';
export default {
	name: 'oauth_callback',
	data() {
		return {};
	},
	mounted() {
		document.title = this.$t('打开其他应用');
		this.init();
	},
	methods: {
		init() {
			if (document.querySelector('.login-loading-mask'))
				document.querySelector('.login-loading-mask').style.display = 'none';

			const {
				key,
				redirectUrl,
				language: defaultLanguage,
			} = Qs.parse(window.location.search, { ignoreQueryPrefix: true });

			if (defaultLanguage) setCurrentLocale(defaultLanguage);

			let upData = {
				grantType: 'disposableKey',
				disposableKey: key,
			};
			useUserStore()
				.Login(upData)
				.then((res) => {
					window.location.href = redirectUrl;
				})
				.catch((error) => {});
		},
	},
};
</script>
<style lang="scss" scoped>
.authorize {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
.text-align-center {
	text-align: center;
}
.loadding-img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>
<style lang="scss">
.authorize {
	.install-license {
		color: #5db42f;
		cursor: pointer;
	}
	.continue {
		color: #5db42f;
		cursor: pointer;
	}
}
.loadding-img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>
