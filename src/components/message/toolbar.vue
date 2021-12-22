<script>
import bus from '@/libs/bus';
import { Message } from 'element-ui';

export default {
  name: 'toolbar',
  inheritAttrs: false,
  data() {
    return { message: {}, user: { id: '', displayName: '', orgid: '', avatar: '' } };
  },
  props: { msgContent: { default: {} } },
  components: { Message },
  watch: {
    msgContent: {
      immediate: true,
      deep: true,
      handler() {
        this.message = this.msgContent;
      },
    },
  },
  mounted() {
    let obj = sessionStorage.getItem('current_user');
    if (obj) {
      this.user = JSON.parse(obj);
    }

    bus.$on('setUserInfo', (userinfo) => {
      if (userinfo) {
        // id, displayName, orgid, avatar,
        this.user = userinfo;
      }
    });
  },
  beforeDestroy() {
    bus.$off('setUserInfo');
  },
  methods: {
    handleThumb(e) {
      e.stopPropagation();
      // 本消息体设置扩展 thumbedIds
      let thumbedIds = (this.message.expansion ? this.message.expansion.thumbedIds : []) || [];
      let unchecked = !thumbedIds.includes(this.user.id);
      if (unchecked) {
        thumbedIds.push(String(this.user.id));
      } else {
        thumbedIds = thumbedIds.filter((id) => id !== this.user.id);
      }

      thumbedIds = thumbedIds.filter((id) => !!id);
      bus.$emit('setExpansion', { thumbedIds }, this.message, (res) => {
        let optTip = unchecked ? '点赞' : '取消点赞';
        if (res.code === 0) {
          Message.success(optTip + '成功');
          let expansion = { ...this.message.expansion, thumbedIds };
          this.$set(this.message, 'expansion', expansion);
        } else {
          Message.error(res.msg || optTip + '失败');
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
      e.stopPropagation();
      // 本消息体设置扩展 markedIds
      let markedIds = (this.message.expansion ? this.message.expansion.markedIds : []) || [];

      let unchecked = !markedIds.includes(this.user.id);
      if (unchecked) {
        markedIds.push(String(this.user.id));
      } else {
        markedIds = markedIds.filter((id) => id !== this.user.id);
      }
      markedIds = markedIds.filter((id) => !!id);

      bus.$emit('setExpansion', { markedIds }, this.message, (res) => {
        let optTip = unchecked ? '标记' : '取消标记';
        if (res.code === 0) {
          Message.success(optTip + '成功');
          let expansion = { ...this.message.expansion, markedIds };
          this.$set(this.message, 'expansion', expansion);
        } else {
          Message.error(res.msg || optTip + '失败');
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
      let unchecked = !collectedIds.includes(this.user.id);
      if (unchecked) {
        collectedIds.push(String(this.user.id));
      } else {
        collectedIds = collectedIds.filter((id) => id !== this.user.id);
      }
      collectedIds = collectedIds.filter((id) => !!id);

      bus.$emit('setExpansion', { collectedIds }, this.message, (res) => {
        let optTip = unchecked ? '收藏' : '取消收藏';
        if (res.code === 0) {
          Message.success(optTip + '成功');
          let expansion = { ...this.message.expansion, collectedIds };
          this.$set(this.message, 'expansion', expansion);
        } else {
          Message.error(res.msg || optTip + '失败');
        }
      });
    },
  },
  render() {
    let thumbed = false,
      marked = false,
      collected = false;
    if (this.message.expansion) {
      let { thumbedIds = [], markedIds = [], collectedIds = [] } = this.message.expansion;

      thumbed = thumbedIds.includes(this.user.id);
      marked = markedIds.includes(this.user.id);
      collected = collectedIds.includes(this.user.id);
    }

    return (
      <div class='tool-bar'>
        <i class='iconfont icon-liaotian' title='回复' onClick={this.handleReply}></i>

        <i
          class={['iconfont', 'icon-dianzan', thumbed ? 'selected' : 'normal']}
          title={thumbed ? '取消点赞' : '点赞'}
          onClick={this.handleThumb}
        ></i>

        <i
          class={['iconfont', 'icon-icon-', marked ? 'selected' : 'normal']}
          title={marked ? '取消标记' : '标记'}
          onClick={this.handleMark}
        ></i>

        <i
          class={['iconfont', 'icon-shoucang1', collected ? 'selected' : 'normal']}
          title={collected ? '取消收藏' : '收藏'}
          onClick={this.handleCollect}
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
  .selected {
    // color: #f5ae15;
    color: #0fd547;
  }
  .normal {
    color: #999;
  }
}
&:hover .tool-bar {
  visibility: visible;
}
</style>
