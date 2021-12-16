<script>
import Toolbar from './toolbar.vue';
export default {
  name: 'lemonMessageImage',
  inheritAttrs: false,
  inject: ['IMUI'],
  components: { Toolbar },
  render() {
    return (
      <lemon-message-basic
        class='lemon-message-image abc'
        props={{ ...this.$attrs }}
        scopedSlots={{
          content: (props) => {
            return (
              <div class='tool-bar-wrapper'>
                <img class='content-show img-show' src={props.content} />
                <toolbar msgContent={{ ...this.$attrs.message }}></toolbar>
              </div>
            );
          },
        }}
      />
    );
  },
};
</script>

<style lang="less">
.lemon-message.lemon-message-image {
  user-select: none;

  .lemon-message__content {
    border: 2px solid #000;
    font-size: 12px;
    cursor: pointer;
    overflow: visible;
    background: none;
    border: none;

    &::before {
      display: none;
    }
  }
  .tool-bar-wrapper {
    .content-show {
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.04);
    }
    .tool-bar {
      padding: 3px 0 0 0;
      visibility: hidden;
      .iconfont {
        margin: 0 5px;
        font-size: 16px;
        color: #999;
        &:hover {
          color: #0fd547;
        }
      }
    }
    &:hover .tool-bar {
      visibility: visible;
    }
  }
  .tool-bar-wrapper .img-show {
    max-width: 200px;
    height: auto;
  }
}
</style>
