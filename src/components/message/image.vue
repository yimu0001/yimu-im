<script>
import Toolbar from './toolbar.vue';
import bus from '@/libs/bus';
import { Emoji_Type_Obj } from './constant';

export default {
  name: 'lemonMessageImage',
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
  inject: ['IMUI'],
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

    // <img class='content-show img-show' src={props.content} />
    return (
      <lemon-message-basic
        class='lemon-message-image abc'
        props={{ ...this.$attrs }}
        scopedSlots={{
          content: (props) => {
            return (
              <div class='tool-bar-wrapper'>
                {fromUser.id !== this.userId && (
                  <div class='only-content'>
                    <img class='content-show img-show' src={props.content} />
                    {!isNoticeMsg && <toolbar msgContent={{ ...this.$attrs.message }}></toolbar>}
                  </div>
                )}
                {fromUser.id === this.userId && (
                  <div class='all-infos'>
                    {!isNoticeMsg && (
                      <div class='two-line'>
                        <toolbar msgContent={{ ...this.$attrs.message }}></toolbar>
                        {this.isGroup && (
                          <div class='read-num little-grey-text'>
                            {this.readList ? this.readList.length : '0'}人已读
                          </div>
                        )}
                        {!this.isGroup && (
                          <div class='read-num little-grey-text'>
                            {parseInt(this.lastReadTime) > parseInt(sendTime) ? '已读' : '未读'}
                          </div>
                        )}
                      </div>
                    )}
                    <img class='content-show img-show' src={props.content} />
                  </div>
                )}
                {markNames && (
                  <div
                    class='mark-text little-grey-text'
                    style={fromUser.id === this.userId && 'text-align:right'}
                  >
                    <i class='iconfont icon-fujian marked-color'></i>
                    {markNames}已标记了该消息，群内所有成员可见
                  </div>
                )}
                <div
                  class='thumb-text'
                  style={
                    fromUser.id === this.userId
                      ? 'justify-content: flex-end;margin-left:130px;'
                      : 'margin-right:130px;'
                  }
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
                        <span class='thumb-name little-grey-text'>{name}</span>
                      </div>
                    ))}
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
  .tool-bar-wrapper .img-show {
    max-width: 200px;
    height: auto;
  }
}
.all-infos {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  .read-num {
    margin: 0 5px;
    min-width: 50px;
    text-align: right;
    color: #999;
    font-size: 12px;
  }
}
.only-content {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
}

.thumb-text {
  max-width: 330px;
}
.mark-text {
  margin: 3px 0;
  max-width: 330px;
  color: #999;
  font-size: 12px;
  line-height: 18px;
  .marked-color {
    margin: 0 2px;
    font-size: 12px;
    color: #999;
  }
}
.per-thumb {
  display: inline-block;
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
