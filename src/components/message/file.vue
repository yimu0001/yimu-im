<script>
import Toolbar from './toolbar.vue';
function formatByte(value) {
  if (null == value || value == '') {
    return '0 Bytes';
  }
  var unitArr = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  var index = 0;
  var srcsize = parseFloat(value);
  index = Math.floor(Math.log(srcsize) / Math.log(1024));
  var size = srcsize / Math.pow(1024, index);
  size = parseFloat(size.toFixed(2));
  return size + unitArr[index];
}

export default {
  name: 'lemonMessageFile',
  inheritAttrs: false,
  components: { Toolbar },
  render() {
    return (
      <lemon-message-basic
        class='lemon-message-file'
        props={{ ...this.$attrs }}
        scopedSlots={{
          content: (props) => [
            // <div class='tool-bar-wrapper'>
            <div class='lemon-message-file__inner'>
              <p class='lemon-message-file__name'>{props.fileName}</p>
              <p class='lemon-message-file__byte'>{formatByte(props.fileSize)}</p>
            </div>,
            <div class='lemon-message-file__sfx'>
              <i class='lemon-icon-attah' />
            </div>,
            <toolbar msgContent={{ ...this.$attrs.message }}></toolbar>,
            // </div>,
          ],
        }}
      />
    );
  },
};
</script>

<style lang="less">
.lemon-message.lemon-message-file {
  user-select: none;
  margin-bottom: 12px;
  .lemon-message__content {
    overflow: visible;
    position: relative;
    .tool-bar {
      position: absolute;
      left: 0;
      bottom: -29px;
      visibility: hidden;
      .iconfont {
        margin: 0 5px;
        font-size: 16px;
        &:hover {
          color: #0fd547;
        }
      }
    }
    &:hover .tool-bar {
      visibility: visible;
    }
  }
}
</style>
