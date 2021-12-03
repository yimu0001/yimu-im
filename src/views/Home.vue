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
          key: 'test',
          iconClass: 'el-icon-star-off',
          component: testComponent,
        },
        {
          name: 'files',
          isBottom: false,
          title: '待办',
          unread: 0,
          key: 'test',
          iconClass: 'el-icon-date',
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
