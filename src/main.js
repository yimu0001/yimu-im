import Vue from 'vue';
import {
  Modal,
  Tag,
  Notice,
  Row,
  Col,
  Form,
  FormItem,
  Input,
  Select,
  Option,
  DatePicker,
  Message,
  Switch,
  RadioGroup,
  Radio,
  Spin,
} from 'view-design';
import 'view-design/dist/styles/iview.css';

import App from './App.vue';
import router from './router';
import store from './store';
import moment from 'moment';
import LemonIMUI from 'lemon-imui';
import 'lemon-imui/dist/index.css';
import './components/style.css';
import 'element-ui/lib/theme-chalk/index.css';

Vue.component('Modal', Modal);
Vue.component('Tag', Tag);
Vue.component('Row', Row);
Vue.component('Col', Col);
Vue.component('Form', Form);
Vue.component('FormItem', FormItem);
Vue.component('Input', Input);
Vue.component('Select', Select);
Vue.component('Option', Option);
Vue.component('DatePicker', DatePicker);
Vue.component('i-switch', Switch);
Vue.component('RadioGroup', RadioGroup);
Vue.component('Radio', Radio);
Vue.component('Spin', Spin);
Vue.use(LemonIMUI);

Vue.config.productionTip = false;
Vue.prototype.$Message = Message;
Vue.prototype.$Notice = Notice;
// 利用插值表达式调用
Vue.filter('dateformat', function (date, pattern = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';

  return moment(date * 1000).format(pattern);
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
