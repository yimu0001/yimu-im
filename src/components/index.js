import YimuIm from './news.vue';
import LemonMessageBasic from 'lemon-imui';
import LemonMessageImage from './message/image.vue';
import LemonMessageText from './message/text.vue';
import LemonMessageFile from './message/file.vue';
// import '../assets/iconfont/iconfont.css';
import './style.css';

YimuIm.install = function(Vue) {
  Vue.component(YimuIm.name, YimuIm);
  Vue.component(LemonMessageBasic.name, LemonMessageBasic);
  Vue.component(LemonMessageImage.name, LemonMessageImage);
  Vue.component(LemonMessageText.name, LemonMessageText);
  Vue.component(LemonMessageFile.name, LemonMessageFile);
};
const version = '1.0.31';
export { version, YimuIm, LemonMessageImage, LemonMessageText, LemonMessageFile };
export default YimuIm;
