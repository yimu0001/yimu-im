// import Vue from 'vue'
// import LemonIMUI from 'lemon-imui';
// import 'lemon-imui/dist/index.css';
// Vue.use(LemonIMUI);
import YimuIm from './news.vue';

import LemonMessageImage from '../components/message/image.vue';
import LemonMessageText from '../components/message/text.vue';
import LemonMessageFile from '../components/message/file.vue';

YimuIm.install = function(Vue) {
  Vue.component(LemonMessageImage.name, LemonMessageImage);
  Vue.component(LemonMessageText.name, LemonMessageText);
  Vue.component(LemonMessageFile.name, LemonMessageFile);

  Vue.component(YimuIm.name, YimuIm);
};

export default YimuIm;
export { YimuIm, LemonMessageImage, LemonMessageText, LemonMessageFile };
