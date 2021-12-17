<template>
  <div class="pending-column">
    <el-form ref="form" :model="formItem" label-position="right" label-width="120px">
      <el-form-item label="待办描述">
        <el-input
          v-model="formItem.desc"
          type="textarea"
          size="small"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-form-item label="待办负责人">
        <el-select v-model="formItem.userIds" size="small" placeholder="请选择" clearable>
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="截止时间">
        <el-date-picker
          v-model="formItem.deadline"
          size="small"
          type="datetime"
          placeholder="选择日期时间"
          default-time="12:00:00"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="small" @click="confirmCreate">立即创建</el-button>
        <el-button size="small">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { Form, FormItem, Select, Option, Button, Input, DatePicker, Message } from 'element-ui';
import { createPending } from '@/api/event';
console.log('DatePicker', DatePicker);

export default {
  name: 'add-pending',
  components: {
    elForm: Form,
    elFormItem: FormItem,
    elSelect: Select,
    elOption: Option,
    elButton: Button,
    elInput: Input,
    elDatePicker: DatePicker,
    Message,
  },
  props: {
    orgUserList: {
      type: Array,
      default: () => [],
    },
    // 会话id
    msgId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      userList: [],
      formItem: {
        desc: '',
        userIds: [],
        deadline: '',
      },
    };
  },
  watch: {
    orgUserList(val) {
      this.userList = val;
    },
  },
  mounted() {
    this.userList = this.orgUserList;
  },
  methods: {
    confirmCreate() {
      createPending(this.formItem)
        .then((res) => {
          if (res.status === 200) {
            Message.success('创建待办成功！');
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
.domTitle {
  font-size: 16px;
  font-weight: bold;
  padding: 10px;
  margin-bottom: 30px;
}
.pending-column {
  padding: 0 20px;
}
</style>
