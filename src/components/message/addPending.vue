<template>
  <div class="pending-column">
    <Form
      ref="pendform"
      :label-width="120"
      label-position="right"
      :rules="ruleValidate"
      :model="formItem"
    >
      <FormItem label="待办描述" prop="waitTaskContent">
        <Input
          v-model="formItem.waitTaskContent"
          class="all-width"
          type="textarea"
          placeholder="请输入"
        />
      </FormItem>
      <FormItem label="待办负责人" prop="waitTaskUserIds">
        <Select
          v-model="formItem.waitTaskUserIds"
          class="all-width"
          placeholder="选择负责人"
          filterable
          clearable
          multiple
        >
          <Option v-for="item in userList" :key="item.id" :value="item.id">{{
            item.nickname
          }}</Option>
        </Select>
      </FormItem>
      <FormItem label="截止时间" prop="waitTaskEndTime">
        <DatePicker
          v-model="formItem.waitTaskEndTime"
          type="datetime"
          format="yyyy-MM-dd HH:mm"
          placeholder="选择日期时间"
          style="width: 200px"
        ></DatePicker>
      </FormItem>
      <FormItem>
        <Button @click="confirmCreate" type="primary" :loading="createLoading">立即创建</Button>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import { fetchPendingDirectorList, createPending } from '@/api/event';
import { CalcTargetId, dateFormat } from '@/libs/tools';
import { Form, FormItem, Input, Select, Option, DatePicker, Button } from 'view-design';

export default {
  name: 'add-pending',
  components: { Form, FormItem, Input, Select, Option, DatePicker, Button },
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
        waitTaskEndTime: '', // "2021-12-15 09:11"
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
      createLoading: false,
      targetId: null,
    };
  },
  watch: {
    'msgInfo.isGroup'(isGroup) {
      if (isGroup) {
        this.pendGroupId && this.getSpinner();
      } else {
        this.userList = this.directorList; // 当前用户和聊天者
      }
    },
    pendGroupId(id) {
      this.targetId = CalcTargetId(id);
    },
  },
  mounted() {
    this.targetId = CalcTargetId(this.pendGroupId);
    if (this.msgInfo.isGroup) {
      this.pendGroupId && this.getSpinner();
    } else {
      this.userList = this.directorList; // 当前用户和聊天者
    }

    this.$refs.pendform.resetFields();
  },
  methods: {
    getSpinner() {
      fetchPendingDirectorList(this.targetId)
        .then((res) => {
          if (res.status === 200) {
            this.userList = res.data.data;
          } else {
            this.userList = [];
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
          this.createLoading = true;
          createPending(this.msgInfo.id, waitTaskContent, waitTaskUserIds.join(), formatDate)
            .then((res) => {
              if (res.status === 200) {
                this.$Message.success(res.data.msg || '创建待办成功！');
                this.$emit('close');
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
