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
                <div class='content-show' domProps={{ innerHTML: content }} />
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

<style lang="less" scoped>
.tool-bar-wrapper {
  .content-show {
    border-radius: 2px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.04);
    margin-bottom: 8px;
  }
  .tool-bar {
    padding: 5px 0;
    visibility: hidden;
    .iconfont {
      margin: 5px 5px 0;
      font-size: 16px;
      color: #999;
      &:hover {
        color: rgb(45, 153, 224);
      }
    }
  }
  &:hover .tool-bar {
    visibility: visible;
  }
}
// /deep/ .lemon-message--reverse .lemon-message__content:before{
//       border-left-color: #fff;
// }
</style>
