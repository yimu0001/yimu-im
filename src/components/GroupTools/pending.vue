<template>
  <div class="pend-box">
    <div class="common-drawer-title">
      <p class="title">待办列表</p>
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
          <el-select
            size="small"
            style="width:160px"
            v-model="filterForm.status"
            placeholder="选择状态"
            clearable
          >
            <el-option
              v-for="{ value, label } in statusOptions"
              :key="value"
              :label="label"
              :value="value"
            >
            </el-option>
          </el-select>
          <el-input
            size="small"
            style="width:200px"
            placeholder="请输入"
            prefix-icon="el-icon-search"
            v-model="filterForm.keyword"
            clearable
          >
          </el-input>
        </div>
        <div class="pend-list">
          <div class="pend-item" v-for="item in pendList" :key="item.taskId">
            <div class="pend-status">
              <!-- 1未处理 200完成 -->
              <div
                v-if="item.taskStatus === 1"
                class="unchecked-circle"
                title="完成"
                @click="handleComplete(item.taskId)"
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
              <div class="send-user">
                <p class="user">{{ item.taskWaiter }}</p>
                <p class="time">{{ item.createdAt }}</p>
              </div>
            </div>
          </div>
          <!-- <infinite-loading @infinite="infiniteHandler">
            <span slot="no-more" class="gray-text">到底啦</span>
            <span slot="no-results" class="gray-text">
              暂无评论
            </span>
          </infinite-loading> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';
import { fetchPendingList, completePending } from '@/api/event';
import {
  Button,
  Select,
  Option,
  Input,
  Message,
  Avatar,
  Checkbox,
  Tabs,
  TabPane,
  Radio,
  MessageBox,
} from 'element-ui';
export default {
  name: 'PendingDrawer',
  components: {
    elButton: Button,
    elInput: Input,
    elSelect: Select,
    elOption: Option,
    Message,
    elAvatar: Avatar,
    elCheckbox: Checkbox,
    elTabs: Tabs,
    elTabPane: TabPane,
    elRadio: Radio,
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
    activePendKey(key) {
      if (key) {
        this.filterForm = { status: null, keyword: '' };
        this.getPendList();
      }
    },
    filterForm: {
      handler() {
        this.getPendList();
      },
      deep: true,
    },
  },
  mounted() {
    this.getPendList();
  },
  methods: {
    closePop() {
      this.closeMethod();
    },
    getPendList(cb) {
      let type = this.activePendKey === 'my' ? 'my' : '';
      const { status, keyword } = this.filterForm;
      console.log('getPendList接口获取', this.contact, this.page, type, status, keyword);
      fetchPendingList(
        this.contact.isGroup,
        this.contact.id,
        this.page,
        type,
        status,
        keyword
      ).then((res) => {
        console.log('接口获取待办列表', res.data);
        if (res.status === 200) {
          const { list, num, pages } = res.data.data;
          // newsInfo taskInfo
          this.pendList = list.map(({ taskInfo }) => ({
            ...taskInfo,
            taskWaiter: taskInfo.taskWaiter.map(({ name }) => name).join(' '),
          }));
        } else {
          Message.error(res.data.msg);
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
    handleComplete(waitTaskId) {
      MessageBox.confirm('确定已完成当前待办事项吗？', '提示', { type: 'info' })
        .then((_) => {
          completePending(waitTaskId)
            .then((res) => {
              if (res.status === 200) {
                Message.success(res.data.msg);
                this.getPendList();
              } else {
                Message.error(res.data.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((_) => {});
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
    padding: 15px 20px;
    .filter-line {
      display: flex;
      justify-content: space-between;
    }
    .pend-list {
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
            cursor: pointer;
            margin-left: 5px;
            width: 18px;
            height: 18px;
            border: 1px solid #dcdfe6;
            border-radius: 100%;
            background-color: #fff;
            box-sizing: border-box;
          }
          /deep/ .el-radio__inner {
            width: 18px;
            height: 18px;
            &::after {
              width: 6px;
              height: 6px;
            }
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          .user {
            margin-right: 20px;
            font-size: 12px;
            color: #333;
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
