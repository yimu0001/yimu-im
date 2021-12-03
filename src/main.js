import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import LemonIMUI from 'lemon-imui';
import 'lemon-imui/dist/index.css';

import LemonMessageImage from '@/components/lemon-message-image.vue';

Vue.use(LemonIMUI);
Vue.component(LemonMessageImage.name, LemonMessageImage);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
