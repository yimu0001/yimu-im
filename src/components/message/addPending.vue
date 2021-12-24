<template>
  <div class="pending-column">
    <el-form
      ref="pendform"
      :model="formItem"
      :rules="ruleValidate"
      label-position="right"
      label-width="120px"
    >
      <el-form-item label="待办描述" prop="waitTaskContent">
        <el-input
          v-model="formItem.waitTaskContent"
          class="all-width"
          type="textarea"
          size="small"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-form-item label="待办负责人" prop="waitTaskUserIds">
        <el-select
          v-model="formItem.waitTaskUserIds"
          class="all-width"
          size="small"
          placeholder="请选择"
          filterable
          clearable
          multiple
        >
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="截止时间" prop="waitTaskEndTime">
        <el-date-picker
          v-model="formItem.waitTaskEndTime"
          size="small"
          type="datetime"
          format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择日期时间"
          default-time="16:00:00"
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
import { fetchPendingDirectorList, createPending } from '@/api/event';
import { dateFormat } from '@/libs/tools';
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
    // 消息id messageUId
    msgInfo: {
      type: Object,
      default: {},
    },
    pendGroupId: {
      type: String,
      default: '',
    },
    directorList: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      userList: [],
      formItem: {
        imRemoteId: '',
        waitTaskContent: '',
        waitTaskUserIds: [], // "63,67"
        waitTaskEndTime: '', // "2021-12-15 09:11:13"
      },
      ruleValidate: {
        waitTaskContent: [
          { required: true, message: '请输入待办描述', trigger: 'blur' },
          // { type: 'string', min: 20, message: '待办描述至少20字符', trigger: 'blur' },
        ],
        waitTaskUserIds: [
          {
            required: true,
            type: 'array',
            min: 1,
            message: '请选择待办负责人',
            trigger: 'change',
          },
          // { type: 'array', max: 10, message: '最多选择10人', trigger: 'change' },
        ],
        waitTaskEndTime: [
          { required: true, type: 'date', message: '请选择截止时间', trigger: 'change' },
        ],
      },
    };
  },
  mounted() {
    if (this.msgInfo.conversationType === 1) {
      this.userList = this.directorList; // 当前用户和聊天者
      console.log('单聊', this.userList);
    } else {
      this.pendGroupId && this.getSpinner();
    }
    this.$refs.pendform.resetFields();
  },
  methods: {
    getSpinner() {
      fetchPendingDirectorList(this.pendGroupId)
        .then((res) => {
          console.log('群聊fetchPendingDirectorList res', res);
          if (res.status === 200) {
          } else {
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    confirmCreate() {
      this.$refs.pendform.validate((valid) => {
        if (valid) {
          const { waitTaskContent, waitTaskUserIds, waitTaskEndTime } = this.formItem;
          let formatDate = dateFormat(waitTaskEndTime.getTime());
          console.log('valid', this.msgInfo.id, waitTaskContent, waitTaskUserIds, formatDate);
          createPending(this.msgInfo.id, waitTaskContent, waitTaskUserIds.join(), formatDate)
            .then((res) => {
              console.log('res', res);
              if (res.status === 200) {
                Message.success('创建待办成功！');
              } else {
                Message.error(res.data.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          console.log('验证未通过');
        }
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
  .all-width {
    width: 400px;
    ::v-deep .el-textarea__inner {
      padding: 5px 10px;
    }
  }
}
</style>
