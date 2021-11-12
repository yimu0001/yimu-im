<template>
  <div>
    <div class="domTitle">
      创建群组
      <div class="domButton">
        <el-button type="primary" size="small" @click="createGroup">确认</el-button>
      </div>
    </div>
    
    <div class="groupName">
      <el-input v-model="groupName" placeholder="请输入群组标题" style="width: 400px"></el-input>
    </div>
    <el-row :gutter="30" class="peopleSelectDom">
      <el-col :span='8' :offset="1" class="orgList">
        <div v-for="item of orgList" :key="`orgItem${item.id}`" class="orgItem" :class="activeOrgId == item.id? 'activeOrg' : ''" @click="chooseOrg(item.id)">
          {{item.name}}
        </div>
      </el-col>
      <el-col :span='8' class="orgList">
        <div v-for="item of currentOrgUsers" :key="`currentOrgUser${item.id}`" class="userItem">
          <el-checkbox :label="item.id" border @change='handleChangeUser($event, item)' v-model="item.checked"> {{item.name}}-{{item.dpt_name}}</el-checkbox>
        </div>
      </el-col>
      <el-col :span='6' class="orgList">
        <div>
          已选人员：
        </div>
        <div v-for="(item, index) of selecedUser" :key="`currentOrgUser${item.id}`" class="userItem">
          <!-- <el-checkbox :label="item.id" border @change='handleChangeUser($event, item)'> {{item.name}}-{{item.dpt_name}}</el-checkbox> -->
          <el-tag closable @close='handleDelSelectUser(item.id, index)'>
          {{item.name}}-{{item.dpt_name}}
          </el-tag>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { Button, Input, Row, Col, Message, CheckboxGroup, Checkbox, Tag} from 'element-ui';
import { getOrgList, getUserByOrgid, createGroup } from '../api/data'
import Bus from '../libs/bus';
  export default {
    name: 'addGroup',
    components: {
      elButton: Button,
      elInput: Input,
      elRow: Row,
      elCol: Col,
      Message,
      elCheckboxGroup: CheckboxGroup,
      elCheckbox: Checkbox,
      elTag: Tag
    },
    data() {
      return {
        groupName: '',
        orgList: [],
        activeOrgId: '', //选中的机构
        currentOrgUsers: [],
        checkUser: [],
        selecedUser: []
      }
    },
    mounted () {
      this.getOrgList();
    },
    methods: {
      getOrgList() {
        getOrgList(this.$store.state.axiosBaseUrl).then(res => {
          console.log(res)
          if(res.status === 200) {
            this.orgList = res.data.data
          } else {
            Message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      },
      chooseOrg(id) {
        this.activeOrgId = id
        this.getUserByOrgid()
      },

      //获取机构下人员
      getUserByOrgid() {
        getUserByOrgid(this.$store.state.axiosBaseUrl, this.activeOrgId).then(res => {
          console.log(res)
          if(res.status === 200) {
            let selectUserIds = this.selecedUser.map(item => {
              return item.id
            })
            this.currentOrgUsers = res.data.data.map(item => {
              item.checked = false
              if(selectUserIds.includes(item.id)){
                item.checked = true
              }
              return item
            })
          } else {
            Message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      },
      handleChangeUser(e, item){
        if(e){
          this.selecedUser.push(item)
        } else {
          this.selecedUser = this.selecedUser.filter(user => {
            return user.id != item.id
          })
        }
      },

      //删除所选人员
      handleDelSelectUser(id, index) {
        this.selecedUser.splice(index,1)
        this.currentOrgUsers.forEach(item => {
          if(item.id == id){
            item.checked = false
          }
        })
      },
      createGroup() {
        let userIds = this.selecedUser.map(user => {
          return Number(user.id)
        })
        createGroup(this.$store.state.axiosBaseUrl, this.groupName, userIds).then(res => {
          if(res.status === 200) {
            Message.success('创建成功！')
            Bus.$emit('createGroupOk', res.data.data.id);
          } else {
            Message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },
  }
</script>

<style lang="less" scoped>
.domTitle{
  font-size: 16px;
  font-weight: bold;
  padding: 10px;
  margin-bottom: 30px;
  position: relative;
  .domButton{
    position: absolute;
    right: 10px;
    top: 10px
  }
}
.groupName{
  text-align: center;
  margin-bottom: 22px;
}
.peopleSelectDom{
  .orgList{
    // background: #d3dce6;
    border-radius: 4px;
    height: 406px;
    overflow-y: scroll;
    .orgItem{
      background-color: #eee;
      margin-top: 10px;
      height: 38px;
      line-height: 38px;
      text-align: center;
      border-radius: 5px;
      cursor: pointer;
    }
    .activeOrg{
      background-color: #409EFF;
      color: #fff;
    }
    .userItem{
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