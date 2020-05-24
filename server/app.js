const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let myHost = "0.0.0.0";
let port = 80;
/* 监听端口 */
server.listen(port, myHost, () => {
    console.log(`Server start at http://${myHost}:${port}`);
});

/* 记录所有用户 */
let users = {};
/* 记录群聊天信息 */
let infoList = [];
/* 记录私聊消息 */
let privateInfo = {};
/* socket连接 */
io.on('connection', (socket) => {
    console.log('新用户连接');
    console.log(socket.id)
    /* 登录信息 */
    socket.on('login', user => {
        if (users[user.username]) {
            /* 返回错误信息 */
            socket.emit('loginError', { msg: '用户名已存在' });
        } else {
            /* 存id */
            user.socketId = socket.id;
            /* 存入映射对象 */
            users[user.username] = user;
            /* 登录成功 */
            socket.emit('loginSuccess', user);
            /* 通知所有更新用户列表 */
            io.emit('upDateList', users);
            /* 把历史记录发给当前用户 */
            socket.emit('historyInfo', infoList);
            /* 上线通知 */
            let addInfo = {
                type: 'add',
                ...user
            }
            io.emit('changeUser', addInfo);
            /* 记录 */
            infoList.push(addInfo);
            /* 存信息 */
            socket.username = user.username;
            socket.avatar = user.avatar;
        }
    })
    /* 下线通知 */
    socket.on('disconnect', () => {
        if (!socket.username) {
            return;
        }
        let delInfo = {
            type: 'del',
            ...users[socket.username]
        }
        /* 存记录 */
        infoList.push(delInfo);
        /* 通知 */
        io.emit('changeUser', delInfo);
        /* 删除用户并通知 */
        delete privateInfo[socket.username];
        delete users[socket.username];
        io.emit('upDateList', users);
    });
    /* 接收消息 */
    socket.on('sendMsg', data => {
        infoList.push(data);
        io.emit('receiveMsg', data);
    })
    /* 切换私聊用户 */
    socket.on('getOldPrivateInfo', data => {
        let info;
        if (data.user1 && data.user2 && privateInfo[data.user1.username]) {
            info = privateInfo[data.user1.username][data.user2.username];
            socket.emit('oldPrivateInfo', info);
        } else {
            socket.emit('oldPrivateInfo', { msg: '参数错误' });
        }
    })
    /* 发送私聊消息 */
    socket.on('sendPrivateMsg', data => {
        let user1 = data.username, user2 = data.toUser.username;
        /* 存 */
        privateInfo[user1] = privateInfo[user1] || {};
        privateInfo[user1][user2] = privateInfo[user1][user2] || [];
        privateInfo[user1][user2].push(data);
        privateInfo[user2] = privateInfo[user2] || {};
        privateInfo[user2][user1] = privateInfo[user2][user1] || [];
        privateInfo[user2][user1].push(data);
        socket.emit('receivePrivateMsg', data);
        io.to(data.toUser.socketId).emit('receivePrivateMsg', data);
    })
    /* 切换群聊更新消息 */
    socket.on('getPublicInfo', () => {
        socket.emit('historyInfo', infoList);
    })
});