<!--
 * @文件描述: 
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2021-12-24 15:26:54
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2021-12-27 11:13:24
-->

<template>
  <div class="history-box">
    <div class="common-drawer-title">
      <p class="title">历史记录</p>
      <div class="close-btn" @click="closePop">
        <i class="iconfont icon-guanbi" title="关闭"></i>
      </div>
    </div>
    <div class="history-main">
      <div class="list-block">
        <!-- <div class="history-list">
          <div class="history-item" v-for="item in historyList" :key="item.id">
            <p class="msg-content">{{ item.content }}</p>
            <div class="send-user">
              <p class="user">{{ item.sendUser }}</p>
              <p class="time">{{ item.sendTime }}</p>
            </div>
          </div>
        </div> -->

        <div class="history-list" ref="chatlist">
          <div class="per-info history-item" v-for="(item, index) in historyList" :key="index">
            <p class="msg-content">{{ item.content }}</p>
            <div class="send-user">
              <p class="user">{{ item.sendUser }}</p>
              <p class="time">{{ item.sendTime }}</p>
            </div>
          </div>
          <div ref="lastDom" class="blank-line"></div>
          <!--infinite-loading这个组件要放在列表的底部，滚动的盒子里面！-->
          <!-- spinner: 'default' | 'bubbles' | 'circles' | 'spiral' | 'waveDots' -->
          <infinite-loading @infinite="infiniteHandler">
            <span slot="no-more" class="gray-text">到底啦</span>
            <span slot="no-results" class="gray-text">
              暂无评论
            </span>
          </infinite-loading>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';
import { Button, Input, Message, Avatar } from 'element-ui';
export default {
  name: 'HistoryDialog',
  components: {
    elButton: Button,
    elInput: Input,
    Message,
    elAvatar: Avatar,
    'infinite-loading': InfiniteLoading,
  },
  data() {
    return {
      // 公告列表
      historyList: [
        {
          id: 1,
          content:
            '这是一条公告，公告内容如下。这是一条公告，公告内容如下。这是一条公告，公告内容如下。这是一条公告，公告内容如下',
          sendUser: '张三',
          sendTime: '2021-11-25 15:25',
          historyUser: '刘金栋',
        },
        {
          id: 2,
          content:
            '这是一条公告，公告内容如下。这是一条公告，公告内容如下。这是一条公告，公告内容如下。这是一条公告，公告内容如下',
          sendUser: '李四',
          sendTime: '2021-11-15 09:54',
          historyUser: '刘金栋',
        },
      ],
      historyContent: '',
      finished: false,
    };
  },
  props: {
    contact: {
      type: Object,
    },
    closeMethod: {
      type: Function,
      default: () => {},
    },
  },
  mounted() {},
  methods: {
    closePop() {
      this.closeMethod();
    },
    getChatList() {
      console.log('接口获取历史记录列表');
      // groupMembers(this.vContact.id).then((res) => {
      //   if (res.status === 200) {
      //     this.groupMemberList = res.data.data;
      //   } else {
      //     Message.error(res.data.msg);
      //   }
      // });
    },
    infiniteHandler($state) {
      if (this.finished) {
        return false;
      }

      this.getChatList(() => {
        this.finished ? $state.complete() : $state.loaded();
      });
    },
  },
};
</script>

<style lang="less" scoped>
// 历史记录
.history-box {
  height: 100%;
  background-color: #f2f2f2;

  .common-drawer-title {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    .title {
      font-size: 14px;
      color: #000;
    }
    .close-btn {
      cursor: pointer;
      font-size: 16px;
      color: #999;
    }
  }
  .history-main {
    padding: 15px 20px;

    .history-list {
      overflow-y: scroll;
      .history-item {
        margin: 10px 0;
        padding: 5px 15px;
        border: 1px solid #ececec;
        background: #fff;
        border-radius: 4px;
        font-size: 14px;
        line-height: 30px;
        .msg-content {
          padding: 4px 0;
          line-height: 20px;
          color: #333;
        }
        .send-user {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .user {
            margin-right: 20px;
            font-size: 12px;
            color: #666;
          }
          .time {
            color: #999;
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
