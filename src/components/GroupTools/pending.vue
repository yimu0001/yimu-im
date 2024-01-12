<template>
  <div class="pend-box">
    <div class="common-drawer-title">
      <p class="title normal-size-text">待办列表</p>
      <div class="close-btn" @click="closePop">
        <i class="iconfont icon-guanbi" title="关闭"></i>
      </div>
    </div>
    <div class="pend-main">
      <el-tabs v-model="activePendKey">
        <el-tab-pane label="我的" name="my"></el-tab-pane>
        <el-tab-pane label="所有" name="all"></el-tab-pane>
      </el-tabs>
      <div class="list-block">
        <div class="filter-line">
          <Select v-model="filterForm.status" style="width: 160px" placeholder="选择状态" clearable>
            <Option v-for="{ value, label } in statusOptions" :value="value" :key="value">{{
              label
            }}</Option>
          </Select>

          <Input
            v-model="filterForm.keyword"
            placeholder="请输入"
            style="width: 200px"
            search
            clearable
          />
        </div>
        <div class="pend-list">
          <div class="pend-item normal-size-text" v-for="item in pendList" :key="item.taskId">
            <div class="pend-status">
              <!-- 1未处理 200完成 -->
              <div
                v-if="item.taskStatus === 1"
                class="unchecked-circle"
                :style="item.waiterIds.includes(userId) ? 'cursor:pointer' : 'cursor:not-allowed'"
                title="完成"
                @click="handleComplete(item.taskId, item.waiterIds)"
              ></div>
              <div v-if="item.taskStatus === 200" class="checked-circle"></div>
            </div>
            <div class="main-item">
              <p
                class="msg-content"
                :style="item.taskStatus === 200 ? 'text-decoration: line-through;' : ''"
              >
                {{ item.taskContent }}
              </p>
              <div class="send-user little-grey-text">
                <p class="user">{{ item.taskWaiter }}</p>
                <p class="time">{{ item.createdAt }}</p>
              </div>
            </div>
          </div>
          <infinite-loading @infinite="infiniteHandler" :distance="200" :identifier="identifier">
            <span slot="no-more" class="gray-text">到底啦</span>
            <span slot="no-results" class="gray-text">
              {{ finished && pendList.length > 0 ? '到底啦' : '暂无数据' }}
            </span>
          </infinite-loading>
        </div>
      </div>
    </div>
    <Modal
      v-model="completePop"
      class="modal-his"
      title="提示"
      width="400"
      :z-index="2002"
      @on-ok="confirmComplete"
      transfer
    >
      <p class="tips">确定已完成当前待办事项吗？</p>
    </Modal>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';
import { fetchPendingList, completePending } from '@/api/event';
import bus from '@/libs/bus';
import { Button, Tabs, TabPane } from 'element-ui';

export default {
  name: 'PendingDrawer',
  components: {
    elButton: Button,
    elTabs: Tabs,
    elTabPane: TabPane,
    'infinite-loading': InfiniteLoading,
  },
  data() {
    return {
      activePendKey: 'my',
      filterForm: { status: null, keyword: '' },
      // 1未处理 200完成
      statusOptions: [
        { value: 1, label: '未处理' },
        { value: 200, label: '已完成' },
      ],
      pendList: [],
      page: 1,
      finished: false,
      completePop: false,
      userId: null, // String
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
      this.activePendKey = 'my';
      this.refreshParam();
    },
    activePendKey(key) {
      if (key) {
        // this.filterForm = { status: null, keyword: '' };
        this.refreshParam();
      }
    },
    filterForm: {
      handler() {
        this.refreshParam();
        this.$nextTick(this.getPendList);
      },
      deep: true,
    },
  },
  computed: {
    identifier() {
      return this.activePendKey + this.contact.id;
    },
  },
  mounted() {
    this.userId = sessionStorage.getItem('current_userId');

    bus.$on('refreshDrawerData_2', () => {
      this.refreshParam();
      this.$nextTick(this.getPendList);
    });
  },
  beforeDestroy() {
    bus.$off('refreshDrawerData_2');
  },
  methods: {
    closePop() {
      this.closeMethod();
    },
    refreshParam() {
      this.finished = false;
      this.page = 1;
      this.pendList = [];
    },
    getPendList(cb) {
      let pageNow = this.page;
      let type = this.activePendKey === 'my' ? 'my' : '';
      const { status, keyword } = this.filterForm;
      fetchPendingList(
        this.contact.isGroup,
        this.contact.id,
        this.page,
        type,
        status,
        keyword
      ).then((res) => {
        if (res.status === 200) {
          const { list, num, pages } = res.data.data;
          // newsInfo taskInfo
          let info =
            list.map(({ taskInfo }) => ({
              ...taskInfo,
              taskWaiter: taskInfo.taskWaiter.map(({ name }) => name).join(' '),
              waiterIds: taskInfo.taskWaiter.map(({ id }) => String(id)),
            })) || [];

          if (pageNow === 1) {
            this.pendList = info;
          } else {
            this.pendList = this.pendList.concat(info);
          }

          if (pageNow >= pages) {
            this.page = pages;
            this.finished = true;
          } else {
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

      this.getPendList(() => {
        this.finished ? $state.complete() : $state.loaded();
      });
    },
    handleComplete(waitTaskId, waiterIds) {
      // 判断waiterIds
      if (!waiterIds.includes(this.userId)) {
        return;
      }

      this.waitTaskId = waitTaskId;
      this.completePop = true;
    },
    confirmComplete() {
      completePending(this.waitTaskId)
        .then((res) => {
          if (res.status === 200) {
            this.$Message.success(res.data.msg);
            this.getPendList();
            this.completePop = false;
            this.waitTaskId = '';
          } else {
            this.$Message.warning(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

<style lang="less" scoped>
// 待办事项
.pend-box {
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
  .pend-main {
    padding: 15px 0 15px 20px;
    background: #f2f2f2;
    box-sizing: border-box;
    .filter-line {
      display: flex;
      justify-content: space-between;
    }
    .pend-list {
      margin: 10px 0;
      padding-bottom: 40px;
      overflow-y: scroll;
      height: 367px;
      .pend-item {
        margin: 10px 0;
        padding: 5px 15px;
        border: 1px solid #ececec;
        background: #fff;
        border-radius: 4px;
        font-size: 14px;
        line-height: 30px;

        display: flex;
        align-items: center;
        .pend-status {
          width: 10%;

          .checked-circle {
            margin-left: 5px;
            width: 18px;
            height: 18px;
            border-color: #409eff;
            border-radius: 100%;
            background: #409eff;
            position: relative;
            &::after {
              content: '';
              position: absolute;
              left: 50%;
              top: 50%;
              transition: transform 0.15s ease-in;
              transform: translate(-50%, -50%) scale(1);
              width: 6px;
              height: 6px;
              border-radius: 100%;
              background-color: #fff;
            }
          }
          .unchecked-circle {
            margin-left: 5px;
            width: 18px;
            height: 18px;
            border: 1px solid #dcdfe6;
            border-radius: 100%;
            background-color: #fff;
            box-sizing: border-box;
          }
        }
        .main-item {
          width: 90%;
        }
        .msg-content {
          padding: 4px 0;
          line-height: 20px;
          color: #333;
        }
        .send-user {
          font-size: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .user {
            margin-right: 20px;
            color: #333;
          }
          .time {
            color: #999;
          }
        }
      }
    }
  }
}
</style>
