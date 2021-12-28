<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
// .iconfont {
//   font-size: 12px;
//   color: #999;
// }
.selected-icon-color {
  // color: #f5ae15;
  color: #0fd547;
}
.normal-icon-color {
  color: #999;
}
</style>
