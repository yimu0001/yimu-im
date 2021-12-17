<script>
import bus from '@/libs/bus';

export default {
  name: 'toolbar',
  inheritAttrs: false,
  data() {
    return { message: {} };
  },
  props: { msgContent: { default: {} } },
  // content: "https://img12.shandian8.com/1/im/202112/06/b815786069294b12b946a7e4db05d8d6.jpg"
  // fromUser: {
  //   avatar: "https://img12.iqilu.com//1/2019/09/03/d263847adf8b4835acb1dee6c057f32f.jpg"
  //   displayName: "赵婷婷"
  //   id: "1000053"
  //   orgid: "1"
  // }
  // id: "BTHM-ARUH-O3I5-GS8V"
  // sendTime: 1638757941063
  // status: "succeed"
  // toContactId: "4575"
  // type: "image"
  watch: {
    msgContent: {
      immediate: true,
      deep: true,
      handler() {
        this.message = this.msgContent;
      },
    },
  },
  methods: {
    handleThumb(e) {
      e.stopPropagation();
      // 本消息体增加扩展thumbed: true
      console.log('点赞', e);
    },
    handleReply(e) {
      e.stopPropagation();
      // 向编辑框内增加本消息的tag 发送消息时作为原消息体扩展
      // content fromUser id sendTime status toContactId type
      bus.$emit('reply', this.message);
      console.log('回复', this.message);

      // const { id, type, content, fromUser, fileName = '' } = this.message;
      // let obj = { id, type, content, displayName: fromUser.displayName, fileName };
      // // 传递obj 聚焦输入框
      // bus.$emit('reply', obj);
      // console.log('回复', e, obj);
    },
    handleMark(e) {
      e.stopPropagation();
      // 本消息体增加扩展marked: true
      console.log('标记', e);
    },
    handlePending(e) {
      e.stopPropagation();
      bus.$emit('openPending', this.message);
      // 打开待办弹窗 填写并发布
      console.log('创建待办', e);
    },
    handleCollect(e) {
      e.stopPropagation();
      console.log('创建待办', e);
    },
  },
  render() {
    return (
      <div class='tool-bar'>
        <i class='iconfont icon-dianzan' title='点赞' onClick={this.handleThumb}></i>
        <i class='iconfont icon-liaotian' title='回复' onClick={this.handleReply}></i>
        <i class='iconfont icon-icon-' title='标记' onClick={this.handleMark}></i>
        <i class='iconfont icon-daibanshixiang' title='创建待办' onClick={this.handlePending}></i>
        <i class='iconfont icon-shoucang1' title='收藏' onClick={this.handleCollect}></i>
      </div>
    );
  },
};
</script>
<style lang="less" scoped>
.tool-bar {
  padding: 5px 0;
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
</style>
