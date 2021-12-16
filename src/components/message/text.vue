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
            const replyObj = this.$attrs.message.referMsg;

            return (
              <div class='tool-bar-wrapper'>
                <div class='content-show' domProps={{ innerHTML: content }} />
                {replyObj && (
                  <div>
                    {replyObj.type === 'text' && (
                      <div class='init-msg over_hide_1'>
                        {replyObj.displayName}：{replyObj.content}
                      </div>
                    )}
                    {replyObj.type === 'image' && (
                      <div class='init-msg msg-img over_hide_1'>
                        {replyObj.displayName}：
                        <img class='rep-img' src={replyObj.content} alt='' />
                      </div>
                    )}
                    {replyObj.type === 'file' && (
                      <div class='init-msg over_hide_1'>
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
.over_hide_1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tool-bar-wrapper {
  .content-show {
    border-radius: 2px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.04);
    margin-bottom: 8px;
  }
  .init-msg {
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
</style>
