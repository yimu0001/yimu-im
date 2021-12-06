import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import LemonIMUI from 'lemon-imui';
import 'lemon-imui/dist/index.css';
import iconfont from '@/assets/iconfont/iconfont.css';
import LemonMessageImage from '@/components/message/image.vue';
import LemonMessageText from '@/components/message/text.vue';
import LemonMessageFile from '@/components/message/file.vue';

Vue.use(LemonIMUI);
Vue.component(LemonMessageImage.name, LemonMessageImage);
Vue.component(LemonMessageText.name, LemonMessageText);
Vue.component(LemonMessageFile.name, LemonMessageFile);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
