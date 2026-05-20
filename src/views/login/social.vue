<template>
	<!--<div>
            &lt;!&ndash; <el-tag  :key="index" v-if="item.enable" @click="handleClick(item.code)"><i :class="item.icon"></i>{{item.name}}</el-tag>&ndash;&gt;
           &lt;!&ndash; <el-avatar style="margin-left: 10px" v-if="item.enable" v-for="(item,index) in sourceData" @click.native="handleClick(item.code)"
                        size="small" :src="item.url" :alt="item.name">
            </el-avatar>&ndash;&gt;
            <img v-if="item.enable" :src="item.url" :alt="item.name" v-for="(item,index) in sourceData" @click.native="handleClick(item.code)" />
            &lt;!&ndash;<el-button type="info" circle  :icon="item.icon" v-if="item.enable" v-for="(item,index) in sourceData" @click.native="handleClick(item.code)" >{{item.name}}</el-button>&ndash;&gt;
    </div>-->

	<el-row>
		<el-col :span="12">{{ $t('第三方登录方式') }}</el-col>
		<el-col :span="12">
			<img
				v-if="item.enable"
				:id="item.code"
				:src="item.url"
				:alt="item.name"
				v-for="(item, index) in sourceData"
				@click="handleClick(item.code)"
			/>
		</el-col>
	</el-row>
</template>
<script>
import hosUrl from '@/assets/images/social/hos.png';
import giteeUrl from '@/assets/images/social/gitee.png';
import weixinUrl from '@/assets/images/social/weixin.png';
import { fetchOauthUrl } from '@/api/oauth';
export default {
	data() {
		return {
			isShow: false,
			windowArray: [],
			sourceData: [
				{
					name: 'QQ',
					code: 'QQ',
					enable: false,
					url: 'el-icon-s-flag',
				},
				{
					name: '微信',
					code: 'WECHAT_OPEN',
					enable: false,
					url: weixinUrl,
				},
				{
					name: 'GITEE',
					code: 'GITEE',
					enable: false,
					url: giteeUrl,
				},
				{
					name: 'hos',
					code: 'hos',
					enable: false,
					url: hosUrl,
				},
			],
		};
	},
	props: {
		getSocialData: Function,
		saveWindow: Function,
		grantChainId: String,
	},
	created() {
		///
		////获取二次认证的uuid的方法
		let _this = this;
		window.getTwoAuthUUID = function (obj) {
			_this.getTwoAuthUUID();
		};
		this.initData(this.getSocialData());
		/*  this.$emit('getSocialData', val => {
                let data=val.sourceData;
                let handleData=[];
                ///遍历数据，然后将支持的启动起来
                for(let i=0;i<this.sourceData.length;i++){
                   let item=this.sourceData[i];
                   if(data.indexOf(item.code)>-1){
                     item.enable=true;
                   }
                   handleData.push(item);
                }
                this.sourceData=handleData;
                if(data.length==1&&val.isSingle){
                  this.handleClick(data[0]);
                  this.isShow=false;
                }else{
                  this.isShow=true;
                }

              })*/
	},
	methods: {
		getTwoAuthUUID() {
			return this.grantChainId;
		},
		initData(val) {
			let data = val.sourceData;
			let handleData = [];
			///遍历数据，然后将支持的启动起来
			for (let i = 0; i < this.sourceData.length; i++) {
				let item = this.sourceData[i];
				if (
					data.indexOf(item.code.toUpperCase()) > -1 ||
					data.indexOf(item.code.toLowerCase()) > -1
				) {
					item.enable = true;
				}
				handleData.push(item);
			}
			this.sourceData = handleData;
			if (data.length == 1 && val.isSingle) {
				this.handleClick(data[0]);
				this.isShow = false;
			} else {
				this.isShow = true;
			}
		},
		getWindowArray() {
			return this.windowArray;
		},
		handleClick(source) {
			fetchOauthUrl(source)
				.then((response) => {
					if (response && response.code == 200) {
						let url = response.data;
						var winWidth = screen.width; //获取屏幕宽度
						var winHeight = screen.height; //获取屏幕高度
						//获取新窗口距离屏幕左侧的位置
						let newWinHeight = '500';
						let newWinWidth = '1000';
						var left = (winWidth - newWinWidth) / 2;
						//获取新窗口距离屏幕顶部的位置
						//var top=(winHeight-newWinHeight)/2;
						let winObj = window.open(
							url,
							name,
							'width=' +
								newWinWidth +
								',height=' +
								newWinHeight +
								',left=' +
								left +
								',top=100,toolbar=no,menubar=no,location=no,status=no'
						);
						this.saveWindow(winObj);
					} else {
						///提示错误信息
						this.$message.error(response.msg);
					}
				})
				.catch((error) => {
					console.log(error);
				});
			//window.location.href = `${import.meta.env.VITE_APP_BASE_URL ?? import.meta.env.VUE_APP_BASE_URL}/social-auth/oauth/render/${source}`;
		},
	},
};
</script>
