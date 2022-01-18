<script>
import bus from '@/libs/bus';
import { debounce } from 'lodash';
import { Popover } from 'element-ui';

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
      emojiType: 0,
    };
  },
  props: { msgContent: { default: {} } },
  components: { elPopover: Popover },
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
    let str = sessionStorage.getItem('current_user');
    if (str) {
      let info = JSON.parse(str);
      this.userName = info.displayName;
    }

    bus.$on('setUserInfo', (userinfo) => {
      if (userinfo) {
        // id, displayName, orgid, avatar,
        this.userId = userinfo.id;
        this.userName = userinfo.displayName;
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
    onThumbType(type) {
      this.emojiType = type;
      this.debounceThumb();
    },
    handleThumb() {
      let commentObj = {
        name: this.userName,
        type: this.emojiType,
      };

      let thumbedInfo = (this.message.expansion ? this.message.expansion.thumbedInfo : {}) || {};
      // let thumbedIds = (this.message.expansion ? this.message.expansion.thumbedIds : []) || [];

      // 没有取消点赞这一说，所以只要是点击了都是true 第一次点赞就通知后端 否则不通知
      let firstOperate = !thumbedInfo[this.userId];
      thumbedInfo[this.userId] = commentObj;
      let operate = firstOperate ? { type: 'isThumbed', checked: true } : null;

      bus.$emit('setExpansion', { thumbedInfo }, this.message, operate, (res) => {
        if (res.code === 0) {
          this.$Message.success('评论成功');
          let expansion = { ...this.message.expansion, thumbedInfo };
          this.$set(this.message, 'expansion', expansion);
          bus.$emit('setComplexExpand', this.message.id, expansion);
        } else {
          this.$Message.error(res.msg || '评论失败');
        }
      });
    },
    handleReply(e) {
      e.stopPropagation();
      // 向编辑框内增加本消息的tag 发送消息时作为原消息体扩展
      // content fromUser id sendTime status toContactId type
      bus.$emit('reply', this.message);
    },
    handleMark(e) {
      e.stopPropagation();
      // 本消息体设置扩展 markedIds
      let markedObj = (this.message.expansion ? this.message.expansion.markedObj : {}) || {};
      // let markedIds = (this.message.expansion ? this.message.expansion.markedIds : []) || [];

      let unchecked = !markedObj[this.userId];
      if (unchecked) {
        markedObj[this.userId] = this.userName;
      } else {
        // 在遍历中使用会有性能问题
        delete markedObj[this.userId];
      }

      let operate = { type: 'isMarked', checked: unchecked };

      bus.$emit('setExpansion', { markedObj }, this.message, operate, (res) => {
        let optTip = unchecked ? '标记' : '取消标记';
        if (res.code === 0) {
          this.$Message.success(optTip + '成功');
          let expansion = { ...this.message.expansion, markedObj };
          this.$set(this.message, 'expansion', expansion);
          bus.$emit('setComplexExpand', this.message.id, expansion);
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
    // <img class='emoji-icon icon-img' src={require('@/assets/heart.png')} />

    return (
      <div
        class='tool-bar'
        style={
          fromUser.id !== this.userId ? 'justify-content: flex-start' : 'justify-content: flex-end'
        }
      >
        <i class='iconfont icon-liaotian' title='回复' onClick={this.handleReply}></i>
        <i
          class={['iconfont', 'icon-icon-', marked ? 'selected-icon-color' : 'normal-icon-color']}
          title={marked ? '取消标记' : '标记'}
          onClick={this.debounceMark}
        ></i>

        <el-popover popper-class='reply-emoji-pop' placement='top' width='160' trigger='hover'>
          <div class='emoji-list'>
            <i
              class='emoji-icon'
              title='爱心'
              onClick={() => {
                this.onThumbType('1');
              }}
            >
              ❤️
            </i>
            <i
              class='emoji-icon'
              title='OK'
              onClick={() => {
                this.onThumbType('2');
              }}
            >
              👌
            </i>
            <i
              class='emoji-icon'
              title='赞'
              onClick={() => {
                this.onThumbType('3');
              }}
            >
              👍
            </i>
            <i
              class='emoji-icon'
              title='鼓掌'
              onClick={() => {
                this.onThumbType('4');
              }}
            >
              👏
            </i>
          </div>
          <div slot='reference'>
            <i
              class={[
                'iconfont',
                'icon-dianzan',
                thumbed ? 'selected-icon-color' : 'normal-icon-color',
              ]}
              title={thumbed ? '取消点赞' : '点赞'}
            ></i>
          </div>
        </el-popover>
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
