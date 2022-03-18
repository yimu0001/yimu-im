<!--
 * @文件描述: 群消息已读详情列表展示
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2022-03-17 11:11:33
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2022-03-18 11:26:53
-->
<template>
  <div class="reading-columns">
    <div class="user-list narrow-scroll-bar">
      <div class="reading-title normal-size-text">
        未读人员（{{ unReceiveList ? unReceiveList.length : 0 }}人）
      </div>
      <div class="one-user" v-for="{ avatar, id, nickname } in unReceiveList" :key="id">
        <Avatar :size="30" fit="cover" :src="avatar"></Avatar>
        <p class="name-text normal-size-text over_hide_1">{{ nickname }}</p>
      </div>
    </div>
    <div class="user-list narrow-scroll-bar">
      <div class="reading-title normal-size-text">
        已读人员（{{ receiveList ? receiveList.length : 0 }}人）
      </div>
      <div class="one-user" v-for="{ avatar, id, nickname } in receiveList" :key="id">
        <Avatar :size="30" fit="cover" :src="avatar"></Avatar>
        <p class="name-text normal-size-text over_hide_1">{{ nickname }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchMsgReadingInfo } from '@/api/chat';
import { Avatar } from 'element-ui';

export default {
  name: 'add-pending',
  components: {},
  props: {
    readingContactId: {
      type: String,
      default: {},
    },
    readingMsgId: {
      type: String,
      default: {},
    },
  },
  data() {
    return { msgId: null, receiveList: [], unReceiveList: [] };
  },
  components: {
    Avatar,
  },
  watch: {
    readingMsgId: {
      handler(id) {
        if (id) {
          this.msgId = id;
          this.handleInfo();
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleInfo() {
      this.msgId &&
        fetchMsgReadingInfo(this.readingContactId, this.msgId)
          .then((res) => {
            if (!res) {
              console.log('已读情况获取失败', res);
            }
            if (res.status === 200) {
              const { receive_users, un_receive_users } = res.data.data;
              this.receiveList = receive_users;
              this.unReceiveList = un_receive_users;
            }
          })
          .catch((err) => {
            console.log('已读情况err', err);
          });
    },
  },
};
</script>

<style lang="less" scoped>
.reading-columns {
  width: 100%;
  display: flex;
  background-color: #fff;
  box-sizing: border-box;

  .user-list {
    width: 50%;
    max-height: 500px;
    overflow-y: scroll;
    padding: 0 20px;
    box-sizing: border-box;

    &:first-child {
      border-right: 1px solid #ececec;
    }

    .reading-title {
      margin-bottom: 20px;
      color: #333;
    }
    .one-user {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      .name-text {
        width: 200px;
        padding-left: 10px;
        color: #666;
      }
    }
  }
}
</style>
