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
          name: 'files',
          isBottom: false,
          title: '文档',
          unread: 0,
          key: 'test',
          icon:
            'https://img12.iqilu.com/1/sucaiku/image_thumb/202110/19/4ada1f7d8413436abfbd2ca48f7ef009.png',
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
