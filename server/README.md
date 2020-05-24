# websocket的基本概念


# websocket使用
客户端
```javascript
/* 创建 */
let socket = new WebSocket('ws://echo.websocket.org');
/* 连接 */
socket.addEventListener('open', function () {
    content.innerHTML = "连接成功"
})
/* 发送 */
btn.addEventListener('click', () => {
    socket.send(input.value)
})
/* 接受 */
socket.addEventListener('message', (res) => {
    console.log(res)
})
/* 断开 */
socket.addEventListener('error', () => {
    console.log('发生错误')
})
/* 断开 */
socket.addEventListener('close', () => {
    console.log('连接断开')
})
```
服务端
```javascript
/* 导入包 */
let ws = require('nodejs-websocket')
/* 创建服务 */
const server = ws.createServer(connect => {
    console.log('新连接')
    /* 传递数据触发 */
    connect.on('text', data => {
        console.log(data);
        /* 返回消息 */
        connect.send('服务端已接收')
    })
    /* 处理错误 */
    connect.on('error', () => {
        console.log('连接断开')
    })
    /* 监听客户端断开 */
    connect.on('close', () => {
        console.log('客户端连接断开')
    })
})
/* 监听端口 */
server.listen(4000, '117.170.68.170', () => {
    console.log("WebSocket 服务启动")
})
```