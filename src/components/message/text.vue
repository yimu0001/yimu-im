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
    return { isSender: false, readNum: 0 };
  },
  inheritAttrs: false,
  inject: ['IMUI'],
  components: { Toolbar, elPopover: Popover },
  mounted() {
    const { fromUser, toContactId } = this.$attrs.message;
    this.isSender = fromUser.id === sessionStorage.getItem('current_userId');

    bus.$on('updateReadNum', (readList, targetId) => {
      if (toContactId === targetId) {
        this.readNum = readList ? Object.keys(readList).length : 0;
      }
    });
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
    return (
      <lemon-message-basic
        class='lemon-message-text'
        props={{ ...this.$attrs }}
        scopedSlots={{
          content: (props) => {
            const content = this.IMUI.emojiNameToImage(props.content);
            const replyObj = this.$attrs.message.referMsg;

            return (
              <div class='tool-bar-wrapper'>
                {this.isSender ? (
                  <div class='all-infos'>
                    <div class='read-num'>{<p>{this.readNum}人已读</p>}</div>
                    <div class='content-show' domProps={{ innerHTML: content }} />
                  </div>
                ) : (
                  <div class='only-content'>
                    <div class='content-show' domProps={{ innerHTML: content }} />
                  </div>
                )}
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

<style lang="less" scoped>
.tool-bar-wrapper {
  .all-infos {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    .read-num {
      margin: 2px 3px;
      min-width: 1px;
      max-width: 100px;
      color: #999;
      font-size: 12px;
    }
  }
  .only-content {
    display: flex;
  }
  .content-show {
    max-width: 400px;
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
    padding: 3px 0 0 0;
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
</style>
