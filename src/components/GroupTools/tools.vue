<template>
  <div>
    <div class="right-fixed-bar">
      <i
        :class="['iconfont', 'icon-fujian', currentDrawer === 1 ? 'selected-icon' : '']"
        title="标记"
        @click="handleGroupMark"
      ></i>
      <i
        :class="['iconfont', 'icon-daibanrenwu_o', currentDrawer === 2 ? 'selected-icon' : '']"
        title="待办"
        @click="handleGroupPending"
      ></i>
      <i
        v-if="contact && contact.isGroup"
        :class="['iconfont', 'icon-gonggao1', currentDrawer === 3 ? 'selected-icon' : '']"
        title="群公告"
        @click="handleGroupNotice"
      ></i>
      <i
        v-if="contact && contact.isGroup"
        :class="['iconfont', 'icon-shezhi', currentDrawer === 4 ? 'selected-icon' : '']"
        title="群设置"
        @click="handleGroupSetting"
      ></i>
    </div>
  </div>
</template>

<script>
import { groupMembers } from '@/api/data';
import bus from '@/libs/bus';
import MarkDrawer from './mark';
import PendingDrawer from './pending';
import NoticeDrawer from './notice.vue';
import SettingDrawer from './setting.vue';
export default {
  name: 'groupTools',
  data() {
    return {
      groupMemberList: [],
      vContact: this.contact,
      currentDrawer: 0,
    };
  },
  props: {
    contact: {
      type: Object,
    },
    parentInstance: {
      type: Object,
    },
  },
  components: {
    'mark-drawer': MarkDrawer,
    'pending-drawer': PendingDrawer,
    'notice-drawer': NoticeDrawer,
    'setting-drawer': SettingDrawer,
  },
  watch: {
    contact: {
      deep: true,
      handler(newValue) {
        this.vContact = newValue;
        this.currentDrawer = 0;
        // if (this.vContact.isGroup) {
        //   this.getList();
        // }
      },
    },
    currentDrawer(num) {
      // num  0:close  1:mark 2:pending 3:notice 4:setting
      if ([1, 2, 3, 4].includes(num)) {
        bus.$emit('refreshDrawerData_' + num);
      }
    },
  },
  methods: {
    handleHistory(item) {
      this.$emit('openHistory', item);
    },
    handleGroupMark() {
      if (this.currentDrawer === 1) {
        return;
      }

      this.currentDrawer = 1;
      if (this.parentInstance) {
        this.parentInstance.closeDrawer();

        setTimeout(() => {
          this.parentInstance.changeDrawer({
            width: 500,
            height: '100%',
            offsetX: -500,
            offsetY: 0,
            position: 'right',
            inside: true,
            render: () => {
              return (
                <mark-drawer
                  contact={this.contact}
                  closeMethod={this.closePerPop}
                  openHistory={this.handleHistory}
                />
              );
            },
          });
        }, 300);
      }
    },
    handleGroupPending() {
      if (this.currentDrawer === 2) {
        return;
      }

      this.currentDrawer = 2;
      if (this.parentInstance) {
        this.parentInstance.closeDrawer();

        setTimeout(() => {
          this.parentInstance.changeDrawer({
            width: 500,
            height: '100%',
            offsetX: -500,
            offsetY: 0,
            position: 'right',
            inside: true,
            render: () => {
              return <pending-drawer contact={this.contact} closeMethod={this.closePerPop} />;
            },
          });
        }, 300);
      }
    },
    handleGroupNotice() {
      if (this.currentDrawer === 3) {
        return;
      }

      this.currentDrawer = 3;
      if (this.parentInstance) {
        this.parentInstance.closeDrawer();

        setTimeout(() => {
          this.parentInstance.changeDrawer({
            width: 500,
            height: '100%',
            offsetX: -500,
            offsetY: 0,
            position: 'right',
            inside: true,
            render: () => {
              return <notice-drawer contact={this.contact} closeMethod={this.closePerPop} />;
            },
          });
        }, 300);
      }
    },
    handleGroupSetting() {
      if (this.currentDrawer === 4) {
        return;
      }

      this.currentDrawer = 4;
      if (this.parentInstance) {
        this.parentInstance.closeDrawer();

        setTimeout(() => {
          this.parentInstance.changeDrawer({
            width: 400,
            height: '100%',
            offsetX: -400,
            offsetY: 0,
            position: 'right',
            inside: true,
            render: () => {
              return <setting-drawer contact={this.contact} closeMethod={this.closePerPop} />;
            },
          });
        }, 300);
      }
    },
    closePerPop() {
      this.currentDrawer = 0;
      this.parentInstance.closeDrawer();
    },
    // 暂时没用到
    getList() {
      groupMembers(this.vContact.id).then((res) => {
        if (res.status === 200) {
          this.groupMemberList = res.data.data;
        } else {
          this.$Message.error(res.data.msg);
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
// ::-webkit-scrollbar-track-piece {
//   background-color: #f8f8f8;
// }

// ::-webkit-scrollbar {
//   width: 9px;
//   height: 9px;
// }

// ::-webkit-scrollbar-thumb {
//   background-color: #dddddd;
//   background-clip: padding-box;
//   min-height: 28px;
// }

// ::-webkit-scrollbar-thumb:hover {
//   background-color: #bbb;
// }

.right-fixed-bar {
  .iconfont {
    padding: 12px 0;
    width: 100%;
    font-size: 22px;
    text-align: center;
    display: block;
    color: #999;
    cursor: pointer;
  }
  .icon-gonggao1 {
    font-size: 20px;
  }
  .selected-icon {
    background-color: #e7e5e5;
  }
}
</style>
