<template>
	<div id="app">
		<div class="login_box" v-if="!isLogin">
			<h3>用户登录</h3>
			<p>用户名</p>
			<input type="text" placeholder="请输入用户名" id="username" v-model="loginName" />
			<p>选择头像</p>
			<ul class="avatar" id="login_avatar">
				<li v-for="(item,idx) in loginAvatars"
					:key="idx" @click="avaIndex = idx"
					:class="idx===avaIndex?'now':''">
					<img :src="item" />
				</li>
			</ul>
			<button class="weui-btn" id="loginBtn" @click="handleLogin">登录</button>
		</div>
		<div class="container" v-if="isLogin">
			<!-- 用户列表 -->
			<div class="user-list">
				<div>
					<div class="header">
						<div class="avatar">
							<img class="img avatar_url" :src="user.avatar" />
						</div>
						<div class="info">
							<h3 class="username">{{user.username}}</h3>
						</div>
					</div>
					<div class="title">
						<h3>消息</h3>
					</div>
				</div>
				<ul>
					<!-- 聊天室 -->
					<li class="user"  @click="toRoom">
						<el-badge :is-dot="unread" class="item avatar" >
								<img src="./assets/images/wechat.png">
						</el-badge>
						<div class="name">聊天室</div>
					</li>
					<!-- 用户 -->
					<li class="user" v-for="(item,index) in userlist" :key="index" @click="chose2chat(item)">
						<el-badge :is-dot="item.unread" class="item avatar" >
								<img :src="item.avatar">
						</el-badge>
						<div class="name">{{item.username}}</div>
					</li>
				</ul>
			</div>
			<!-- 聊天主窗口 -->
			<div class="box" >
				<!-- 聊天窗口头部 -->
				<div class="box-hd">
					<h3>
						{{mode==='private'?toUser.username:'聊天室'}}
						<span id="userCount" v-if="mode!=='private'">({{userCount}})</span>
					</h3>
				</div>
				<!-- 聊天窗口主体区域 -->
				<div class="box-bd" ref="msgWrap">
					<!-- 消息 -->
					<div class="info_item" 
						v-for="(item,idx) in infoList" :key="idx">
						<!-- 系统消息 -->
						<div class="system" v-if="!item.msg">
							<p class="message_system">
								<span class="content">{{item.username}}{{item.type==='add'?'加入':'离开'}}了群聊</span>
							</p>
						</div>
						<!-- 聊天消息 -->
						<div class="message-box" v-else>
							<div :class="[item.username===loginName?'my':'other','message']">
								<img  class="avatar" :src="item.avatar" />
								<div class="content">
									<div v-if="item.username!==loginName" class="nickname">{{item.username}}</div>
									<div class="bubble">
										<div class="bubble_cont" v-html="item.msg"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- 加载动画 -->
					<div class="message-box loading" v-show="loading">
						<div :class="['my','message']">
							<img  class="avatar" :src="user.avatar" />
							<div class="content">
								<div class="bubble">
									<div class="bubble_cont">
										<img src="./assets/images/loading.gif">
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<!-- 聊天窗口底部区域 -->
				<div class="box-ft">
					<!-- 工具栏 -->
					<div class="toolbar">
						<a ref="emoji" href="javascript:;" title="表情" class="face" >
							<Emoji @click="selectedEmoji" />
						</a>
						<a href="javascript:;" title="图片" class="file">
							<label for="file"></label>
							<input type="file" id="file" style="display: none;" @change="fileSelect($event)">
						</a>
					</div>
					<!-- 内容输入区域 -->
					<div class="content">
						<div class="text" id="content"
							ref="input" contenteditable>
						</div>
					</div>
					<!-- 发送按钮 -->
					<div class="action">
						<span class="desc" >按下Ctrl+Enter发送</span>
						<a class="btn-send" id="btn-send" href="javascript:;" @click="send">发送</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { VueChatEmoji, emojis } from 'vue-chat-emoji'
