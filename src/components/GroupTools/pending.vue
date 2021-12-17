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
          <div class="pend-item" v-for="item in pendList" :key="item.id">
            <div class="pend-status">
              <div v-if="item.status === 1" class="checked-circle"></div>
              <div v-else class="unchecked-circle"></div>
            </div>
            <div class="main-item">
              <p
                class="msg-content"
                :style="item.status === 1 ? 'text-decoration: line-through;' : ''"
              >
                {{ item.content }}
              </p>
              <div class="send-user">
                <p class="user">{{ item.sendUser }}</p>
                <p class="time">{{ item.sendTime }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
  },
  data() {
    return {
      activePendKey: 'my',
      filterForm: { status: null, keyword: '' },
      statusOptions: [
        { value: 0, label: '未完成' },
        { value: 1, label: '已完成' },
      ],
      pendList: [
        {
          id: 1,
          content:
            '这是一条消息，消息内容如下。这是一条消息，消息内容如下。这是一条消息，消息内容如下。这是一条消息，消息内容如下',
          sendUser: '张三',
          sendTime: '2021-11-25 15:25',
          pendUser: '刘金栋',
          status: 0,
        },
        {
          id: 2,
          content:
            '这是一条消息，消息内容如下。这是一条消息，消息内容如下。这是一条消息，消息内容如下。这是一条消息，消息内容如下',
          sendUser: '李四',
          sendTime: '2021-11-15 09:54',
          pendUser: '刘金栋',
          status: 1,
        },
      ],
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
  mounted() {},
  methods: {
    closePop() {
      console.log('关闭抽屉');
      this.closeMethod();
    },
    getPendList() {
      console.log('接口获取待办列表');
      // groupMembers(this.vContact.id).then((res) => {
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
