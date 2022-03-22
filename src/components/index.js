import YimuIm from './news.vue';
// import '../assets/iconfont/iconfont.css';
import './style.css';
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

YimuIm.install = function (Vue) {
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

  Vue.component(YimuIm.name, YimuIm);
};

export default YimuIm;
