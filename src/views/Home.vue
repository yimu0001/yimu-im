<template>
  <div class="home">
    <news ref="yimuNews" :customMenu="customMenu"></news>
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
    };
  },
  components: {
    News,
  },
  mounted() {
    setTimeout(() => {
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
          iconClass: 'iconfont icon-zhiding',
          component: testComponent,
        },
        {
          name: 'pending',
          isBottom: false,
          title: '待办',
          unread: 0,
          key: 'pending',
          iconClass: 'iconfont icon-daiban1',
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
        {
          name: 'manage',
          isBottom: false,
          title: '管理',
          unread: 0,
          key: 'manage',
          iconClass: 'iconfont icon-shezhi',
          component: testComponent,
        },
      ];
      console.log(this.$refs.yimuNews.im);
    }, 500);
  },
  destroyed() {
    console.log('销毁');
  },
};
</script>
