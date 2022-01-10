<script>
import Toolbar from './toolbar.vue';
import bus from '@/libs/bus';
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
  data() {
    return { readNum: 0, userId: null };
  },
  inheritAttrs: false,
  components: { Toolbar },
  mounted() {
    this.userId = sessionStorage.getItem('current_userId');

    bus.$on('updateReadNum', (readList, targetId) => {
      if (this.$attrs.message.toContactId === targetId) {
        this.readNum = readList ? Object.keys(readList).length : 0;
      }
    });
  },
  render() {
    const { fromUser } = this.$attrs.message;

    return (
      <lemon-message-basic
        class='lemon-message-file'
        props={{ ...this.$attrs }}
        scopedSlots={{
          content: (props) => [
            // <div class='tool-bar-wrapper'>
            <div class='read-num-abs'>
              {fromUser.id === this.userId && <p>{this.readNum}人已读</p>}
            </div>,
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

    .read-num-abs {
      position: absolute;
      left: -90px;
      bottom: 0;
      width: 85px;
      text-align: right;
      color: #999;
      font-size: 12px;
    }
  }
}
</style>
