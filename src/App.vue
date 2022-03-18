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

.selected-icon-color {
  // color: #f5ae15;
  color: #0fd547;
}
.normal-icon-color {
  color: #999;
}
div,
p {
  padding: 0;
  margin: 0;
}
*,
:after,
:before {
  box-sizing: border-box;
}

.read-pointer {
  cursor: pointer;
}
</style>
