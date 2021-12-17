<template>
  <div style="height: 100%;overflow:auto;">
    <div class="right-fixed-bar">
      <i class="iconfont icon-thin-_pin_bookma" title="标记" @click="handleGroupMark"></i>
      <i class="iconfont icon-daibanshixiang" title="创建待办" @click="handleGroupPending"></i>
      <i class="iconfont icon-gonggao1" title="公告" @click="handleGroupNotice"></i>
      <i class="iconfont icon-shezhi" title="群设置" @click="handleGroupSetting"></i>
    </div>
    <!-- <el-row v-if="vContact && !vContact.isGroup">
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
      </el-row> -->

    <div v-if="vContact && vContact.isGroup">
      <!-- <div class="slot-contact-fixedtop">
          <input class="slot-search" v-on:keyup.13="searchUserList" v-model="searchValue" placeholder="搜索群用户"/>
          <el-button icon="el-icon-circle-plus-outline" @click="showAddFriends" type="text" circle></el-button>
        </div>
        <el-row :gutter="2">
          <el-col v-for="(user,i) in list" :span="6" :key="i">
            <div @click="deleteUserShow(user)">
              <el-avatar shape="square" :size="70" :src="user.avatar"></el-avatar>
              <p v-if="user.id != contact.root"
                 style="color: #9195A3;size: A3;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
                {{ user.id }}</p>
              <p v-if="user.id == contact.root"
                 style="color: red;size: A3;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">{{
                  user.id
                }}</p>
            </div>
          </el-col>
        </el-row>
        <br/>
        <div v-if="list.length == 12" style="text-align: center">
          <el-button @click="getAll(true)" type="text">加载全部...</el-button>
        </div>
        <div v-if="list.length > 12" style="text-align: center">
          <el-button @click="getAll(false)" type="text">加载部分...</el-button>
        </div>
        <el-row>
          <el-col :span="24">
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <i class="el-icon-user-solid"></i>
                群账号
                <div class="pull-right">{{ this.contact.id }}</div>
              </li>
              <li class="list-group-item">
                <i class="el-icon-info"></i>
                群名称
                <div class="pull-right">{{ this.contact.displayName }}</div>
              </li>
            </ul>
          </el-col>
        </el-row> -->
      <!-- <el-row class="memberList" :gutter='4'>
          <el-col :span='6' class="memberItem">
            <div class="memberItemImg addMemberImg" @click="handleAddMemberToGroup">
              <img src="../assets/add.png" >
            </div>
            <div class="memberItemName" @click="handleAddMemberToGroup">
              <span>添加</span>
            </div>
          </el-col>
          <el-col :span='6' class="memberItem" v-for="(item, index) of groupMemberList" :key="index">
            <div class="memberItemImg">
              <img :src="item.avatar" >
            </div>
            <div class="memberItemName">
              <span>{{item.nickname}}</span>
            </div>
          </el-col>
        </el-row>
        <div class="groupInfo">
          <div class="groupInfoItem">
            <div class="groupInfoItemTitle">
              群名称
            </div>
            <div class="groupInfoItemContent">{{ this.vContact.displayName }}</div>
          </div>
        </div> -->
    </div>
    <el-dialog
      class="info-dialog"
      title="重要标记"
      :visible.sync="markOpen"
      :modal="false"
      width="500px"
    >
      <div class="mark-box">
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
    </el-dialog>

    <el-dialog title="修改群" :visible.sync="addGroupOpen" :modal="false" width="500px">
      <EditGroup @grouprMethod="gbAddGroupOpen" :group="vContact" />
    </el-dialog>

    <el-dialog :visible.sync="deleteUserOpen" :modal="false" width="400px">
      <el-row>
        <el-col :span="24">
          <div style="text-align: center">
            <el-avatar :size="70" :src="this.deleteUser.avatar"></el-avatar>
          </div>
        </el-col>
        <el-col :span="24">
          <ul class="list-group list-group-striped">
            <li class="list-group-item">
              <i class="el-icon-user-solid"></i>
              用户账号
              <div class="pull-right">{{ this.deleteUser.id }}</div>
            </li>
            <li class="list-group-item">
              <i class="el-icon-info"></i>
              用户名称
              <div class="pull-right">{{ this.deleteUser.name }}</div>
            </li>
          </ul>
        </el-col>
      </el-row>
    </el-dialog>

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
import { groupMembers, getUserByOrgid, getOrgList, addMemberToGroup } from '../api/data';
import EditGroup from './EditGroup';
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
  },
  props: {
    contact: {
      type: Object,
    },
  },
  watch: {
    contact: {
      deep: true,
      handler: function(newValue, oldValue) {
        console.log(newValue, this.contact);
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
  data() {
    return {
      markOpen: false,
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
      vContact: this.contact,
    };
  },
  mounted() {
    setTimeout(() => {
      console.log(this.contact);
    }, 1000);
    // this.vContact = this.contact
    // console.log(this.vContact)
    // if (this.vContact.isGroup) {
    //   this.all = false
    //   this.getList()
    // }
  },
  methods: {
    handleGroupMark() {
      this.markOpen = true;
      console.log('handleGroupMark', this.markOpen);
    },
    handleGroupPending() {},
    handleGroupNotice() {},
    handleGroupSetting() {},
    getMarkList() {
      console.log('接口获取已标记列表');
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
      groupMembers(this.vContact.id).then((res) => {
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
      this.getOrgList();
      this.addUserOpen = true;
    },
    //获取机构列表
    getOrgList() {
      getOrgList()
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
      getUserByOrgid(this.selectOrgId)
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
      addMemberToGroup(this.vContact.id, selectUserIds)
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
.slot-search {
  width: 70%;
}
/* // 群组成员列表 */
.memberList {
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  .memberItem {
    text-align: center;
    .memberItemImg {
      width: 34px;
      margin: 0 auto;
      img {
        width: 34px;
      }
    }
    .addMemberImg {
      border: 1px solid #999;
      img {
        width: 30px;
        height: 34px;
      }
    }
    .memberItemName {
      font-size: 12px;
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
.groupInfo {
  .groupInfoItem {
    margin: 10px 0;
    .groupInfoItemTitle {
      color: #000;
    }
    .groupInfoItemContent {
      font-size: 12px;
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

.right-fixed-bar {
  margin-top: 2px;
  .iconfont {
    margin: 13px 0 18px 0;
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
}
.info-dialog /deep/ .el-dialog__header {
  padding: 14px !important;
  .el-dialog__title {
    font-size: 14px;
  }
}
.info-dialog /deep/ .el-dialog__body {
  background-color: #f6f6f6;
}
.mark-box {
  padding: 15px 20px;
  min-height: 400px;

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
</style>
