<template>
  <div class="notice-box">
    <div class="common-drawer-title">
      <p class="title">群公告</p>
      <div class="close-btn" @click="closePop">
        <i class="iconfont icon-guanbi" title="关闭"></i>
      </div>
    </div>
    <div class="notice-main narrow-scroll-bar">
      <div class="list-block">
        <div class="new-notice">
          <el-input type="textarea" :rows="3" placeholder="请输入内容" v-model="noticeContent">
          </el-input>
          <div class="opr-btns">
            <el-button type="primary" :loading="pushLoading" size="small" @click="createNotice"
              >发布公告</el-button
            >
          </div>
        </div>

        <div class="notice-list">
          <div class="notice-item" v-for="item in noticeList" :key="item.id">
            <p class="msg-content">{{ item.content }}</p>
            <div class="send-user">
              <div class="user">
                <img class="user-pic" :src="item.user.avatar" alt="" />
                <p class="user-name">{{ item.user.nickname }}</p>
              </div>
              <p class="time">{{ item.created_at }}</p>
            </div>
          </div>
          <infinite-loading @infinite="infiniteHandler" :distance="200" :identifier="contact.id">
            <span slot="no-more" class="gray-text">到底啦</span>
            <span slot="no-results" class="gray-text">
              {{ finished && noticeList.length > 0 ? '到底啦' : '暂无数据' }}
            </span>
          </infinite-loading>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';
import { fetchGroupNoticeList, createGroupNotice } from '@/api/chat';
import { CalcTargetId } from '@/libs/tools';
import bus from '@/libs/bus';
import { Button, Input } from 'element-ui';
export default {
  name: 'NoticeDrawer',
  components: {
    elButton: Button,
    elInput: Input,
    'infinite-loading': InfiniteLoading,
  },
  data() {
    return {
      // 公告列表
      noticeList: [],
      noticeContent: '',
      pushLoading: false,
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
  },
  watch: {
    'contact.id'(id) {
      this.refreshParam();
    },
  },
  mounted() {
    bus.$on('refreshDrawerData_3', () => {
      console.log('refreshDrawerData_3');
      this.refreshParam();
      this.getNoticeList();
    });
  },
  beforeDestroy() {
    bus.$off('refreshDrawerData_3');
  },
  methods: {
    closePop() {
      this.closeMethod();
    },
    refreshParam() {
      this.finished = false;
      this.page = 1;
      this.noticeList = [];
    },
    getNoticeList(cb) {
      let pageNow = this.page;
      fetchGroupNoticeList(CalcTargetId(this.contact.id), this.page).then((res) => {
        console.log('接口获取列表', res);
        if (res.status === 200) {
          const { last_page, list } = res.data.data;
          if (pageNow === 1) {
            this.noticeList = list;
          } else {
            this.noticeList = this.noticeList.concat(list);
          }

          this.finished = pageNow >= last_page;
          if (!this.finished) {
            this.page = pageNow + 1;
          }
        } else {
          this.$Message.error(res.data.msg);
        }

        cb && cb();
      });
    },
    infiniteHandler($state) {
      if (this.finished) {
        return false;
      }

      this.getNoticeList(() => {
        this.finished ? $state.complete() : $state.loaded();
      });
    },
    createNotice() {
      console.log('公告内容', this.noticeContent);
      this.pushLoading = true;
      createGroupNotice(CalcTargetId(this.contact.id), this.noticeContent).then((res) => {
        console.log('发布', res);
        if (res.status === 200) {
          this.$Message.success(res.data.msg);
          this.getNoticeList();
          this.noticeContent = '';
        } else {
          this.$Message.error(res.data.msg);
        }
        this.pushLoading = false;
      });
    },
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
    overflow-y: scroll;
    height: 527px;

    .new-notice {
      padding: 10px 0;
      .opr-btns {
        padding-top: 10px;
        text-align: right;
      }
    }
    .notice-list {
      padding-bottom: 40px;
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
            display: flex;
            align-items: center;
            .user-pic {
              margin-right: 10px;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              overflow: hidden;
            }
            .user-name {
              max-width: 252px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
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
