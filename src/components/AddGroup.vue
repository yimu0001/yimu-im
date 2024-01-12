<template>
  <div>
    <div class="group-info">
      <Input v-model="groupName" placeholder="请输入群组标题" style="width: 400px" clearable />
      <el-button
        class="con-btn"
        type="primary"
        size="small"
        :loading="createLoading"
        @click="confirmCreate"
        >确认创建</el-button
      >
    </div>
    <Row :gutter="30" class="peopleSelectDom">
      <Col :span="8" :offset="1" class="orgList">
        <div
          v-for="item of orgList"
          :key="`orgItem${item.id}`"
          class="orgItem"
          :class="activeOrgId == item.id ? 'activeOrg' : ''"
          @click="chooseOrg(item.id)"
        >
          {{ item.name }}
        </div>
      </Col>
      <Col :span="8" class="orgList">
        <div v-for="item of currentOrgUsers" :key="`currentOrgUser${item.id}`" class="userItem">
          <el-checkbox
            :label="item.id"
            border
            @change="handleChangeUser($event, item)"
            v-model="item.checked"
          >
            {{ item.name }}-{{ item.dpt_name }}</el-checkbox
          >
        </div>
      </Col>
      <Col :span="6" class="orgList">
        <div>
          已选人员：
        </div>
        <div
          v-for="(item, index) of selecedUser"
          :key="`currentOrgUser${item.id}`"
          class="userItem tagItem"
        >
          <!-- <el-checkbox :label="item.id" border @change='handleChangeUser($event, item)'> {{item.name}}-{{item.dpt_name}}</el-checkbox> -->
          <Tag color="blue" closable @on-close="handleDelSelectUser(item.id, index)"
            >{{ item.name }}-{{ item.dpt_name }}</Tag
          >
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
import { Button, CheckboxGroup, Checkbox } from 'element-ui';
import { getOrgList, getUserByOrgid, createGroup } from '../api/data';
import Bus from '../libs/bus';
export default {
  name: 'addGroup',
  components: {
    elButton: Button,
    elCheckboxGroup: CheckboxGroup,
    elCheckbox: Checkbox,
  },
  data() {
    return {
      groupName: '',
      orgList: [],
      activeOrgId: '', //选中的机构
      currentOrgUsers: [],
      checkUser: [],
      selecedUser: [],
      createLoading: false,
    };
  },
  mounted() {
    this.getOrgList();
  },
  methods: {
    getOrgList() {
      getOrgList()
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            this.orgList = res.data.data;
          } else {
            this.$Message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    chooseOrg(id) {
      this.activeOrgId = id;
      this.getUserByOrgid();
    },

    //获取机构下人员
    getUserByOrgid() {
      getUserByOrgid(this.activeOrgId)
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            let selectUserIds = this.selecedUser.map((item) => {
              return item.id;
            });
            this.currentOrgUsers = res.data.data.map((item) => {
              item.checked = false;
              if (selectUserIds.includes(item.id)) {
                item.checked = true;
              }
              return item;
            });
          } else {
            this.$Message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    handleChangeUser(e, item) {
      if (e) {
        this.selecedUser.push(item);
      } else {
        this.selecedUser = this.selecedUser.filter((user) => {
          return user.id != item.id;
        });
      }
    },

    //删除所选人员
    handleDelSelectUser(id, index) {
      this.selecedUser.splice(index, 1);
      this.currentOrgUsers.forEach((item) => {
        if (item.id == id) {
          item.checked = false;
        }
      });
    },
    confirmCreate() {
      this.createLoading = true;
      let userIds = this.selecedUser.map((user) => {
        return Number(user.id);
      });
      createGroup(this.groupName, userIds)
        .then((res) => {
          if (res.status === 200) {
            this.$Message.success('创建成功！');
            Bus.$emit('createGroupOk', res.data.data.id);
          } else {
            this.$Message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.createLoading = false;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.group-info {
  // text-align: center;
  margin-bottom: 22px;
  .con-btn {
    margin-left: 20px;
  }
}
.peopleSelectDom {
  .orgList {
    // background: #d3dce6;
    border-radius: 4px;
    height: 406px;
    overflow-y: scroll;
    .orgItem {
      background-color: #eee;
      margin-top: 10px;
      height: 38px;
      line-height: 38px;
      text-align: center;
      border-radius: 5px;
      cursor: pointer;
    }
    .activeOrg {
      background-color: #409eff;
      color: #fff;
    }
    .userItem {
      // background-color: #eee;
      margin-top: 10px;
      height: 38px;
      line-height: 38px;
      border-radius: 5px;
      cursor: pointer;
    }
    .tagItem {
      margin-top: 2px;

      ::v-deep .ivu-tag {
        height: 28px;
        line-height: 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .ivu-tag-text {
          height: 28px;
          line-height: 28px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      ::v-deep .ivu-icon-ios-close:before {
        color: #1890ff;
      }
    }
  }
}
</style>
