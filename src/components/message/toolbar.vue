<script>
export default {
  name: 'toolbar',
  inheritAttrs: false,
  methods: {
    handleThumb(e) {
      e.stopPropagation();
      console.log('点赞', e);
    },
    handleReply(e) {
      e.stopPropagation();
      console.log('回复', e);
    },
    handleMark(e) {
      e.stopPropagation();
      console.log('标记', e);
    },
    handlePending(e) {
      e.stopPropagation();
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
