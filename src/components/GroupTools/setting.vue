<template>
  <div class="set-box" @click="handleCloseEdit">
    <div class="common-drawer-title">
      <p class="title">群设置</p>
      <div class="close-btn" @click="closePop"><i class="el-icon-close"></i></div>
    </div>

    <!-- 如果是个人用户 -->
    <el-row v-if="vContact && !vContact.isGroup">
      <el-col :span="24">
        <div style="text-align: center">
          <el-avatar :src="vContact.avatar"></el-avatar>
        </div>
      </el-col>
      <el-col :span="24">
        <ul class="list-group list-group-striped">
          <li class="list-group-item">
            <i class="el-icon-user-solid"></i>
            用户账号
            <div class="pull-right">{{ vContact.id }}</div>
          </li>
          <li class="list-group-item">
            <i class="el-icon-info"></i>
            用户名称
            <div class="pull-right">{{ vContact.displayName }}</div>
          </li>
        </ul>
      </el-col>
    </el-row>
    <!-- 如果是群组 -->
    <div v-if="vContact && vContact.isGroup">
      <!-- 群成员展示 -->
      <el-row class="memberList" :gutter="4">
        <el-col :span="3" class="memberItem">
          <div class="memberItemImg addMemberImg" @click="handleAddMemberToGroup">
            <img src="../../assets/add.png" />
          </div>
          <div class="memberItemName" @click="handleAddMemberToGroup">
            <span>添加</span>
          </div>
        </el-col>
        <el-col :span="3" class="memberItem" v-for="(item, index) of groupMemberList" :key="index">
          <div class="memberItemImg">
            <img :src="item.avatar" />
          </div>
          <div class="memberItemName">
            <span :title="item.nickname">{{ item.nickname }}</span>
          </div>
        </el-col>
      </el-row>
      <!-- 群聊信息展示 -->
      <el-row>
        <el-col :span="24">
          <ul class="list-group list-group-striped">
            <li class="list-group-item">
              <p class="item-label">群账号</p>
              <p class="item-value">{{ vContact.id }}</p>
            </li>
            <li class="list-group-item">
              <p class="item-label">群名称</p>
              <!-- <div v-if="editNameShow" class="set-input">{{ vContact.displayName }}</div> -->
              <el-input
                v-if="editNameShow"
                class="set-input"
                id="name_editor"
                size="small"
                v-model="initDisplayName"
                @keyup.enter.native="handleSaveName"
              />
              <p
                v-else
                class="item-value enable-edit"
                id="name_editor"
                title="点击修改"
                @click="handleEditName"
              >
                {{ vContact.displayName }}
              </p>
            </li>
          </ul>
        </el-col>
      </el-row>
    </div>

    <el-dialog title="修改群" :visible.sync="addGroupOpen" :modal="false" width="500px">
      <EditGroup @grouprMethod="gbAddGroupOpen" :group="vContact" />
    </el-dialog>

    <!-- 移除群聊 -->
    <el-dialog :visible.sync="deleteUserOpen" :modal="false" width="400px">
      <el-row>
        <el-col :span="24">
          <div style="text-align: center">
            <el-avatar :size="70" :src="deleteUser.avatar"></el-avatar>
          </div>
        </el-col>
        <el-col :span="24">
          <ul class="list-group list-group-striped">
            <li class="list-group-item">
              <i class="el-icon-user-solid"></i>
              用户账号
              <div class="pull-right">{{ deleteUser.id }}</div>
            </li>
            <li class="list-group-item">
              <i class="el-icon-info"></i>
              用户名称
              <div class="pull-right">{{ deleteUser.name }}</div>
            </li>
          </ul>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 邀请用户 -->
    <el-dialog :visible.sync="addUserOpen" :modal="false" width="800px" class="addUserDialog">
      <el-row class="addUserDom">
        <el-col :span="8" class="orgListDom">
          <div
            v-for="(orgItem, orgIndex) of orgList"
            :key="`orgItem-${orgIndex}`"
            class="orgItem"
            @click="chooseOrg(orgItem.id)"
          >
            {{ orgItem.name }}
          </div>
        </el-col>
        <el-col :span="8" class="userListDom">
          <div v-for="item of selectOrgUsers" :key="`currentOrgUser${item.id}`" class="userItem">
            <el-checkbox
              :label="item.id"
              border
              @change="handleChangeUser($event, item)"
              v-model="item.checked"
            >
              {{ item.name }}-{{ item.dpt_name }}</el-checkbox
            >
          </div>
        </el-col>
        <el-col :span="8" class="userListDom">
          <div></div>
          <div
            v-for="(item, index) of selecedUser"
            :key="`currentOrgUser${item.id}`"
            class="userItem"
          >
            <!-- <el-checkbox :label="item.id" border @change='handleChangeUser($event, item)'> {{item.name}}-{{item.dpt_name}}</el-checkbox> -->
            <el-tag closable @close="handleDelSelectUser(item.id, index)">
              {{ item.name }}-{{ item.dpt_name }}
            </el-tag>
          </div>
        </el-col>
      </el-row>
      <div class="controlDom">
        <el-button type="primary" @click="addMemberToGroup">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { groupMembers, getUserByOrgid, getOrgList, addMemberToGroup } from '../../api/data';
