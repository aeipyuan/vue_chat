/* 连接 */
const socket = io.connect(window.location.host);
/**
 * 登录
 */
//全局变量记录用户信息
let username, avatar;
// 当前元素的底部滚动到可视区
function scrollIntoView() {
    $('.box-bd')
        .children(':last')
        .get(0)
        .scrollIntoView(false)
}
//选择头像
$('.avatar li').on('click', function () {
    $(this).addClass('now').siblings().removeClass('now');
})
//点击登录
$('#loginBtn').on('click', function () {
    // 获取名字和头像
    let username = $('#username').val().trim();
    if (username === '') return alert('请输入用户名！');
    let avatar = $('#login_avatar .now img').attr('src');
    // 发送给服务器校验
    socket.emit('login', { username: username, avatar: avatar });
})
//服务器回应登录结果
socket.on('loginError', function (data) {
    alert(data.msg);
})
socket.on('loginSuccess', function (data) {
    /* 显示页面 */
    $('.login_box').fadeOut();
    $('.container').fadeIn();
    /* 显示头像和用户名 */
    $('.header .avatar_url').attr('src', data.avatar);
    $('.header .username').text(data.username);
    /* 记录头像用户名 */
    username = data.username;
    avatar = data.avatar;
})
//列表
socket.on('upDateList', function (users) {
    let ul = '';
    users.forEach(function (user) {
        if (user.username === username) return;
        ul += `
            <li class="user">
            <div class="avatar"><img src="${user.avatar}"></div>
            <div class="name">${user.username}</div>
            </li>
        `
    });
    $('.user-list ul').html(ul);
    //更新人数
    $('#userCount').text(users.length);
})
/**
 * 聊天窗口
 */
//上线通知
socket.on('addUser', user => {
    $('.box-bd').append(`
        <div class="system">
            <p class="message_system">
            <span class="content">${user.username}加入了群聊</span>
            </p>
        </div>
    `)
    scrollIntoView();
})
//下线通知
socket.on('delUser', user => {
    $('.box-bd').append(`
        <div class="system">
            <p class="message_system">
            <span class="content">${user.username}离开了群聊</span>
            </p>
        </div>
    `)
    scrollIntoView();
})
//图片上传到输入框
$('#file').on('change', function () {
    let file = this.files[0];
    console.log(file)
    if (file.size > 1048576) {
        alert('图片不能大于1M');
        return;
    }
    let fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = function () {
        $('#content').append(`
            <div><img src="${fr.result}"></div>
        `)
    }
})
//表情放到输入框
$('.face').on('click', () => {
    $('#content').emoji({
        button: '.face',
        showTab: false,
        animation: 'slide',
        position: 'topRight',
        icons: [
            {
                name: 'QQ表情',
                path: 'lib/jquery-emoji/img/qq/',
                maxNum: 91,
                excludeNums: [41, 45, 54],
                file: '.gif'
            }
        ]
    })
})
//发送消息
function send() {
    let message = $('#content').html();
    socket.emit('sendMsg', {
        username, avatar,
        msg: message
    })
    $('#content').html('');
    // loading动画
    $('.box-bd').append(`
        <div class="message-box loading">
            <div class="my message">
                <img class="avatar" src="${avatar}" />
                <div class="content">
                    <div class="bubble">
                        <div class="bubble_cont">
                            <img src="/images/loading.gif">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `)
    $('.box-bd img:last').on('load', function () {
        scrollIntoView()
    })
}
$("#btn-send").on('click', () => {
    send();
})
document.onkeydown = function (e) {
    if (e.ctrlKey && e.keyCode === 13) {
        send();
    }
}
//接收消息
socket.on('receiveMsg', data => {
    $('.loading').remove();
    if (data.username === username) {
        $('.box-bd').append(`
            <div class="message-box">
                <div class="my message">
                    <img class="avatar" src="${data.avatar}" />
                    <div class="content">
                        <div class="bubble">
                            <div class="bubble_cont">${data.msg}</div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    } else {
        $('.box-bd').append(`
            <div class="message-box">
                <div class="other message">
                    <img class="avatar" src="${data.avatar}"  />
                    <div class="content">
                    <div class="nickname">${data.username}</div>
                    <div class="bubble">
                        <div class="bubble_cont">${data.msg}</div>
                    </div>
                    </div>
                </div>
            </div>
        `)
    }
    $('.box-bd img:last').on('load', function () {
        scrollIntoView()
    })
})

