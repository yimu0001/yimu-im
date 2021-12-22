<template>
  <div class="notice-box">
    <div class="common-drawer-title">
      <p class="title">群公告</p>
      <div class="close-btn" @click="closePop">
        <i class="iconfont icon-guanbi" title="关闭"></i>
      </div>
    </div>
    <div class="notice-main">
      <div class="list-block">
        <div class="new-notice">
          <el-input type="textarea" :rows="3" placeholder="请输入内容" v-model="noticeContent">
          </el-input>
          <div class="opr-btns">
            <el-button type="primary" size="small" @click="createNotice">发布公告</el-button>
          </div>
        </div>

        <div class="notice-list">
          <div class="notice-item" v-for="item in noticeList" :key="item.id">
            <p class="msg-content">{{ item.content }}</p>
            <div class="send-user">
              <p class="user">{{ item.sendUser }}</p>
              <p class="time">{{ item.sendTime }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Button, Input, Message, Avatar } from 'element-ui';
export default {
  name: 'NoticeDrawer',
  components: {
    elButton: Button,
    elInput: Input,
    Message,
    elAvatar: Avatar,
  },
  data() {
    return {
      // 公告列表
      noticeList: [
        {
          id: 1,
          content:
            '这是一条公告，公告内容如下。这是一条公告，公告内容如下。这是一条公告，公告内容如下。这是一条公告，公告内容如下',
          sendUser: '张三',
          sendTime: '2021-11-25 15:25',
          noticeUser: '刘金栋',
        },
        {
          id: 2,
          content:
            '这是一条公告，公告内容如下。这是一条公告，公告内容如下。这是一条公告，公告内容如下。这是一条公告，公告内容如下',
          sendUser: '李四',
          sendTime: '2021-11-15 09:54',
          noticeUser: '刘金栋',
        },
      ],
      noticeContent: '',
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
    getNoticeList() {
      console.log('接口获取待办列表');
      // groupMembers(this.vContact.id).then((res) => {
      //   if (res.status === 200) {
      //     this.groupMemberList = res.data.data;
      //   } else {
      //     Message.error(res.data.msg);
      //   }
      // });
    },
    createNotice() {
      console.log('公告内容', this.noticeContent);
    },
    // 多选框选中数据
    // handleSelectionChange(selection) {
    //   this.ids = selection.map((item) => item.id);
    // },
  },
};
</script>

<style lang="less" scoped>
// 待办事项
.notice-box {
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
  .notice-main {
    padding: 15px 20px;

    .new-notice {
      padding: 10px 0;
      .opr-btns {
        padding-top: 10px;
        text-align: right;
      }
    }
    .notice-list {
      .notice-item {
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
