import Vue from 'vue'
import App from './App.vue'
/* elememnt-ui */
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
Vue.use(ElementUI)
/* 连接socket 服务 */
Vue.prototype.$socket = io.connect("http://172.22.25.69:80");
new Vue({
  render: h => h(App),
}).$mount('#app')
