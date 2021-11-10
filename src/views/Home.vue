<template>
  <div class="home">
    <news ref="yimuNews"></news>
  </div>
</template>

<script>
// @ is an alias to /src
import News from '../components/news.vue'

export default {
  name: 'Home',
  components: {
    News
  },
  mounted () {
    setTimeout(() => {
      console.log(this.$refs.yimuNews.im);
    }, 100) 
  },
  destroyed () {
    console.log('销毁');
  },
}
</script>
