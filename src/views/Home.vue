<template>
  <div class="home">
    <!-- <div @click="open">打开</div> -->
    <news
      ref="yimuNews"
      :customMenu="customMenu"
      :theme="theme"
      :fromSystem="fromSystem"
      @change-menu="handleChangeMenu"
    ></news>
  </div>
</template>

<script>
// @ is an alias to /src
import News from '../components/news.vue';
import testComponent from '../components/testComponent.vue';

export default {
  name: 'Home',
  data() {
    return {
      customMenu: [],
      fromSystem: 'cs',
      curMenuName: 'messages',
      theme: 'light',
    };
  },
  components: {
    News,
  },
  mounted() {
    setTimeout(() => {
      this.setMenu();
      console.log(this.$refs.yimuNews.im);
    }, 500);
  },
  methods: {
    open() {
      this.$refs.yimuNews.openChatDialog();
    },
    handleChangeMenu(menuName) {
      this.curMenuName = menuName;
    },
    setMenu() {
      this.customMenu = [
        {
          name: 'collect',
          isBottom: false,
          title: '收藏',
          unread: 0,
          key: 'collect',
          iconClass: 'iconfont icon-shoucang1',
          component: testComponent,
        },
        {
          name: 'help',
          isBottom: false,
          title: '帮助',
          unread: 0,
          key: 'help',
          iconClass: 'iconfont icon-bangzhu1',
          component: testComponent,
        },
        {
          name: 'mark',
          isBottom: false,
          title: '标记',
          unread: 0,
          key: 'mark',
          iconClass: 'iconfont icon-fujian',
          component: testComponent,
        },
        {
          name: 'pending',
          isBottom: false,
          title: '待办',
          unread: 0,
          key: 'pending',
          iconClass: 'iconfont icon-daibanrenwu_o',
          component: testComponent,
        },
        {
          name: 'data',
          isBottom: false,
          title: '数据',
          unread: 0,
          key: 'data',
          iconClass: 'iconfont icon-paixingbang',
          component: testComponent,
        },
      ];
    },
  },
};
</script>
