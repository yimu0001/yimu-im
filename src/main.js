import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import moment from 'moment';
import LemonIMUI from 'lemon-imui';
import 'lemon-imui/dist/index.css';
// import './assets/iconfont/iconfont.css';
import './components/style.css';

Vue.use(LemonIMUI);

Vue.config.productionTip = false;
// 利用插值表达式调用
Vue.filter('dateformat', function(date, pattern = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';

  return moment(date * 1000).format(pattern);
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
