<script>
import Toolbar from './toolbar.vue';
import bus from '@/libs/bus';
import { Emoji_Type_Obj } from './constant';

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
    return {
      readNum: 0,
      userId: null,
      lastReadTime: null,
      isGroup: false,
      expansionObj: {},
      showRead: false,
    };
  },
  inheritAttrs: false,
  components: { Toolbar },
  mounted() {
    this.userId = sessionStorage.getItem('current_userId');
    this.isGroup = this.$attrs.message.conversationType === 3;
    // 新消息发出去之后 isGroup不正确
    if (!this.$attrs.message.conversationType) {
      setTimeout(() => {
        this.isGroup = this.$attrs.message.conversationType === 3;
      }, 500);
    }

    bus.$on('updateReadNum', (type, params) => {
      if (type === 'single') {
        const { messageUId, sentTime } = params;
        if (this.$attrs.message.messageUId === messageUId && sentTime) {
          this.lastReadTime = sentTime;
        }
      } else if (type === 'group') {
        const { messageUIdList, receivedUserId } = params;
        if (
          messageUIdList.includes(this.$attrs.message.messageUId) &&
          receivedUserId &&
          !this.readList.includes(receivedUserId)
        ) {
          this.$set(this.readList, this.readList.length, receivedUserId);
        }
      }
    });
    bus.$on('setSingleReadStatus', (lastTime) => {
      this.lastReadTime = lastTime;
    });
    bus.$on('setGroupReadStatus', (list) => {
      // 这一条消息的已读人员id列表
      this.readList = list[this.$attrs.message.id] || [];
    });

    bus.$on('setComplexExpand', (msgId, expansion) => {
      if (msgId === this.$attrs.message.id && expansion) {
        this.expansionObj = expansion;
      }
    });
  },
  beforeDestroy() {
    bus.$off('updateReadNum');
    bus.$off('setSingleReadStatus');
    bus.$off('setComplexExpand');
  },
  render() {
    const { fromUser, sendTime } = this.$attrs.message;
    this.expansionObj = this.$attrs.message.expansion;
    const isNoticeMsg = Number(fromUser.id) < 0;

    let emojiObj = Emoji_Type_Obj;
    let markNames = '';
    let thumbList = [];
    if (this.expansionObj) {
      let { markedObj = {}, thumbedInfo = {} } = this.expansionObj;
      markNames = Object.values(markedObj).join('，');
      thumbList = Object.values(thumbedInfo);
    }

    return (
      <lemon-message-basic
        class='lemon-message-file'
        props={{ ...this.$attrs }}
        scopedSlots={{
          content: (props) => [
            // <div class='tool-bar-wrapper'>
            <div class='inner-content-box'>
              {!isNoticeMsg && fromUser.id === this.userId && (
                <div class='left-tool-abs'>
                  <toolbar msgContent={{ ...this.$attrs.message }}></toolbar>
                  {this.isGroup && (
                    <div class='read-num'>{this.readList ? this.readList.length : '0'}人已读</div>
                  )}
                  {!this.isGroup && (
                    <div class='read-num'>
                      {parseInt(this.lastReadTime) > parseInt(sendTime) ? '已读' : '未读'}
                    </div>
                  )}
                </div>
              )}
              <div class='inner-content'>
                <div class='lemon-message-file__inner'>
                  <p class='lemon-message-file__name'>{props.fileName}</p>
                  <p class='lemon-message-file__byte'>{formatByte(props.fileSize)}</p>
                </div>
                <div class='lemon-message-file__sfx'>
                  <i class='lemon-icon-attah' />
                </div>
              </div>
              {!isNoticeMsg && fromUser.id !== this.userId && (
                <div class='right-tool-abs'>
                  <toolbar msgContent={{ ...this.$attrs.message }}></toolbar>
                </div>
              )}
            </div>,
            <div class='bottom-box'>
              {markNames && (
                <div class='mark-text' style={fromUser.id === this.userId && 'text-align:right'}>
                  <i class='iconfont icon-fujian marked-color'></i>
                  {markNames}已标记了该消息，群内所有成员可见
                </div>
              )}

              <div
                class='thumb-text'
                style={fromUser.id === this.userId && 'justify-content: flex-end;'}
              >
                {thumbList &&
                  thumbList.map(({ name, type }) => (
                    <div class='per-thumb'>
                      {Object.keys(emojiObj).includes(type) && (
                        <img
                          class='thumb-icon'
                          title={emojiObj[type].title}
                          src={emojiObj[type].url}
                        />
                      )}
                      <span class='thumb-name'>{name}</span>
                    </div>
                  ))}
              </div>
            </div>,
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
    display: inline-block;
    text-align: left;
    width: auto;
    background: none;
    padding: 0;
    .tool-bar {
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

    .left-tool-abs {
      position: absolute;
      left: -130px;
      bottom: 0;
      height: 41px;

      .read-num {
        margin: 0 5px;
        min-width: 50px;
        text-align: right;
        color: #999;
        font-size: 12px;
      }
    }
    .right-tool-abs {
      position: absolute;
      left: 201px;
      bottom: 0;
    }
  }
}
.lemon-message--reverse.lemon-message-file .lemon-message__content {
  text-align: right;
  &:before {
    content: ' ';
    position: absolute;
    top: 6px;
    width: 0;
    height: 0;
    border: 4px solid transparent;
    left: auto;
    right: -4px;
    border-right: none;
    border-left-color: #fff;
  }
}

.inner-content-box {
  position: relative;
  display: inline-block;
  text-align: left;
  width: 200px;
  padding: 12px 18px;
  background: #fff;
}
.inner-content {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  width: 164px;

  // .lemon-message-file__inner {
  //   display: inline-block;
  //   width: 130px;
  // }
  // .lemon-message-file__sfx {
  //   display: inline-block;
  //   width: 34px;
  // }
}

.bottom-box {
  max-width: 330px;
}
.thumb-text {
  max-width: 330px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
}
.mark-text {
  margin: 3px 0;
  max-width: 330px;
  color: #999;
  font-size: 12px;
  line-height: 18px;
  text-align: left;
  .marked-color {
    margin: 0 2px;
    font-size: 12px;
    color: #999;
  }
}
.per-thumb {
  display: flex;
  margin-right: 3px;
  .thumb-icon {
    padding: 0;
    width: 20px;
    height: 20px;
    line-height: 20px;
    background: none;
  }
  .thumb-name {
    color: #999;
    font-size: 12px;
    line-height: 20px;
  }
}
</style>
