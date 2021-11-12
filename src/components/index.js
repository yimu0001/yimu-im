// import Vue from 'vue'
// import LemonIMUI from 'lemon-imui';
// import 'lemon-imui/dist/index.css';
// Vue.use(LemonIMUI);
import YimuIm from './news.vue';

YimuIm.install = function(Vue) {
    Vue.component(YimuIm.name, YimuIm);
};
export default YimuIm;