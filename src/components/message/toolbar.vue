<script>
import bus from '@/libs/bus';
import { debounce } from 'lodash';

export default {
  name: 'toolbar',
  inheritAttrs: false,
  data() {
    return {
      message: {},
      userId: '',
      debounceThumb: {},
      debounceMark: {},
      debounceCollect: {},
    };
  },
  props: { msgContent: { default: {} } },
  watch: {
    msgContent: {
      immediate: true,
      deep: true,
      handler(val) {
        this.message = val;
      },
    },
  },
  created() {
    this.userId = sessionStorage.getItem('current_userId');

    bus.$on('setUserInfo', (userinfo) => {
      if (userinfo) {
        // id, displayName, orgid, avatar,
        this.userId = userinfo.id;
      }
    });
  },
  mounted() {
    this.debounceThumb = debounce(this.handleThumb, 400, false);
    this.debounceMark = debounce(this.handleMark, 400, false);
    this.debounceCollect = debounce(this.handleCollect, 400, false);

    this.userId = sessionStorage.getItem('current_userId');
  },
  beforeDestroy() {
    bus.$off('setUserInfo');
  },
  methods: {
    handleThumb(e) {
      e.stopPropagation();
      // 本消息体设置扩展 thumbedIds
      let thumbedIds = (this.message.expansion ? this.message.expansion.thumbedIds : []) || [];
      // 未点赞
      let unchecked = !thumbedIds.includes(this.userId);
      if (unchecked) {
        thumbedIds.push(String(this.userId));
      } else {
        thumbedIds = thumbedIds.filter((id) => id !== this.userId);
      }

      thumbedIds = thumbedIds.filter((id) => !!id);
      // type  点赞 isThumbed  标记 isMarked  收藏 isCollected
      let operate = { type: 'isThumbed', checked: unchecked };
      bus.$emit('setExpansion', { thumbedIds }, this.message, operate, (res) => {
        let optTip = unchecked ? '点赞' : '取消点赞';
        if (res.code === 0) {
          this.$Message.success(optTip + '成功');
          let expansion = { ...this.message.expansion, thumbedIds };
          this.$set(this.message, 'expansion', expansion);
        } else {
          this.$Message.error(res.msg || optTip + '失败');
        }
      });
    },
    handleReply(e) {
      e.stopPropagation();
      // 向编辑框内增加本消息的tag 发送消息时作为原消息体扩展
      // content fromUser id sendTime status toContactId type
      bus.$emit('reply', this.message);
      console.log('回复', this.message);
    },
    handleMark(e) {
      console.log('标记', this.message);
      e.stopPropagation();
      // 本消息体设置扩展 markedIds
      let markedIds = (this.message.expansion ? this.message.expansion.markedIds : []) || [];

      let unchecked = !markedIds.includes(this.userId);
      if (unchecked) {
        markedIds.push(String(this.userId));
      } else {
        markedIds = markedIds.filter((id) => id !== this.userId);
      }
      markedIds = markedIds.filter((id) => !!id);

      let operate = { type: 'isMarked', checked: unchecked };
      bus.$emit('setExpansion', { markedIds }, this.message, operate, (res) => {
        let optTip = unchecked ? '标记' : '取消标记';
        if (res.code === 0) {
          this.$Message.success(optTip + '成功');
          let expansion = { ...this.message.expansion, markedIds };
          this.$set(this.message, 'expansion', expansion);
        } else {
          this.$Message.error(res.msg || optTip + '失败');
        }
      });
    },
    handlePending(e) {
      e.stopPropagation();

      // 打开待办弹窗 填写并发布
      bus.$emit('openPending', this.message);
    },
    handleCollect(e) {
      e.stopPropagation();
      // 本消息体设置扩展 collectedIds
      let collectedIds = (this.message.expansion ? this.message.expansion.collectedIds : []) || [];
      let unchecked = !collectedIds.includes(this.userId);
      if (unchecked) {
        collectedIds.push(String(this.userId));
      } else {
        collectedIds = collectedIds.filter((id) => id !== this.userId);
      }
      collectedIds = collectedIds.filter((id) => !!id);

      let operate = { type: 'isCollected', checked: unchecked };
      bus.$emit('setExpansion', { collectedIds }, this.message, operate, (res) => {
        let optTip = unchecked ? '收藏' : '取消收藏';
        if (res.code === 0) {
          this.$Message.success(optTip + '成功');
          let expansion = { ...this.message.expansion, collectedIds };
          this.$set(this.message, 'expansion', expansion);
        } else {
          this.$Message.error(res.msg || optTip + '失败');
        }
      });
    },
  },
  render() {
    // 图片文件类型消息 状态展示失败
    let thumbed = false,
      marked = false,
      collected = false;
    if (this.message.expansion) {
      let { thumbedIds = [], markedIds = [], collectedIds = [] } = this.message.expansion;

      thumbed = thumbedIds.includes(this.userId);
      marked = markedIds.includes(this.userId);
      collected = collectedIds.includes(this.userId);
    }

    const { fromUser = {} } = this.message;

    return (
      <div
        class='tool-bar'
        style={
          fromUser.id !== this.userId ? 'justify-content: flex-start' : 'justify-content: flex-end'
        }
      >
        <i class='iconfont icon-liaotian' title='回复' onClick={this.handleReply}></i>
        <i
          class={[
            'iconfont',
            'icon-dianzan',
            thumbed ? 'selected-icon-color' : 'normal-icon-color',
          ]}
          title={thumbed ? '取消点赞' : '点赞'}
          onClick={this.debounceThumb}
        ></i>
        <i
          class={['iconfont', 'icon-icon-', marked ? 'selected-icon-color' : 'normal-icon-color']}
          title={marked ? '取消标记' : '标记'}
          onClick={this.debounceMark}
        ></i>
        <i
          class={[
            'iconfont',
            'icon-shoucang1',
            collected ? 'selected-icon-color' : 'normal-icon-color',
          ]}
          title={collected ? '取消收藏' : '收藏'}
          onClick={this.debounceCollect}
        ></i>
        <i class='iconfont icon-daibanshixiang' title='创建待办' onClick={this.handlePending}></i>
      </div>
    );
  },
};
</script>
<style lang="less" scoped>
.tool-bar {
  padding: 5px 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  visibility: hidden;
  .iconfont {
    cursor: pointer;
    margin: 0 5px;
    font-size: 16px;
    color: #999;
    &:hover {
      font-size: 16px;
      color: #0fd547;
    }
  }
  .selected-icon-color {
    // color: #f5ae15;
    color: #0fd547;
  }
  .normal-icon-color {
    color: #999;
  }
}
&:hover .tool-bar {
  visibility: visible;
}
.selected-icon-color {
  // color: #f5ae15;
  color: #0fd547;
}
.normal-icon-color {
  color: #999;
}
</style>
