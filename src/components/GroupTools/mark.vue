<template>
  <div class="mark-box">
    <div class="common-drawer-title">
      <p class="title">重要标记</p>
      <div class="close-btn" @click="closePop"><i class="el-icon-close"></i></div>
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
            <div class="top-user">{{ item.markUser }}</div>
            <p class="msg-content">{{ item.content }}</p>
            <div class="send-user">
              <p class="user">{{ item.sendUser }}</p>
              <p class="time">{{ item.sendTime }}</p>
              <i class="iconfont icon-jinru" title="查看"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Button, Input, Message, Avatar, Checkbox, Tabs, TabPane } from 'element-ui';
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
  },
  data() {
    return {
      activeMarkKey: 'my',
      markKeyword: '',
      markList: [
        {
          id: 1,
          content:
            '这是一条消息，消息内容如下。这是一条消息，消息内容如下。这是一条消息，消息内容如下。这是一条消息，消息内容如下',
          sendUser: '张三',
          sendTime: '2021-11-25 15:25',
          markUser: '刘金栋',
        },
        {
          id: 2,
          content:
            '这是一条消息，消息内容如下。这是一条消息，消息内容如下。这是一条消息，消息内容如下。这是一条消息，消息内容如下',
          sendUser: '李四',
          sendTime: '2021-11-15 09:54',
          markUser: '刘金栋',
        },
      ],
    };
  },
  props: {
    baseUrl: {
      type: String,
      default: 'https://im.shandian8.com',
    },
    contact: {
      type: Object,
    },
    closeMethod: {
      type: Function,
      default: () => {},
    },
  },
  watch: {
    baseUrl(val) {
      this.my_baseUrl = val;
    },
    activeMarkKey(key) {
      if (key) {
        this.markKeyword = '';
        this.getMarkList();
      }
    },
    markKeyword() {
      this.getMarkList();
    },
  },
  mounted() {},
  methods: {
    closePop() {
      console.log('关闭抽屉');
      this.closeMethod();
    },
    getMarkList() {
      console.log('接口获取已标记列表');
      // groupMembers(this.my_baseUrl, this.vContact.id).then((res) => {
      //   if (res.status === 200) {
      //     this.groupMemberList = res.data.data;
      //   } else {
      //     Message.error(res.data.msg);
      //   }
      // });
    },
    // 多选框选中数据
    // handleSelectionChange(selection) {
    //   this.ids = selection.map((item) => item.id);
    // },
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
    padding: 15px 20px;
    .mark-list {
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
