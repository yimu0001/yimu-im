// import Vue from 'vue'
// import LemonIMUI from 'lemon-imui';
// import 'lemon-imui/dist/index.css';
// Vue.use(LemonIMUI);
import YimuIm from './news.vue';
import LemonMessageImage from './message/image.vue';
import LemonMessageText from './message/text.vue';
import LemonMessageFile from './message/file.vue';
// import '../assets/iconfont/iconfont.css';
import './style.css';

YimuIm.install = function(Vue) {
  Vue.component(YimuIm.name, YimuIm);
  Vue.component(LemonMessageImage.name, LemonMessageImage);
  Vue.component(LemonMessageText.name, LemonMessageText);
  Vue.component(LemonMessageFile.name, LemonMessageFile);
};

export default YimuIm;
export { YimuIm, LemonMessageImage, LemonMessageText, LemonMessageFile };
