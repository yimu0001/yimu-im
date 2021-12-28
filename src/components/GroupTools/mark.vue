<template>
  <div class="mark-box">
    <div class="common-drawer-title">
      <p class="title">重要标记</p>
      <div class="close-btn" @click="closePop">
        <i class="iconfont icon-guanbi" title="关闭"></i>
      </div>
    </div>
    <div class="mark-main">
      <el-tabs v-model="activeMarkKey">
        <el-tab-pane label="我的" name="my"></el-tab-pane>
        <el-tab-pane label="所有" name="all"></el-tab-pane>
      </el-tabs>
      <div class="list-block">
        <div class="filter">
          <el-input
            size="small"
            style="width:300px"
            placeholder="请输入内容"
            prefix-icon="el-icon-search"
            v-model="markKeyword"
            clearable
          >
          </el-input>
        </div>
        <div class="mark-list">
          <div class="mark-item" v-for="item in markList" :key="item.id">
            <div class="top-user">{{ item.markUserName }}</div>
            <p class="msg-content">{{ item.newsContent }}</p>
            <div class="send-user">
              <p class="user">{{ item.newsUserName }}</p>
              <p class="time">{{ item.pushTime }}</p>
              <i class="iconfont icon-jinru" title="查看" @click="checkHistory(item)"></i>
            </div>
          </div>
          <infinite-loading @infinite="infiniteHandler" :distance="200" :identifier="activeMarkKey">
            <span slot="no-more" class="gray-text">到底啦</span>
            <span slot="no-results" class="gray-text">
              {{ finished ? '到底啦' : '暂无数据' }}
            </span>
          </infinite-loading>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';
import { Button, Input, Message, Avatar, Checkbox, Tabs, TabPane } from 'element-ui';
import { fetchMarkList } from '@/api/event';

export default {
  name: 'MarkDrawer',
  components: {
    elButton: Button,
    elInput: Input,
    Message,
    elAvatar: Avatar,
    elCheckbox: Checkbox,
    elTabs: Tabs,
    elTabPane: TabPane,
    'infinite-loading': InfiniteLoading,
  },
  data() {
    return {
      activeMarkKey: 'my',
      markKeyword: '',
      markList: [],
      // [{
      //   id: 1,
      //   newsContent:
      //     '这是一条消息，消息内容如下。这是一条消息，消息内容如下。这是一条消息，消息内容如下。这是一条消息，消息内容如下',
      //   newsUserName: '张三',
      //   pushTime: '2021-11-25 15:25',
      //   markUserName: '刘金栋',
      // }]
      historyPop: false,
      page: 1,
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
    openHistory: {
      type: Function,
      default: () => {},
    },
  },
  watch: {
    activeMarkKey(key) {
      if (key) {
        this.markKeyword = '';
        this.refreshParam();
      }
    },
    markKeyword() {
      this.refreshParam();
      this.$nextTick(this.getMarkList);
    },
  },
  mounted() {
    // this.getMarkList();
  },
  methods: {
    closePop() {
      this.closeMethod();
    },
    refreshParam() {
      this.finished = false;
      this.page = 1;
      this.markList = [];
    },
    getMarkList(cb) {
      let pageNow = this.page;
      let type = this.activeMarkKey === 'my' ? 'my' : '';
      fetchMarkList(this.contact.isGroup, this.contact.id, this.page, type, this.markKeyword).then(
        (res) => {
          console.log('接口获取已标记列表', res.data);
          if (res.status === 200) {
            const { list, num, pages } = res.data.data;
            if (pageNow === 1) {
              this.markList = list;
            } else {
              this.markList = this.markList.concat(list);
            }

            if (pageNow >= pages) {
              this.page = pages;
              this.finished = true;
            } else {
              this.page = pageNow + 1;
            }
          } else {
            Message.error(res.data.msg);
          }

          cb && cb();
        }
      );
    },

    infiniteHandler($state) {
      if (this.finished) {
        return false;
      }

      this.getMarkList(() => {
        this.finished ? $state.complete() : $state.loaded();
      });
    },
    checkHistory(item) {
      this.openHistory(item);
    },
  },
};
</script>

<style lang="less" scoped>
// 重要标记
.mark-box {
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
  .mark-main {
    padding: 15px 0 15px 20px;
    background: #f2f2f2;
    box-sizing: border-box;
    .mark-list {
      margin: 10px 0;
      padding-bottom: 40px;
      overflow-y: scroll;
      height: 367px;
      .mark-item {
        margin: 10px 0;
        padding: 5px 15px;
        border: 1px solid #ececec;
        background: #fff;
        border-radius: 4px;
        font-size: 14px;
        line-height: 30px;
        .top-user {
          text-align: right;
          color: #999;
        }
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
          .icon-jinru {
            padding: 0 10px;
            cursor: pointer;
            font-size: 18px;
            color: #999;
          }
        }
      }
    }
  }
}
</style>
