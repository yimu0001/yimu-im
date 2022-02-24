<script>
import Toolbar from './toolbar.vue';
import bus from '@/libs/bus';
import { Popover } from 'element-ui';
import { Emoji_Type_Obj } from './constant';
// <el-tooltip
//   class='item'
//   effect='dark'
//   content={replyObj.content}
//   placement='bottom'
// >
//   <div class='init-msg over_hide_1'>
//     {replyObj.displayName}：{replyObj.content}
//   </div>
// </el-tooltip>

export default {
  name: 'lemonMessageText',
  data() {
    return {
      userId: null,
      lastReadTime: null,
      isGroup: false,
      readList: [],
      expansionObj: {},
      hideRead: true,
    };
  },
  inheritAttrs: false,
  inject: ['IMUI'],
  components: { Toolbar, elPopover: Popover },
  mounted() {
    this.userId = sessionStorage.getItem('current_userId');
    this.isGroup = this.$attrs.message.conversationType === 3;

    bus.$on('updateReadNum', (targetId, readUserId, sentTime) => {
      if (this.$attrs.message.toContactId === targetId) {
        readUserId && this.readList.push(readUserId);
        sentTime && (this.lastReadTime = sentTime);
      }
    });
    bus.$on('setSingleReadStatus', (lastTime) => {
      this.lastReadTime = lastTime;
    });
    bus.$on('setGroupReadStatus', (list) => {
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
  methods: {
    previewMsg() {
      let msg = this.$attrs.message.referMsg;
      console.log('预览', this.$attrs.message);
      if (msg.type === 'image') {
        bus.$emit('previewReplyImg', msg.content);
      }
    },
  },
  render() {
    // 原本在最后一个</div>前面
    // <toolbar msgContent={{ ...this.$attrs.message }}></toolbar>
    return (
      <lemon-message-basic
        class='lemon-message-text'
        props={{ ...this.$attrs }}
        scopedSlots={{
          content: (props) => {
            let emojiObj = Emoji_Type_Obj;
            // 回复的消息带着user对象？
            let info = props.content instanceof Object ? props.content.content : props.content;
            const content = this.IMUI.emojiNameToImage(info);
            const replyObj = this.$attrs.message.referMsg;
            this.expansionObj = this.$attrs.message.expansion;
            const { fromUser, sendTime } = this.$attrs.message;
            const isNoticeMsg = Number(fromUser.id) < 0;

            let markNames = '';
            let thumbList = [];
            if (this.expansionObj) {
              let { markedObj = {}, thumbedInfo = {} } = this.expansionObj;
              markNames = Object.values(markedObj).join('，');
              thumbList = Object.values(thumbedInfo);
            }

            return (
              <div
                class='tool-bar-wrapper'
                style={fromUser.id === this.userId && 'text-align:right'}
              >
                <div class='relate-box'>
                  <div class='content-show' domProps={{ innerHTML: content }} />

                  {!isNoticeMsg && fromUser.id !== this.userId && (
                    <div class='abs-right-pos'>
                      <toolbar msgContent={{ ...this.$attrs.message }}></toolbar>
                    </div>
                  )}
                  {!isNoticeMsg && fromUser.id === this.userId && (
                    <div class='abs-left-pos'>
                      <toolbar msgContent={{ ...this.$attrs.message }}></toolbar>
                      {this.hideRead && this.isGroup && (
                        <div class='read-num'>
                          {this.readList ? this.readList.length : '0'}人已读
                        </div>
                      )}
                      {this.hideRead && !this.isGroup && this.lastReadTime > sendTime && (
                        <div class='read-num'>已读</div>
                      )}
                    </div>
                  )}
                </div>

                {replyObj && (
                  <div>
                    {replyObj.type === 'text' && (
                      <el-popover
                        popper-class='reply-text-pre'
                        placement='bottom'
                        width='200'
                        trigger='click'
                        content={replyObj.content}
                      >
                        <div slot='reference' class='init-msg over_hide_1 noselect'>
                          {replyObj.displayName}：{replyObj.content}
                        </div>
                      </el-popover>
                    )}
                    {replyObj.type === 'image' && (
                      <div class='init-msg msg-img over_hide_1 noselect' onClick={this.previewMsg}>
                        {replyObj.displayName}：
                        <img class='rep-img' src={replyObj.content} alt='' />
                      </div>
                    )}
                    {replyObj.type === 'file' && (
                      <div class='init-msg over_hide_1 noselect'>
                        {replyObj.displayName}：<i class='lemon-icon-attah' />
                        {replyObj.fileName}
                      </div>
                    )}
                  </div>
                )}

                {markNames && (
                  <div class='mark-text' style={fromUser.id === this.userId && 'text-align:right'}>
                    <i class='iconfont icon-fujian marked-color'></i>
                    {markNames}已标记了该消息，群内所有成员可见
                  </div>
                )}
                <div class='thumb-text' style={fromUser.id === this.userId && 'text-align:right'}>
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
  .relate-box {
    display: inline-block;
    position: relative;
    .abs-right-pos {
      position: absolute;
      bottom: 0;
      right: 0;
      transform: translateX(100%);
    }
    .abs-left-pos {
      position: absolute;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      display: flex;
      align-items: flex-end;
      .read-num {
        margin: 2px 4px;
        width: auto;
        white-space: nowrap;
        text-align: right;
        color: #999;
        font-size: 12px;
      }
    }
  }
  .content-show {
    text-align: left;
    max-width: 360px;
    min-width: 60px;
    border-radius: 2px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.04);
    margin-bottom: 8px;
  }

  .init-msg {
    cursor: pointer;
    margin-top: 5px;
    padding: 0 10px;
    max-width: 300px;
    height: 26px;
    line-height: 26px;
    font-size: 12px;
    background-color: #e8e8e8;
    border-radius: 2px;
    color: #999;
    box-sizing: border-box;
  }
  .msg-img {
    padding: 5px 10px;
    height: auto;
    .rep-img {
      width: 80px;
      height: auto;
    }
  }
  .tool-bar {
    visibility: hidden;
    .iconfont {
      margin: 5px 5px 0;
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
.thumb-text {
  max-width: 360px;
}
.mark-text {
  margin: 3px 0;
  max-width: 360px;
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
