<template>
  <div class="set-box">
    <div class="common-drawer-title">
      <p class="title">群设置</p>
      <div class="close-btn" @click="closePop">
        <i class="iconfont icon-guanbi" title="关闭"></i>
      </div>
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
        <el-col :span="4" class="memberItem">
          <div class="memberItemImg addMemberImg" @click="handleAddMember">
            <!-- <img src="../../assets/add.png" /> -->
            <i class="iconfont icon-zengjia" title="添加"></i>
          </div>
          <div class="memberItemName" @click="handleAddMember">
            <span>添加</span>
          </div>
        </el-col>
        <el-col :span="4" class="memberItem" v-if="isOwner">
          <div class="memberItemImg addMemberImg" @click="handleRemoveMember">
            <!-- <img src="../../assets/add.png" /> -->
            <i class="iconfont icon-jianshao" title="删除"></i>
          </div>
          <div class="memberItemName" @click="handleRemoveMember">
            <span>删除</span>
          </div>
        </el-col>
        <el-col :span="4" class="memberItem" v-for="(item, index) of groupMemberList" :key="index">
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
              <!-- 编辑态 -->
              <el-input
                v-if="editNameShow && isOwner"
                class="set-input"
                size="small"
                v-model="initDisplayName"
              />
              <el-button
                v-if="editNameShow && isOwner"
                class="edit-btn"
                type="primary"
                size="mini"
                @click="handleSaveName"
                >保存</el-button
              >
              <el-button
                v-if="editNameShow && isOwner"
                class="edit-btn"
                size="mini"
                @click="cancelSaveName"
                >取消</el-button
              >
              <!-- 非编辑态 -->
              <p v-if="!editNameShow" class="item-value">
                {{ vContact.displayName }}
              </p>
              <!-- <el-button
                v-if="!editNameShow && isOwner"
                class="edit-btn"
                type="primary"
                plain
                size="mini"
                @click="handleEditName"
                >修改</el-button
              > -->
            </li>
            <!-- <li class="list-group-item">
              <p class="item-label">群聊置顶</p>
              <el-switch class="switch-btn" v-model="isTop" active-color="#13ce66"> </el-switch>
            </li>
            <li class="list-group-item">
              <p class="item-label">消息免打扰</p>
              <el-switch class="switch-btn" v-model="isNoPrompt" active-color="#13ce66">
              </el-switch>
            </li> -->
          </ul>
        </el-col>
      </el-row>

      <div class="quit-btn">
        <el-button type="danger" size="mini" @click="handleQuitGroup">退出群聊</el-button>
      </div>
    </div>

    <el-dialog title="修改群" :visible.sync="addGroupOpen" :modal="false" width="500px">
      <EditGroup @grouprMethod="gbAddGroupOpen" :group="vContact" />
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
          <div v-for="item of originalMember" :key="item.id" class="userItem">
            <el-tag :closable="false"> {{ item.name }}-{{ item.dpt_name }} </el-tag>
          </div>
          <div
            v-for="(item, index) of selecedUser"
            :key="`currentOrgUser${item.id}`"
            class="userItem"
          >
            <!-- <el-checkbox :label="item.id" border @change='handleChangeUser($event, item)'> {{item.name}}-{{item.dpt_name}}</el-checkbox> -->
            <el-tag
              :closable="item.noclose ? false : true"
              @close="handleDelSelectUser(item.id, index)"
            >
              {{ item.name }}-{{ item.dpt_name }}
            </el-tag>
          </div>
        </el-col>
      </el-row>
      <div class="controlDom">
        <el-button type="primary" size="small" @click="confirmAddMember">确认添加</el-button>
      </div>
    </el-dialog>

    <!-- 移除用户 -->
    <el-dialog :visible.sync="removeUserOpen" :modal="false" width="600px" class="removeUserDialog">
      <el-row class="removeUserDom">
        <el-col :span="12" class="one-col">
          <el-checkbox-group v-model="checkedRemoveUser" size="small">
            <el-checkbox :label="ownerInfo" class="checkItem" disabled>
              <img class="user-avatar" :src="ownerInfo.avatar" alt="" />
              <span>{{ ownerInfo.name }}-{{ ownerInfo.dpt_name }}</span>
            </el-checkbox>

            <el-checkbox
              v-show="item.id !== userId"
              v-for="item of canRemoveMember"
              :key="`currentOrgUser${item.id}`"
              :label="item"
              class="checkItem"
            >
              <img class="user-avatar" :src="item.avatar" alt="" />
              <span>{{ item.name }}-{{ item.dpt_name }}</span>
            </el-checkbox>
          </el-checkbox-group>
        </el-col>

        <el-col :span="12" class="one-col">
          <p class="member-tips" v-if="checkedRemoveUser && checkedRemoveUser.length > 0">
            已选择{{ checkedRemoveUser.length }}个群成员
          </p>

          <div
            v-for="(item, index) of checkedRemoveUser"
            :key="`currentOrgUser${item.id}`"
            class="userItem"
          >
            <el-tag @close="handleChangeCheckUser(index)" closable>
              {{ item.name }}-{{ item.dpt_name }}
            </el-tag>
          </div>
        </el-col>
      </el-row>
      <div class="controlDom">
        <el-button
          type="primary"
          :disabled="!checkedRemoveUser || checkedRemoveUser.length === 0"
          size="small"
          @click="confirmRemoveMember"
          >确认删除</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { groupMembers, getUserByOrgid, getOrgList, addMemberToGroup } from '@/api/data';
