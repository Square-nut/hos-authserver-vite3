<template>
	<div>
		<img
			src="../../assets/images/loading.png"
			alt=""
			class="loadding-img"
		/>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
export default {
	name: 'freeAuth',
	data() {
		return {};
	},
	mounted() {
		if (document.querySelector('.login-loading-mask')) {
			document.querySelector('.login-loading-mask').style.display = 'none';
		}
		this.init();
	},
	methods: {
		...mapActions(['Login']),
		async init() {
			const { query } = this.$route;
			if (query.CASTicket) {
				let freeLoginParam = {
					grantType: 'HISCAS',
					CASTicket: query.CASTicket,
				};
				try {
					const { data, code, msg } = await this.freeAuthLogin(freeLoginParam);
					if (code == 200) {
						this.freeAuthSuccessCallback('CASTicket');
					} else {
						this.$message.error(msg);
					}
				} catch (error) {
					this.$message.error(error.msg);
				}
			}
		},
		freeAuthSuccessCallback(delParams) {
			// 删参数
			if (Array.isArray(delParams)) {
				delParams.forEach((param) => {
					delete this.$route.query[param];
				});
			} else {
				delete this.$route.query[delParams];
			}

			// 跳转
			let { redirect } = this.$route.query;
			window.location.href = redirect;
		},
		freeAuthLogin(freeLoginParam) {
			return this.Login(freeLoginParam);
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
