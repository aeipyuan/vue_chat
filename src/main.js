import Vue from 'vue'
import App from './App.vue'
/* elememnt-ui */
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
Vue.use(ElementUI)
/* 连接socket 服务 */
Vue.prototype.$socket = io.connect("http://121.89.169.217/");
new Vue({
  render: h => h(App),
}).$mount('#app')