import { checkGroupOwner, userQuitGroup, kickGroupMember } from '@/api/chat';
import { CalcTargetId } from '@/libs/tools';
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
  CheckboxGroup,
  Checkbox,
  Tag,
  Tabs,
  TabPane,
  Switch,
  MessageBox,
} from 'element-ui';
import bus from '@/libs/bus';

export default {
  name: 'CustomDrawer',
  data() {
    return {
      searchValue: '',
      all: false,
      list: [],
      addGroupOpen: false,
      addUserOpen: false,
      removeUserOpen: false,
      checkedRemoveUser: [], // 勾选的要移除的用户列表
      searchAddUser: '',
      addUserList: [],
      ids: '',
      isOwner: false, // 群主
      groupMemberList: [],
      //机构列表
      orgList: [],
      selectOrgId: '',
      selectOrgUsers: [],
      selecedUser: [],
      originalMember: [], // 邀请群成员时 回显群内成员
      canRemoveMember: [], // 移除群成员时 所有备选项
      ownerInfo: {}, // 群主信息
      vContact: this.contact,
      editNameShow: false,
      initDisplayName: '',
      isTop: false,
      isNoPrompt: false,
      userId: '',
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
    elCheckboxGroup: CheckboxGroup,
    elCheckbox: Checkbox,
    elTag: Tag,
    elTabs: Tabs,
    elTabPane: TabPane,
    elSwitch: Switch,
    'mark-drawer': MarkDrawer,
    'pending-drawer': PendingDrawer,
    'notice-drawer': NoticeDrawer,
    'setting-drawer': SettingDrawer,
  },
  watch: {
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
          this.checkOwner();
        }
      },
    },
    checkedRemoveUser(list, old) {
      console.log('watch checkedRemoveUser', list, old);
    },
  },
  mounted() {
    this.vContact = this.contact || {};
    this.userId = sessionStorage.getItem('current_userId');

    bus.$on('refreshDrawerData_4', () => {
      console.log('refreshDrawerData_4');
      this.getList();
    });
  },
  beforeDestroy() {
    bus.$off('refreshDrawerData_4');
  },
  methods: {
    closePop() {
      if (this.editNameShow) {
        this.editNameShow = false;
      }

      this.closeMethod();
    },

    // 有关群聊设置
    handleEditName() {
      if (!this.isOwner) return;

      this.editNameShow = true;
      this.initDisplayName = this.vContact.displayName;
    },
    handleSaveName() {
      console.log('保存', this.vContact.displayName);
      this.vContact.displayName = this.initDisplayName;
      Message.success('修改成功');
      this.editNameShow = false;
    },
    cancelSaveName() {
      console.log('取消保存', this.vContact.displayName);
      this.editNameShow = false;
    },
    handleQuitGroup() {
      MessageBox.confirm('确定要退出当前群聊吗？', '提示', { type: 'warning' })
        .then((_) => {
          // 从当前群聊中去除该用户 并且关闭当前聊天
          userQuitGroup(CalcTargetId(this.vContact.id))
            .then((res) => {
              if (res.status === 200) {
                Message.success(res.data.msg || '退群成功');
                // 关闭并删除当前会话
                bus.$emit('afterQuitGroup', 3, CalcTargetId(this.vContact.id));
              } else {
                Message.error(res.data.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });

          done();
        })
        .catch((_) => {});
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
    checkOwner() {
      checkGroupOwner(CalcTargetId(this.vContact.id)).then((res) => {
        if (res.status === 200) {
          this.isOwner = res.data.data.id === this.userId;
          console.log('own', this.isOwner);
        } else {
          Message.error(res.data.msg);
        }
      });
    },
    getList() {
      groupMembers(CalcTargetId(this.vContact.id)).then((res) => {
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
    //获取机构列表
    getAllOrgList() {
      getOrgList()
        .then((res) => {
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
      getUserByOrgid(this.selectOrgId)
        .then((res) => {
          if (res.status === 200) {
            let selectUserIds = this.selecedUser.map(({ id }) => id);
            let groupUserIds = this.originalMember.map(({ id }) => id);
            console.log('已选id', selectUserIds); // 已选的人 禁用
            console.log('返回值', res.data.data);

            this.selectOrgUsers = res.data.data.map((item) => {
              item.checked = false;
              if (selectUserIds.includes(item.id)) {
                item.checked = true;
              }
              if (groupUserIds.includes(item.id)) {
                item.disabled = true;
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

    //加人
    handleAddMember() {
      this.getAllOrgList();
      this.addUserOpen = true;
      this.originalMember = this.groupMemberList.map(({ avatar, dptname, id, nickname }) => ({
        avatar,
        checked: true,
        dpt_name: dptname,
        id,
        name: nickname,
        org_name: '',
      }));
      console.log('回显', this.originalMember);
    },
    handleRemoveMember() {
      this.removeUserOpen = true;
      this.canRemoveMember = this.groupMemberList.map(({ avatar, dptname, id, nickname }) => ({
        avatar,
        dpt_name: dptname,
        id,
        name: nickname,
        org_name: '',
      }));
      this.ownerInfo = this.canRemoveMember.filter(({ id }) => id === this.userId)[0] || {};
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
    //删除所选人员
    handleChangeCheckUser(index) {
      this.checkedRemoveUser.splice(index, 1);
    },

    confirmAddMember() {
      let selectUserIds = this.selecedUser.map(({ id }) => Number(id));
      addMemberToGroup(CalcTargetId(this.vContact.id), selectUserIds)
        .then((res) => {
          if (res.status === 200) {
            Message.success(res.data.data || '邀请成功');
            this.addUserOpen = false;
            this.originalMember = [];
            this.getList();
          } else {
            Message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    confirmRemoveMember() {
      let memberIds = this.checkedRemoveUser.map(({ id }) => Number(id));
      let memberNames = this.checkedRemoveUser.map(({ name }) => name).join('，');
      console.log('移除人员', this.checkedRemoveUser, memberIds, memberNames);
      MessageBox.confirm(`确定要将${memberNames}移除群聊吗？`, '提示', { type: 'warning' })
        .then((_) => {
          // 群主踢人
          kickGroupMember(CalcTargetId(this.vContact.id), memberIds)
            .then((res) => {
              if (res.status === 200) {
                Message.success(res.data.data || '移除成功');
                this.removeUserOpen = false;
                this.canRemoveMember = [];
                this.getList();
              } else {
                Message.error(res.data.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });

          done();
        })
        .catch((_) => {});
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
  line-height: 32px;
  .list-group-item {
    display: flex;
    align-items: center;
    .item-label {
      width: 80px;
      color: #606266;
    }
    .item-value {
      padding-left: 15px;
      width: 220px;
      color: #999;
    }
    // .enable-edit {
    //   cursor: pointer;
    // }
    .set-input {
      width: 220px;
    }
    .switch-btn {
      width: 60px;
      margin: 7px 0 0 15px;
    }
  }
}

/* // 群组成员列表 */
.memberList {
  padding: 20px 10px;
  border-bottom: 1px solid #eee;
  .memberItem {
    text-align: center;
    padding: 6px 0;
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
      padding-top: 5px;
      box-sizing: border-box;
      // img {
      //   width: 26px;
      //   height: 26px;
      // }
      .iconfont {
        font-size: 24px;
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

.addUserDialog {
  /deep/ .el-dialog__body {
    padding-top: 50px !important;
  }
  .addUserDom {
    height: 450px;
    .orgListDom {
      padding: 0 20px;
      height: 450px;
      overflow-y: auto;
      overflow-x: hidden;
      border-right: 1px solid #ececec;
      .orgItem {
        cursor: pointer;
        // width: 80%;
        margin: 10px auto;
        border: 1px solid #eee;
        padding: 8px 10px;
      }
    }
    .userListDom {
      padding: 0 20px;
      height: 450px;
      overflow-y: auto;
      overflow-x: hidden;
      border-right: 1px solid #ececec;
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
  .controlDom {
    text-align: center;
    padding: 30px 0 20px;
  }
}
.removeUserDialog {
  /deep/ .el-dialog__body {
    padding-top: 50px !important;
  }
  .removeUserDom {
    height: 450px;

    .one-col {
      width: 280px;
      margin-left: 10px;
      padding: 0 20px;
      height: 450px;
      overflow-y: auto;
      overflow-x: hidden;
      &:first-child {
        border-right: 1px solid #ececec;
      }
      .checkItem {
        margin-top: 15px;
        .user-avatar {
          width: 30px;
          height: 30px;
          margin-right: 10px;
        }
      }
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
  .controlDom {
    text-align: center;
    padding: 30px 0 20px;
  }
}

.edit-btn {
  height: 30px;
  margin-left: 10px;
}
.quit-btn {
  margin-top: 30px;
  text-align: center;
}
</style>
