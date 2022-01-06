<script>
import Toolbar from './toolbar.vue';
export default {
  name: 'lemonMessageText',
  inheritAttrs: false,
  inject: ['IMUI'],
  components: { Toolbar },
  render() {
    return (
      <lemon-message-basic
        class='lemon-message-text'
        props={{ ...this.$attrs }}
        scopedSlots={{
          content: (props) => {
            const content = this.IMUI.emojiNameToImage(props.content);
            return (
              <div class='tool-bar-wrapper'>
                <span class='content-show' domProps={{ innerHTML: content }} />
                <toolbar props={{ ...this.$attrs }}></toolbar>
              </div>
            );
          },
        }}
      />
    );
  },
};
</script>
<!--<style lang="stylus">
@import '~styles/utils/index'
+b(lemon-message-text)
  +b(lemon-message)
    +e(content)
      img
        width 18px
        height 18px
        display inline-block
        background transparent
        position relative
        top -1px
        padding 0 2px
        vertical-align middle
</style>-->

<style lang="less" scoped>
.tool-bar-wrapper {
  position: relative;
  .content-show {
    border-radius: 2px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.04);
  }
  .tool-bar {
    position: absolute;
    bottom: -36px;
    left: 0;
    padding: 5px 0;
    visibility: hidden;
    .iconfont {
      margin: 0 5px;
      font-size: 16px;
      color: #999;
      &:hover {
        color: rgb(45, 153, 224);
      }
    }
  }
  // TODO 有bug
  &:hover .tool-bar {
    visibility: visible;
  }
}
// .lemon-message__inner:hover .tool-bar {
//   visibility: visible;
// }
</style>
