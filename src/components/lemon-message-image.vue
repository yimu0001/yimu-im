<script>
export default {
  name: 'lemonMessageImage',
  inheritAttrs: false,
  inject: ['IMUI'],

  render() {
    return (
      <lemon-message-basic
        class='lemon-message-image abc'
        props={{ ...this.$attrs }}
        scopedSlots={{
          content: (props) => {
            // return <span>{props.content}&nbsp;🔈</span>;
            return (
              <div class='tool-bar-wrapper'>
                <img class='msg-img-show' src={props.content} />
                <div class='tool-bar'>
                  <i class='el-icon-user-solid'></i>&nbsp;
                  <i class='el-icon-star-off'></i>
                </div>
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
  // .lemon-message--reverse .lemon-message__content
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
    .msg-img-show {
      max-width: 200px;
      height: auto;
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.04);
    }
    .tool-bar {
      visibility: hidden;
    }
    &:hover .tool-bar {
      visibility: visible;
    }
  }
}
</style>
