<script>
export default {
  name: 'toolbar',
  inheritAttrs: false,
  render() {
    return (
      <div class='tool-bar'>
        <i class='iconfont icon-dianzan' title='点赞'></i>
        <i class='iconfont icon-liaotian' title='回复'></i>
        <i class='iconfont icon-icon-' title='标记'></i>
        <i class='iconfont icon-daiban1' title='创建待办'></i>
        <i class='iconfont icon-shoucang1' title='收藏'></i>
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
      color: rgb(45, 153, 224);
    }
  }
}
&:hover .tool-bar {
  visibility: visible;
}
</style>
