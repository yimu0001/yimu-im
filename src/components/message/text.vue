<script>
import Toolbar from './toolbar.vue';
import bus from '@/libs/bus';
import { Popover } from 'element-ui';
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
    return { readNum: 0, userId: null, lastReadTime: null, isGroup: false, readList: [] };
  },
  inheritAttrs: false,
  inject: ['IMUI'],
  components: { Toolbar, elPopover: Popover },
  mounted() {
    this.userId = sessionStorage.getItem('current_userId');
    this.isGroup = this.$attrs.message.conversationType === 3;

    bus.$on('updateReadNum', (readList, targetId) => {
      if (this.$attrs.message.toContactId === targetId) {
        this.readNum = readList ? Object.keys(readList).length : 0;
      }
    });
    bus.$on('setSingleReadStatus', (lastTime) => {
      this.lastReadTime = lastTime;
    });
    bus.$on('setGroupReadStatus', (list) => {
      let userList = list[this.$attrs.message.id] || [];
      this.readNum = userList.length || 0;
    });
  },
  beforeDestroy() {
    bus.$off('updateReadNum');
    bus.$off('setSingleReadStatus');
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
            const content = this.IMUI.emojiNameToImage(props.content);
            const replyObj = this.$attrs.message.referMsg;
            const { fromUser, expansion, sendTime } = this.$attrs.message;
            const isNoticeMsg = Number(fromUser.id) < 0;

            let markNames = '';
            let thumbList = [];
            if (expansion) {
              let { markedObj = {}, thumbedInfo = {} } = expansion;
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
                      {this.isGroup && <div class='read-num'>{this.readNum}人已读</div>}
                      {!this.isGroup && this.lastReadTime > sendTime && (
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
                    <i class='iconfont icon-icon- marked-color'></i>
                    {markNames}已标记了该消息，群内所有成员可见
                  </div>
                )}
                <div class='thumb-text' style={fromUser.id === this.userId && 'text-align:right'}>
                  {thumbList &&
                    thumbList.map(({ name, type }) => (
                      <div class='per-thumb'>
                        {type === '1' && (
                          <i class='thumb-icon' title='爱心'>
                            ❤️
                          </i>
                        )}
                        {type === '2' && (
                          <i class='thumb-icon' title='OK'>
                            👌
                          </i>
                        )}
                        {type === '3' && (
                          <i class='thumb-icon' title='赞'>
                            👍
                          </i>
                        )}
                        {type === '4' && (
                          <i class='thumb-icon' title='鼓掌'>
                            👏
                          </i>
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
    line-height: 18px;
    text-align: center;
    font-style: normal;
    font-size: 16px;
  }
  .thumb-name {
    color: #999;
    font-size: 12px;
    line-height: 18px;
  }
}
</style>