require("vue-chat-emoji/dist/vue-chat-emoji.css");
export default {
	name: 'App',
	components: {
		Emoji: VueChatEmoji
	},
	data() {
		return {
			/* 聊天模式 */
			mode:'public',
			isLogin: false,
			/* 登录相关数据 */
			loginAvatars: [
				"https://tvax2.sinaimg.cn/crop.0.0.664.664.50/007W1YpGly8geglltgjcwj30ig0ig3z7.jpg?KID=imgbed,tva&Expires=1590229962&ssig=9zZwPhQxwm",
				"https://tvax2.sinaimg.cn/crop.75.235.504.504.50/007xgAyJly8gebmayeck7j30j60y3dvv.jpg?KID=imgbed,tva&Expires=1590229480&ssig=wHTebm%2F5%2FH",
				"https://tvax1.sinaimg.cn/crop.0.0.996.996.50/006yCBwBly8ge7mx45uamj30ro0ro78q.jpg?KID=imgbed,tva&Expires=1590229480&ssig=%2BBY3jm3mWZ",
				"https://tvax4.sinaimg.cn/crop.0.0.996.996.50/006SIjTply8geox5sz5jyj30ro0ro0ut.jpg?KID=imgbed,tva&Expires=1590229480&ssig=5wAGjHu%2Bv%2B",
				"https://tvax2.sinaimg.cn/crop.0.0.512.512.50/6765d3ffly8gclincw0vcj20e80e80th.jpg?KID=imgbed,tva&Expires=1590229480&ssig=1k3lelp2Wz",
				"https://tvax2.sinaimg.cn/crop.0.0.1080.1080.50/6d6b3044ly8gcsadqtqd8j20u00u0tcp.jpg?KID=imgbed,tva&Expires=1590229576&ssig=exEMJwTsUS",
				"https://tvax2.sinaimg.cn/crop.0.0.828.828.50/0087nzjoly8geaz1l9kpsj30n00n0wf9.jpg?KID=imgbed,tva&Expires=1590229576&ssig=Wz1MVuXtCm",
				"https://tvax1.sinaimg.cn/crop.0.0.996.996.50/005EI7zMly8ge64kzr4h5j30ro0rodh7.jpg?KID=imgbed,tva&Expires=1590229595&ssig=3zqoMcrao7",
				"https://tvax2.sinaimg.cn/crop.0.0.996.996.50/006jc0c8ly8g9t78bmjljj30ro0romye.jpg?KID=imgbed,tva&Expires=1590229595&ssig=KFOeUVL%2FRi",
				"https://tvax2.sinaimg.cn/crop.0.0.996.996.50/007jV8E5ly8gdc9hkso31j30ro0rogpf.jpg?KID=imgbed,tva&Expires=1590229616&ssig=uwsAZW6D5b"
			],
			avaIndex: 0,
			loginName: '',
			user:{},
			/* 列表 */
			userlist: {},
			userCount: 0,
			/* 消息 */
			infoList:[],
			loading:false,
			/* 私聊 */
			toUser:{},
			privateMsg:[],
			/* 切换群聊 */
			unread:false
		}
	},
	created() {
		/* 登陆成功 */
		this.$socket.on('loginSuccess', user => {
			this.isLogin = true;
			this.user=user;
		})
		/* 登陆失败 */
		this.$socket.on('loginError', err => {
			this.$message.error(err.msg);
		})
		/* 列表更新 */
		this.$socket.on('upDateList', users => {
			/* 群聊人数 */
			this.userCount = Object.keys(users).length;
			delete users[this.loginName];
			this.userlist = users;
		})
		/* 按下contrl+enter发送 */
		window.addEventListener('keydown',(e)=>{
			if(e.keyCode===13&&e.ctrlKey){
				this.send();
			}
		})
		/* 获取历史消息 */
		this.$socket.on('historyInfo',infoList=>{
			this.infoList=infoList;
		})

		/* -----------聊天室----------- */
		/* 系统消息 */
		this.$socket.on('changeUser',info=>{
			if(this.mode==='public')
				this.infoList.push(info);
			else
				this.unread=true;
		})
		/* 聊天消息 */
		this.$socket.on('receiveMsg',info=>{
			if(this.mode==='private'){
				this.unread=true;
				 return;
			}
			this.loading=false;
			this.infoList.push(info);
		})

		/* --------   私聊   ------- */
		/* 历史私聊记录 */
		this.$socket.on('oldPrivateInfo',infoList=>{
			if(this.mode==='public')return;
			if(Array.isArray(infoList)){
				this.infoList=infoList;
			}else{
				this.infoList=[];
			}
		})
		/* 收到私聊信息 */
		this.$socket.on('receivePrivateMsg',data=>{
			/* 通知 */
			let username=data.username;
			if(this.toUser.username===data.username||
			  this.user.username===username){
				delete data.toUser;
				this.infoList.push(data);
				this.loading=false;
				if(this.toUser.username===data.username)
					this.userlist[data.username].unread=false;
			}else{//提醒
				this.userlist[username].unread=true;
			}
		})
	},
	
	methods: {
		/* 登录 */
		handleLogin() {
			this.loginName=this.loginName.trim();
			let userInfo = {
				unread:false,
				username: this.loginName,
				avatar: this.loginAvatars[this.avaIndex]
			}
			if (userInfo.username === '') {
				this.$message.error('请输入用户名');
				return;
			}
			this.$socket.emit('login', userInfo);
		},
		/* 上传图片 */
		fileSelect(e) {
			let file = e.target.files[0];
			if (file.size >= 1048576) {
				this.$message.error("图片大小不能超过1M");
				return;
			}
			let fr = new FileReader();
			fr.readAsDataURL(file);
			fr.onload = () => {
				this.$refs.input.innerHTML += `<div><img src="${fr.result}"></div>`
			}
		},
		/* 选择表情 */
		selectedEmoji(args) {
			this.$refs.input.innerHTML +=args.emoji;
		},
		/* 发送消息 */
		send(){
			if(this.$refs.input.innerHTML==='')
				return;
			/* 根据模式发信息 */
			if(this.mode==='public'){
				this.$socket.emit('sendMsg',{
					...this.user,
					msg:this.$refs.input.innerHTML
				})
			}else{
				this.$socket.emit('sendPrivateMsg',{
					...this.user,
					toUser:this.toUser,
					msg:this.$refs.input.innerHTML
				})
			}
			/* 清空 */
			this.$refs.input.innerHTML='';
			/* 加载动画 */
			this.loading=true;
		},
		/* 选择私聊对象 */
		chose2chat(user){
			this.toUser=user;
			this.mode="private";
			// 获取消息
			this.$socket.emit('getOldPrivateInfo',{
				user1:this.user,
				user2:user
			})
			/* 去除标点 */
			this.userlist[user.username].unread=false;
			this.infoList=[];
		},
		/* 返回聊天室 */
		toRoom(){
			this.unread=false;
			this.toUser={};
			this.mode="public";
			this.infoList=[];
			/* 获取消息 */
			this.$socket.emit('getPublicInfo',{});
		}
	},
	watch:{
		infoList(){
			/* 消息滚动到底部 */
			this.$nextTick(()=>{
				let msgWrap=this.$refs.msgWrap;
				if(msgWrap)
					msgWrap.scrollTop =msgWrap.scrollHeight;
			})
		}
	}
}
</script>

<style>
@import "./App.css";
</style>
