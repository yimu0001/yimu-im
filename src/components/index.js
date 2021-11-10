import Vue from 'vue'
import LemonIMUI from 'lemon-imui';
import 'lemon-imui/dist/index.css';
Vue.use(LemonIMUI);
import YMImBase from './news.vue';

YMImBase.install = function(Vue) {
    Vue.component(YMImBase.name, YMImBase);
};
export default YMImBase;