import YimuIm from './news.vue';
// import '../assets/iconfont/iconfont.css';
import './style.css';

YimuIm.install = function(Vue) {
  Vue.component(YimuIm.name, YimuIm);
};

export default YimuIm;