import MarkDrawer from './mark';
import PendingDrawer from './pending';
import NoticeDrawer from './notice.vue';
import SettingDrawer from './setting.vue';
import EditGroup from '../EditGroup';
import {
  Dialog,
  Table,
  TableColumn,
  Row,
  Col,
  Button,
  Input,
  Message,
  Avatar,
  Checkbox,
  Tag,
  Tabs,
  TabPane,
} from 'element-ui';
export default {
  name: 'CustomDrawer',
  data() {
    return {
      searchValue: '',
      all: false,
      list: [],
      addGroupOpen: false,
      deleteUserOpen: false,
      deleteUser: {},
      addUserOpen: false,
      searchAddUser: '',
      addUserList: [],
      ids: '',
      groupMemberList: [],
      //机构列表
      orgList: [],
      selectOrgId: '',
      selectOrgUsers: [],
      selecedUser: [],
      my_baseUrl: this.baseUrl,
      vContact: this.contact,
      editNameShow: false,
      initDisplayName: '',
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
  components: {
    EditGroup,
    elDialog: Dialog,
    elTable: Table,
    elTableColumn: TableColumn,
    elRow: Row,
    elCol: Col,
    elButton: Button,
    elInput: Input,
    Message,
    elAvatar: Avatar,
    elCheckbox: Checkbox,
    elTag: Tag,
    elTabs: Tabs,
    elTabPane: TabPane,
    'mark-drawer': MarkDrawer,
    'pending-drawer': PendingDrawer,
    'notice-drawer': NoticeDrawer,
    'setting-drawer': SettingDrawer,
  },
  watch: {
    baseUrl(newValue, oldValue) {
      this.my_baseUrl = newValue;
    },
    contact: {
      deep: true,
      immediate: true,
      handler: function(newValue, oldValue) {
        console.log('watch setting====contact', newValue, this.contact);
        this.searchValue = '';
        this.vContact = newValue;
        if (this.vContact.isGroup) {
          this.all = false;
          this.getList();
        }
      },
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
  mounted() {
    console.log('mounted setting====contact', this.contact, this.baseUrl);
    this.vContact = this.contact || {};

    // if (this.vContact.isGroup) {
    //   this.all = false
    //   this.getList()
    // }
  },
  methods: {
    closePop() {
      console.log('关闭抽屉');
      if (this.editNameShow) {
        this.editNameShow = false;
      }

      this.closeMethod();
    },
    handleEditName() {
      this.editNameShow = true;
      this.initDisplayName = this.vContact.displayName;
    },
    handleCloseEdit(e) {
      let isEditDom = e.target.id && e.target.id === 'name_editor';
      if (!isEditDom && this.editNameShow) {
        this.editNameShow = false;
      }
    },
    handleSaveName() {
      console.log('保存', this.vContact.displayName);
      this.vContact.displayName = this.initDisplayName;
      Message.success('修改成功');
      this.editNameShow = false;
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },
    searchAddUserList() {
      let data = {
        groupId: this.vContact.id,
        searchValue: this.searchAddUser,
      };
    },

    getList() {
      groupMembers(this.my_baseUrl, this.vContact.id).then((res) => {
        if (res.status === 200) {
          this.groupMemberList = res.data.data;
        } else {
          Message.error(res.data.msg);
        }
      });
    },
    getAll(b) {
      if (b) {
        this.all = true;
      } else {
        this.all = false;
      }
      this.searchValue = '';
      this.getList();
    },
    edit() {
      this.addGroupOpen = true;
    },
    gbAddGroupOpen() {
      this.addGroupOpen = false;
    },
    deleteUserShow(user) {
      this.deleteUser = user;
      this.deleteUserOpen = true;
    },

    //加人
    handleAddMemberToGroup() {
      this.getAllOrgList();
      this.addUserOpen = true;
    },
    //获取机构列表
    getAllOrgList() {
      getOrgList(this.my_baseUrl)
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            this.orgList = res.data.data;
          } else {
            Message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    chooseOrg(id) {
      this.selectOrgId = id;
      this.getUserByOrgid();
    },

    //获取机构下人员
    getUserByOrgid() {
      getUserByOrgid(this.my_baseUrl, this.selectOrgId)
        .then((res) => {
          if (res.status === 200) {
            let selectUserIds = this.selecedUser.map((item) => {
              return item.id;
            });
            this.selectOrgUsers = res.data.data.map((item) => {
              item.checked = false;
              if (selectUserIds.includes(item.id)) {
                item.checked = true;
              }
              return item;
            });
          } else {
            Message.error(res.data.msg);
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
      this.selectOrgUsers.forEach((item) => {
        if (item.id == id) {
          item.checked = false;
        }
      });
    },

    addMemberToGroup() {
      let selectUserIds = this.selecedUser.map((item) => {
        return Number(item.id);
      });
      addMemberToGroup(this.my_baseUrl, this.vContact.id, selectUserIds)
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            Message.success(res.data.msg);
            this.addUserOpen = false;
          } else {
            Message.error(res.data.msg);
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
div,
p {
  box-sizing: border-box;
}
::-webkit-scrollbar-track-piece {
  background-color: #f8f8f8;
}

::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}

::-webkit-scrollbar-thumb {
  background-color: #dddddd;
  background-clip: padding-box;
  min-height: 28px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #bbb;
}
.set-box {
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
}

.list-group {
  margin: 10px 30px;
  padding: 0;
  font-size: 14px;
  line-height: 28px;
  .list-group-item {
    display: flex;
    .item-label {
      width: 55px;
      color: #606266;
    }
    .item-value {
      padding-left: 15px;
      width: 220px;
      color: #999;
    }
    .enable-edit {
      cursor: pointer;
    }
    .set-input {
      width: 220px;
    }
  }
}

/* // 群组成员列表 */
.memberList {
  padding: 20px 10px;
  border-bottom: 1px solid #eee;
  .memberItem {
    text-align: center;
    .memberItemImg {
      overflow: hidden;
      width: 36px;
      height: 36px;
      margin: 0 auto;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .addMemberImg {
      cursor: pointer;
      overflow: hidden;
      width: 36px;
      height: 36px;
      border: 1px solid #999;
      padding-top: 4px;
      box-sizing: border-box;
      img {
        width: 26px;
        height: 26px;
      }
    }
    .memberItemName {
      font-size: 12px;
      margin-top: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

//群组添加用户
.controlDom {
  text-align: center;
  padding: 30px 0 20px;
}
.addUserDom {
  padding-top: 40px;
  height: 450px;
  .orgListDom {
    height: 450px;
    overflow-y: auto;
    .orgItem {
      width: 80%;
      margin: 10px auto;
      border: 1px solid #eee;
      padding: 8px 10px;
    }
  }
  .userListDom {
    height: 450px;
    overflow-y: auto;
    .userItem {
      // background-color: #eee;
      margin-top: 10px;
      height: 38px;
      line-height: 38px;
      border-radius: 5px;
      cursor: pointer;
    }
  }
}
</style>
