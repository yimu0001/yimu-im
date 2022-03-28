<!--
 * @文件描述: 主文件
 * @待优化: 弹窗拖拽 已读未读
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2022-02-24 15:29:01
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2022-03-28 14:49:16
-->
<template>
  <div>
    <div
      :class="[
        'tipDom',
        theme === 'deep' ? 'deep-color' : 'light-color',
        hasUnread ? 'notice-border animImage' : '',
      ]"
      v-if="!showList && showComponent"
      @click="openChatDialog"
    >
      <div class="avatar-box">
        <div v-if="hasUnread" class="red-dot"></div>
        <Avatar
          v-if="hasUnread"
          :size="38"
          fit="cover"
          :src="require('../assets/light-avatar.png')"
        ></Avatar>
        <Avatar v-else :size="38" fit="cover" :src="require('../assets/deep-avatar.png')"></Avatar>
      </div>
      <div class="nickname-box over_hide_1" :titlr="currentUser.nickname">
        {{ currentUser.nickname || '通讯' }}
      </div>
    </div>
    <el-dialog
      id="mainDialog"
      class="imDialog"
      style="z-index: 2000"
      width="951px"
      :visible.sync="showList"
      :show-close="false"
      :modal="false"
      :close-on-click-modal="false"
      center
      @opened="onOpenedDialog"
    >
      <div class="close-line" @click="handleClose" ref="closeIcon">
        <i class="iconfont icon-guanbi1" title="关闭"></i>
      </div>
      <im-main
        ref="imMainDom"
        :menuList="menuList"
        :currentUser="currentUser"
        :firstConversationId="firstConversationId"
        :currentOrgUsers="currentOrgUsers"
        :orgUserList="orgUserList"
        @handleSendMessage="handleSendMessage"
        @handlePullMessages="handlePullMessages"
        @change-menu="handleChangeMenu"
        @notice-group-sender="handleNoticeGroupSender"
        @notice-single-sender="handleNoticeSingleSender"
        @delete-contact="deleteConnect"
      ></im-main>
      <span slot="footer" class="dialog-footer"> </span>
    </el-dialog>
  </div>
</template>

<script>
import * as RongIMLib from '@rongcloud/imlib-next';
import imMain from './im-main';
import testComponent from '../components/testComponent.vue';
import Settings from './manus/settings';
import { Avatar, Dialog } from 'element-ui';

import {
  registerUser,
  getCurrentUser,
  groupInfos,
  getUserByOrgid,
  getMyGroupList,
} from '@/api/data.js';
import {
  setBackExpansion,
  checkGroupReadStatus,
  checkSingleReadStatus,
  getSettingOptions,
} from '@/api/chat.js';
import bus from '@/libs/bus';
import { CalcTargetId, SetIMTheme } from '@/libs/tools';
import { CalcLastCentent, getFormatChatInfo, getFormatNoticeInfo } from '@/libs/chat';
import { OnInitDrag } from '@/libs/drag';
import { SizeTextObj, ErrorCodeTextObj, NotInGroupCode } from '@/libs/constant';

import Vue from 'vue';
import LemonMessageImage from '@/components/message/image.vue';
import LemonMessageText from '@/components/message/text.vue';
import LemonMessageFile from '@/components/message/file.vue';
setTimeout(() => {
  Vue.component(LemonMessageImage.name, LemonMessageImage);
  Vue.component(LemonMessageText.name, LemonMessageText);
  Vue.component(LemonMessageFile.name, LemonMessageFile);
}, 0);
// TODO 审核等图标先用测试域名 之后替换正式域名https://im.shandian8.com/public/xxx

export default {
  name: 'yimuIm',
  data() {
    return {
      historyDate: +new Date(),
      lastHistoryId: null, // 获取历史记录时用到的contactId
      historyList: [], // 设置扩展必须要用到融云返回的历史记录格式
      contactId: null,
      showList: false,
      im: undefined,
      user_token: '',
      user_id: '',
      currentUser: {},
      //用来储存
      saveMessageList: [],
      rongConversationIds: [], // 融云返回的有聊天记录的会话列表id数组
      // 会话第一个联系人id
      firstConversationId: undefined,
      currentOrgUsers: [], //本机构联系人
      showComponent: false, //展示组件与否
      baseMenuList: [
        { name: 'messages', isBottom: false },
        { name: 'contacts', isBottom: false },
        {
          name: 'manage',
          isBottom: true,
          title: '设置',
          unread: 0,
          key: 'manage',
          iconClass: 'iconfont icon-shezhi',
          component: Settings,
        },
      ],
      menuList: [
        { name: 'messages', isBottom: false },
        { name: 'contacts', isBottom: false },
        {
          name: 'manage',
          isBottom: true,
          title: '设置',
          unread: 0,
          key: 'manage',
          iconClass: 'iconfont icon-shezhi',
          component: Settings,
        },
      ],
      loadStep: 0,
      orgUserList: [], // 创建待办 负责人下拉列表
      waitingOpen: false,
      hasUnread: false,
      isSharing: false, // 来了新消息 边框颜色闪烁
      msgTypeList: { groupList: [], singleList: [], noticeList: [] },
      allGroupsList: [],
      allGroupIds: [],
      allFriendsList: [],
      readStatusObj: {},
      readStatusTime: '',
      sizeOptions: ['large', 'middle', 'small'],
      noticeAllowPop: false,
      firstOpen: true, // 绑定监听拖拽的事件
    };
  },
  props: {
    customMenu: {
      type: Array,
      default: [],
    },
    fromSystem: {
      type: String,
      required: false,
      default: '',
    },
    theme: {
      type: String,
      required: false,
      default: 'light',
    },
  },
  components: {
    Avatar,
    imMain,
    elDialog: Dialog,
  },
  watch: {
    customMenu: {
      handler(arr) {
        if (arr && arr.length > 0) {
          // 过滤外部参数 防止外部组件传入不规范的数据
          let list = arr.map(
            ({ name, isBottom, title, unread, key, iconClass, component }, index) => ({
              name: name || `component_${index}`,
              isBottom: isBottom || false,
              title: title || '自定义',
              unread: unread || 0,
              key: key || `component_${index}`,
              iconClass: iconClass || 'el-icon-menu',
              component: component || testComponent,
            })
          );

          this.menuList = this.baseMenuList.concat(list);
        }
      },
      immediate: true,
    },
    loadStep(step) {
      if (step === 3) {
        // 好友列表+群组列表+会话列表 全部加载完毕
        // <会话列表>中的群组必须是后端返回的<群组列表>中的数据 否则删除
        this.handleConnectList();
        this.cleanRemovedConnect();
      }
    },
    showComponent(bool) {
      if (bool && this.waitingOpen) {
        this.openChatDialog();
      }
    },
    allGroupIds() {
      // console.log('群聊变化');
    },
  },
  mounted() {
    this.firstOpen = true;
    this.getSettingItems();

    this.loadStep = 0;
    this.getCurrentChatUser();
    this.im = RongIMLib.init({ appkey: 'cpj2xarlctfmn', connectType: 'comet' });
    this.imWatcher();
    this.connectRongyun();

    bus.$on('createGroupOk', (id) => {
      // 因为会收到融云建群通知 所以这里不需要再获取新群信息
      this.$refs.imMainDom.createPop = false;
    });
    bus.$on('setExpansion', this.setRongExpansion);
    bus.$on('afterQuitGroup', this.deleteConnect);
    bus.$on('noticePermissionChange', (allowPop) => {
      this.noticeAllowPop = allowPop;
    });
  },
  beforeDestroy() {
    bus.$off('createGroupOk');
    bus.$off('setExpansion');
    bus.$off('afterQuitGroup');
    bus.$off('noticePermissionChange');

    this.removeImWatcher();
  },
  methods: {
    getSettingItems() {
      getSettingOptions().then((res) => {
        if (res.status === 200) {
          // is_notify	1接收消息 0不接受消息;  font_size 0小 1中 2大
          const { is_notify, font_size } = res.data.data;
          let allowPop = is_notify === 1;
          let sizeType = SizeTextObj[font_size] || 'middle';

          this.noticeAllowPop = allowPop;
          this.setThemeInit(sizeType);
        }
      });
    },
    setThemeInit(size) {
      if (this.sizeOptions.includes(size)) {
        // 设置字号大小是根据接口返回值来的
        SetIMTheme(size);
        this.$emit('set-font', size);

        // session中存在 说明是刷新界面的 需要重新自动打开聊天窗口
        let isReload = sessionStorage.getItem('themeSize');
        if (isReload) {
          sessionStorage.setItem('themeSize', '');
          this.openChatDialog();
        }
      }
    },
    // 群聊已读消息回执响应监听 receivedUserId 为消息接收者
    onMessageReceiptResponse({ conversation, receivedUserId, messageUIdList }) {
      console.log('群聊已读监听', conversation, receivedUserId, messageUIdList);
      // {conversationType: 3, targetId: '45', channelId: ''} 4575 ['BVCT-OET5-K84C-01K1']
      if (CalcTargetId(this.contactId) === conversation.targetId) {
        bus.$emit('updateReadNum', 'group', { messageUIdList, receivedUserId });
      }
      // 如果非当前对话 后端自己存起来 更新已读的参数
    },
    // 单聊已读消息回执响应监听
    onReadReceiptReceived({ conversation, messageUId, sentTime }) {
      console.log('单聊已读监听', conversation, messageUId, sentTime);
      // {conversationType: 1, targetId: '1000053', channelId: ''}  undefined 1641350108871
      if (this.contactId === conversation.targetId) {
        bus.$emit('updateReadNum', 'single', { targetId: conversation.targetId, sentTime });
      }
    },
    connectRongyun() {
      registerUser()
        .then((res) => {
          if (res.status === 200) {
            this.user_token = res.data.data.token;
            this.user_id = res.data.data.userId;

            RongIMLib.connect(this.user_token).then((res) => {
              if (res.code === RongIMLib.ErrorCode.SUCCESS) {
                console.log('链接成功, 链接用户 id 为: ', res.data.userId);
                this.getConnetList();
              } else {
                console.warn('链接失败, code:', res.code);
              }
            });
          } else {
            this.$Message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getConnetList() {
      RongIMLib.getConversationList()
        .then(({ code, data: conversationList = [] }) => {
          if (code === 0) {
            conversationList.forEach((item) => {
              let { targetId, conversationType } = item;
              let id = conversationType === 3 ? `group_${targetId}` : targetId;
              item.targetId = id;
            });

            // 万一当前聊天不在群组中 firstConversationId往下顺延
            this.rongConversationIds = conversationList.map(({ targetId }) => targetId);
            this.msgTypeList = this.classifyConnectList(conversationList);
            this.$nextTick(() => {
              this.loadStep += 1;
            });
          } else {
            console.log('获取会话列表失败: ', error.code, error.msg);
          }
        })
        .catch((err) => {
          console.log('获取会话列表失败err', err);
        });
    },
    classifyConnectList(conversationList) {
      let groupList = [];
      let singleList = [];
      let noticeList = [];

      conversationList.forEach((item) => {
        if (item.conversationType === 3) {
          groupList.push(item);
        }
        if (item.conversationType === 1) {
          if (Number(item.targetId) > 0) {
            singleList.push(item);
          } else {
            noticeList.push(item);
          }
        }
      });

      return { groupList, singleList, noticeList };
    },
    // api获取消息已读人数
    handleChangeConcat(id, msg_uids) {
      if (this.contactId !== CalcTargetId(id)) {
        this.readStatusObj = {};
        this.readStatusTime = '';
      }

      this.contactId = CalcTargetId(id);
      if (Number(this.contactId) <= 0) {
        // console.log('系统消息-没有已读数量');
        return;
      }

      if (!msg_uids) {
        this.getSingleRead();
      } else {
        this.getGroupRead(msg_uids);
      }
    },
    getSingleRead() {
      checkSingleReadStatus(this.contactId).then((res) => {
        if (res.status === 200) {
          const { last_message_send_time } = res.data.data;
          this.readStatusTime = last_message_send_time;
          bus.$emit('setSingleReadStatus', this.readStatusTime);
        }
      });
    },
    getGroupRead(msgIds) {
      if (msgIds.length > 0) {
        checkGroupReadStatus(this.contactId, msgIds).then((res) => {
          if (res.status === 200) {
            const list = res.data.data;
            // {msg_uid: 'BUR1-1Q5F-C14C-01J0', user_ids: Array(6)}
            list.forEach(({ msg_uid, user_ids }) => {
              this.readStatusObj[msg_uid] = user_ids;
            });

            this.$nextTick(() => {
              bus.$emit('setGroupReadStatus', this.readStatusObj);
            });
          }
        });
      } else {
        // console.log('群聊里面暂时没消息');
      }
    },
    openChatDialog() {
      if (this.showComponent) {
        this.showList = true;
        this.closeAllNotice();
        this.hasUnread = false;
        this.waitingOpen = false;
      } else {
        this.waitingOpen = true;
      }
    },
    // 监听打开弹窗 处理一些额外参数
    onOpenedDialog() {
      this.saveMessageList.forEach((res) => {
        this.$refs.imMainDom.appendMessage(res);
      });
      this.saveMessageList = [];
      this.hasUnread = false;

      // 只有第一次初始化的时候才绑定
      if (this.firstOpen) {
        OnInitDrag();
        this.firstOpen = false;
      }
    },
    // 从聊天界面点击关闭会话
    handleClose() {
      this.showList = false;
    },
    // 添加事件监听
    imWatcher() {
      const Events = RongIMLib.Events;
      RongIMLib.addEventListener(Events.CONNECTING, function () {
        console.log('正在链接服务器');
      });
      RongIMLib.addEventListener(Events.CONNECTED, function () {
        console.log('已经链接到服务器');
      });
      RongIMLib.addEventListener(Events.MESSAGES, this.handleReceiveMessage);
      // 监听消息扩展通知
      RongIMLib.addEventListener(Events.EXPANSION, this.handleExpansion);
      // 监听已读响应
      RongIMLib.addEventListener(Events.MESSAGE_RECEIPT_RESPONSE, this.onMessageReceiptResponse);
      RongIMLib.addEventListener(Events.READ_RECEIPT_RECEIVED, this.onReadReceiptReceived);
    },
    // 移除事件监听
    removeImWatcher() {
      const Events = RongIMLib.Events;
      RongIMLib.removeEventListener(Events.MESSAGES, this.handleReceiveMessage);
      RongIMLib.removeEventListener(Events.EXPANSION, this.handleExpansion);
      RongIMLib.removeEventListener(Events.MESSAGE_RECEIPT_RESPONSE, this.onMessageReceiptResponse);
      RongIMLib.removeEventListener(Events.READ_RECEIPT_RECEIVED, this.onReadReceiptReceived);
    },
    // 融云消息类型 处理成lemon-ui的格式 并插入
    handleReceiveMessage({ messages }) {
      if (!messages || messages.length === 0) {
        return;
      }

      console.log('接收到的融云推送', messages);
      let curContactMsgs = [];
      messages.forEach((item) => {
        // targetId: "12" conversationType: 3
        let userinfo = item.content.user || {};
        let messageData = {
          id: item.messageUId,
          conversationType: item.conversationType,
          status: 'succeed',
          sendTime: item.sentTime,
          // 注意：toContactId必须包含group 否则lemon-ui无法区分是单聊还是群聊
          toContactId: item.conversationType === 3 ? `group_${item.targetId}` : item.targetId,
          fromUser: {
            id: userinfo.id,
            displayName: userinfo.name,
            avatar: userinfo.portrait,
          },
          canIncludeExpansion: item.canIncludeExpansion || false,
          expansion: item.expansion || {},
        };
        switch (item.messageType) {
          case 'RC:TxtMsg':
            const { content, objName, referMsg, referMsgUserId } = item.content;
            messageData = {
              ...messageData,
              type: 'text',
              content,
              objName,
              referMsg,
              referMsgUserId,
            };
            break;
          case 'RC:ImgMsg':
            messageData = { ...messageData, type: 'image', content: item.content.imageUri };
            break;
          case 'RC:FileMsg':
            const { fileUrl, size, name } = item.content;
            messageData = {
              ...messageData,
              type: 'file',
              content: fileUrl,
              fileSize: size,
              fileName: name,
            };
            break;
          case 'RC:InfoNtf':
            messageData = {
              ...messageData,
              type: 'event',
              content: item.content.message,
              fromUser: {
                id: userinfo.id || -1,
                displayName: userinfo.name || '系统通知',
                avatar: userinfo.portrait || 'https://im.shandian8.com/public/tongzhi.png',
              },
            };

            let newGroupNotice =
              item.conversationType === 3 &&
              (item.content.message.includes('创建了') ||
                item.content.message.includes('邀请了 ' + this.currentUser.nickname));
            let isNewGroup = !this.allGroupIds.includes(item.targetId);
            if (newGroupNotice && isNewGroup) {
              this.loadStep === 3 && this.getNewConnectList(item.targetId);
            }
        }

        // 收到系统通知消息
        if (!this.showList && Number(item.senderUserId) < 0) {
          this.closeAllNotice();
          this.noticeMsgPop(messageData.content);
        }

        // 切换会话框到最新消息
        if (!this.showList) {
          let cid = messageData.toContactId;
          this.firstConversationId = cid;

          this.rongConversationIds = this.rongConversationIds.filter((id) => id !== cid);
          this.rongConversationIds.unshift(cid);

          // this.$refs.imMainDom &&
          //   this.$refs.imMainDom.changeLastestConnect(this.firstConversationId);
        }

        if (this.$refs.imMainDom) {
          this.$refs.imMainDom.appendMessage(messageData, true); // Message, scrollToBottom
        } else if (messageData.id) {
          this.saveMessageList.push(messageData);
        }

        // 如果是当前聊天框的已读通知 立即回执响应
        if (this.contactId && this.contactId === item.targetId) {
          curContactMsgs.push(messageData);
        }
      });

      let noticeCount = curContactMsgs.length;
      if (noticeCount > 0) {
        // 消息体已读回执
        this.$refs.imMainDom?.calcReadNotice(curContactMsgs, noticeCount);
      }

      // 入口新消息提示
      this.hasUnread = true;
    },
    // 弹出通知
    noticeMsgPop(content) {
      if (!this.noticeAllowPop) return;

      this.$Notice.info({
        title: '通知消息',
        desc: '',
        name: 'noticeMsg',
        duration: 5,
        render: (h) => {
          return h(
            'span',
            {
              style: {
                color: '#2d8cf0',
                cursor: 'pointer',
              },
              on: {
                click: () => {
                  this.showList = true;
                  this.closeAllNotice();
                },
              },
            },
            content || '通知消息，点击查看'
          );
        },
      });
    },
    // 监听消息扩展通知
    handleExpansion(evt) {
      if (evt && evt.updatedExpansion) {
        const { expansion, messageUId } = evt.updatedExpansion;

        // 有用户收藏不需要其他用户更新消息
        if (!expansion.thumbedInfo && !expansion.markedObj && expansion.collectedIds) return;

        // 其他用户操作了标记或者点赞 更新消息体
        this.$refs.imMainDom && this.$refs.imMainDom.updateExpansion(expansion, messageUId);
      }
    },
    setRongExpansion(expansion, message, operate, cb) {
      expansion.target_id = message.toContactId;
      let RongMsg = message;
      if (!RongMsg || !RongMsg.canIncludeExpansion) {
        this.$Message.warning('当前消息不支持该操作');
        return;
      }
      // bug: Cannot read properties of null (reading 'expansion')
      RongIMLib.updateMessageExpansion(expansion, RongMsg).then((res) => {
        cb && cb(res);
        if (res.code === 0 && this.$refs.imMainDom) {
          this.$refs.imMainDom.updateExpansion(expansion, message.id);

          // 为了统计数据 调接口通知IM后端 所设置扩展的情况
          if (this.fromSystem === 'cs' && operate) {
            console.log('通知IM后端扩展的情况', this.fromSystem, message.id, expansion, operate);
            setBackExpansion(this.fromSystem, message.id, expansion, operate)
              .then((res) => {
                if (res.status === 200) {
                  console.log('通知扩展OK', res);
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
        } else {
          console.log(res.code, res.msg, '设置扩展-更新失败');
        }
      });
    },
    handleChangeMenu(menuName) {
      this.$emit('change-menu', menuName);
    },
    handleNoticeGroupSender(targetId, msgInfo) {
      // msgIds ['BS4S-U34I-T4G6-9GPP', 'BS4S-T49L-M8Y6-9GPP']
      this.contactId = CalcTargetId(targetId);
      this.clearUnread(true, this.contactId);
      this.currentUser.id &&
        RongIMLib.sendReadReceiptResponseV2(this.contactId, msgInfo)
          .then((res) => {
            if (res.code === 0) {
              console.log('群聊-发送响应回执请求成功', res.code, res.data);
            } else {
              console.log('群聊-发送响应回执请求失败', res.code, res.msg);
            }
          })
          .catch((error) => {
            console.log(error);
          });
    },
    handleNoticeSingleSender(targetId, msgId, sendTime) {
      this.contactId = targetId;
      this.clearUnread(false, this.contactId);
      RongIMLib.sendReadReceiptMessage(this.contactId, msgId, sendTime)
        .then((res) => {
          if (res.code === 0) {
            console.log('单聊-发送响应回执成功', res.code, res.data);
          } else {
            console.log('单聊-发送响应回执成功', res.code, res.msg);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // 清空新消息通知框
    closeAllNotice() {
      if (this.$Notice) {
        try {
          this.$Notice.close('noticeMsg');
        } catch (err) {
          console.log('清空新消息通知框-出错', err);
        }
      }
    },
    clearUnread(isGroup, targetId) {
      const conversationType = isGroup
        ? RongIMLib.ConversationType.GROUP
        : RongIMLib.ConversationType.PRIVATE;

      RongIMLib.clearMessagesUnreadStatus({ conversationType, targetId }).then((res) => {
        if (res.code !== 0) {
          console.log('清空未读err', res.code, res.msg);
        }
      });
    },
    // 把融云记录里面有 但是后端接口没有的群组 删除会话
    cleanRemovedConnect() {
      const { groupList } = this.msgTypeList;
      let rongIds = groupList.map(({ targetId }) => Number(CalcTargetId(targetId)));
      let backGroupIds = this.allGroupIds.map((id) => Number(id));

      this.batchDeleteConnect(rongIds, backGroupIds);
    },
    // 用户列表 群组列表 合并成通讯录 ==> 入口展示
    handleConnectList() {
      this.currentOrgUsers = [];
      const { groupList, singleList, noticeList } = this.msgTypeList;

      // 会话列表-群组
      this.allGroupsList.forEach((item) => {
        item.targetId = `group_${item.id}`;
        let curMsg = groupList.filter(({ targetId }) => CalcTargetId(targetId) == item.id)[0];
        if (curMsg) {
          const { targetId, unreadMessageCount = 0, latestMessage } = curMsg;
          item = { ...item, targetId, unreadMessageCount, latestMessage };
        }
        this.currentOrgUsers.push(getFormatChatInfo(item, true));
      });

      // 会话列表-个人
      this.allFriendsList.forEach((userItem) => {
        userItem.targetId = userItem.id;
        let curMsg = singleList.filter(({ targetId }) => targetId == userItem.id)[0];
        if (curMsg) {
          const { unreadMessageCount = 0, latestMessage } = curMsg;
          userItem = { ...userItem, unreadMessageCount, latestMessage };
        }
        this.currentOrgUsers.push(getFormatChatInfo(userItem, false));
      });

      // 通知消息
      noticeList.forEach((item) => {
        this.currentOrgUsers.push(getFormatNoticeInfo(item));
      });

      this.setFirstConversation();
      this.showComponent = true;
    },
    setFirstConversation() {
      let allIds = this.currentOrgUsers.map(({ id }) => id);
      for (var i = 0; i < this.rongConversationIds.length; i++) {
        if (allIds.includes(this.rongConversationIds[i])) {
          this.firstConversationId = this.rongConversationIds[i];
          break; // 终止循环
        }
      }
    },
    // 创建群组之后 获取会话列表
    getNewConnectList(id) {
      let existGroup = this.allGroupIds.includes(id);
      if (existGroup) {
        console.log('这个群已经存在了', existGroup);
        return;
      }

      this.allGroupIds.push(String(id));

      RongIMLib.getConversationList().then(({ code, data: conversationList }) => {
        if (code === 0) {
          let curConverse = conversationList.filter((item) => item.targetId == id)[0] || {};
          let targetId = `group_${id}`;
          if (curConverse) {
            this.firstConversationId = targetId;
          }

          groupInfos(id).then((res) => {
            if (res.status === 200) {
              const { content: displayName, avatar } = res.data.data[id];

              let defaultMessage = {
                content: { message: this.currentUser.nickname + ' 创建了群聊' },
                messageType: 'RC:InfoNtf',
                sentTime: new Date().getTime(),
              };
              let { messageType, content, sentTime } = curConverse.latestMessage || defaultMessage;
              let lastInfo = CalcLastCentent(messageType, content);

              let userItem = {
                id: targetId,
                displayName,
                avatar,
                index: '[1]群聊',
                unread: curConverse.unreadMessageCount || 0,
                lastSendTime: sentTime,
                lastContent: { ...lastInfo },
                isGroup: true,
                isNew: true, // for render lastContent
              };

              // 现在通讯录里的群
              let nowGroups = this.currentOrgUsers.filter(({ isGroup }) => isGroup);
              let existItem = nowGroups.filter(({ id }) => id === targetId)[0];
              if (!existItem) {
                // 往通讯录里加新群
                this.currentOrgUsers.push(userItem);
                this.$refs.imMainDom && this.$refs.imMainDom.refreshContact(this.currentOrgUsers);
              }
            }
          });
        } else {
          console.log('获取会话列表失败: ', error.code, error.msg);
        }
      });
    },
    // 仅当发送消息时指定 canIncludeExpansion 值为 true，才可对消息进行拓展
    handleSendMessage(item) {
      // 如果当前用户已被移除群聊 消息发不出去
      let {
        target_id,
        conversation_type,
        content, //  object
        isGroup,
        referMsgUserId,
        referMsg,
      } = item;

      // 指定消息发送的目标会话
      const conversation = {
        targetId: CalcTargetId(target_id),
        conversationType: isGroup
          ? RongIMLib.ConversationType.GROUP
          : RongIMLib.ConversationType.PRIVATE,
      };

      // 类型 conversation_type 'RC:ReferenceMsg' 'RC:TxtMsg' 'RC:ImgMsg' 'RC:FileMsg' 'RC:InfoNtf'
      let message = null;
      if (conversation_type === 'RC:ReferenceMsg') {
        message = new RongIMLib.ReferenceMessage({
          referMsgUserId,
          referMsg,
          content: content.content,
          user: content.user || {}, // 加上的
          objName: RongIMLib.MessageType.TEXT,
        });
      } else if (conversation_type === 'RC:TxtMsg') {
        message = new RongIMLib.TextMessage(content);
      } else if (conversation_type === 'RC:ImgMsg') {
        // Base64改为线上链接url
        message = new RongIMLib.ImageMessage({
          content: content.content || '', // 图片缩略图，应为 Base64 字符串，且不可超过 80KB
          imageUri: content.imageUri || '', // 图片的远程访问地址
          user: content.user || {}, // 加上的
        });
      } else if (conversation_type === 'RC:FileMsg') {
        message = new RongIMLib.FileMessage(content);
      } else if (conversation_type === 'RC:InfoNtf') {
        // web端不会主动发送这种类型消息
      }

      const options = {
        canIncludeExpansion: true,
        expansion: {
          thumbedInfo: {}, // {id: {name, type}}
          markedObj: {}, // {id: name}
          collectedIds: [],
          target_id: null, // 为了收到扩展通知的时候能够找到属于哪个会话
        },
      };

      this.sendMessageToRongyun(conversation, message, options, item);
    },
    // 发送消息
    sendMessageToRongyun(conversation, message, options, item) {
      const { fun, isGroup } = item;
      RongIMLib.sendMessage(conversation, message, options).then(({ code, data }) => {
        if (code === 0) {
          console.log('消息发送成功回调：', data.messageUId, data);
          fun(data, item);

          isGroup &&
            RongIMLib.sendReadReceiptRequest(conversation.targetId, data.messageUId)
              .then((res) => {
                if (res.code === 0) {
                  console.log('群聊-发起已读回执请求成功', res.code, res.msg);
                } else {
                  console.log('群聊-发起已读回执请求失败', res.code, res.msg);
                }
              })
              .catch((error) => {
                console.log(error);
              });
        } else {
          let errorMsg = ErrorCodeTextObj[code] || '';
          this.$Message.warning({
            content: '发送失败：' + errorMsg,
            duration: 4,
          });

          console.log('消息发送失败：', code);
          fun({ status: 'failed' });

          // 22406 被移除群聊
          if (code === NotInGroupCode) {
            // 将用户的该条群组记录移除 from会话列表&群组列表
            this.deleteConnect(3, conversation.targetId);
          }
        }
      });
    },
    handlePullMessages(args) {
      let { id, isGroup, displayName, avatar } = args.contact;
      let targetId = CalcTargetId(id); // 原本id 现在group_id

      // 首次进入聊天
      !this.lastHistoryId && (this.lastHistoryId = targetId);
      // 聊天对象被切换了
      if (this.lastHistoryId !== targetId) {
        this.historyDate = +new Date();
        this.lastHistoryId = targetId;
      }

      const conversation = {
        targetId,
        conversationType: isGroup
          ? RongIMLib.ConversationType.GROUP
          : RongIMLib.ConversationType.PRIVATE,
      };
      const option = {
        // 获取历史消息的时间戳，默认为 0，表示从当前时间获取
        timestamp: this.historyDate,
        // 获取条数，有效值 1-20，默认为 20
        count: 20,
      };

      // 有时候这里卡住
      targetId &&
        RongIMLib.getHistoryMessages(conversation, option)
          .then(({ code, data }) => {
            if (code === 0) {
              const list = data.list; // 获取到的消息列表
              const hasMore = data.hasMore; // 是否还有历史消息可获取
              list[0] && (this.historyDate = list[0].sentTime);

              let msg_uids = isGroup
                ? data.list
                    .filter(({ senderUserId }) => Number(senderUserId) > 0)
                    .map(({ messageUId }) => messageUId)
                : null;
              this.handleChangeConcat(targetId, msg_uids);

              let otheruser = { id: targetId, displayName, avatar }; // 给单聊用的
              // console.log('融云历史记录', targetId, list);
              this.$refs.imMainDom.pullHistory(list, hasMore, args.next, otheruser);
            } else {
              console.log('聊天记录失败', code, data);
              args.next([], true);

              let errorMsg = ErrorCodeTextObj[code] || '获取聊天记录失败，请刷新重试';
              this.$Message.error({
                content: errorMsg,
                duration: 4,
              });

              // 22406 被移除群聊
              if (code === NotInGroupCode) {
                // 将用户的该条群组记录移除 from会话列表&群组列表
                this.deleteConnect(3, conversation.targetId);
              }
            }
          })
          .catch((error) => {
            console.log('获取聊天记录失败', error, error.msg);
          });
    },
    //唤起会话
    changeContact(contact) {
      this.showList = true;
      setTimeout(() => {
        this.$refs.imMainDom.changeContact(contact);
      }, 500);
    },
    // 当前用户信息
    getCurrentChatUser() {
      getCurrentUser()
        .then((res) => {
          if (res.status === 200) {
            this.currentUser = res.data.data;
            const { id, nickname, orgid, avatar } = res.data.data;
            let user = {
              id: String(id),
              displayName: nickname,
              orgid: orgid,
              avatar: avatar,
            };
            sessionStorage.setItem('current_user', JSON.stringify(user));
            sessionStorage.setItem('current_userId', id);
            bus.$emit('setUserInfo', user);
            this.getAdressList();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getAdressList() {
      getMyGroupList()
        .then((res) => {
          if (res.status !== 200) {
            this.$Message.error(res.data.msg);
            return;
          }

          const { list } = res.data.data; // total, last_page
          this.allGroupIds = list.map(({ id }) => String(id));
          this.allGroupsList = list.map((item) => {
            let userItem = {
              id: item.id,
              displayName: item.name,
              avatar: item.avatar,
              index: '[1]群聊',
              unread: 0,
              lastSendTime: '',
              lastContent: '',
              isGroup: true,
            };

            return userItem;
          });
          this.loadStep += 1;
        })
        .catch((err) => {
          console.log(err);
        });

      getUserByOrgid(this.currentUser.orgid)
        .then((res) => {
          if (res.status !== 200) {
            this.$Message.error(res.data.msg);
            return;
          }

          let userList = res.data.data;
          this.orgUserList = userList.map(({ id, name }) => ({ id, name }));
          this.allFriendsList = userList.map((item) => {
            let userItem = {
              id: item.id,
              displayName: item.name,
              avatar: item.avatar,
              index: '[2]好友',
              unread: 0,
              lastSendTime: '',
              lastContent: '',
            };

            return userItem;
          });
          this.loadStep += 1;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 批量删除已退出的群聊 id number
    batchDeleteConnect(rongIds, backIds) {
      rongIds.forEach((id) => {
        if (!backIds.includes(id)) {
          this.deleteConnect(3, String(id), true);
        }
      });
    },
    // 删除会话 this.deleteConnect(1, '27');
    deleteConnect(conversationType, contactId, totally = false) {
      let targetId = CalcTargetId(contactId);
      RongIMLib.removeConversation({
        conversationType, // 1个人 3群聊
        targetId,
      }).then((res) => {
        if (res.code === 0) {
          // 从currentOrgUsers删掉lastContent
          let index = null;
          this.currentOrgUsers.forEach((item, i) => {
            if (CalcTargetId(item.id) === targetId) {
              index = i;
            }
          });
          if (index >= 0) {
            if (totally) {
              this.currentOrgUsers.splice(index, 1);
            } else {
              this.$set(this.currentOrgUsers[index], 'lastContent', {});
            }
            this.$refs.imMainDom && this.$refs.imMainDom.refreshContact(this.currentOrgUsers);
            this.setFirstConversation();
          }
        } else {
          console.log(res.code, res.msg);
        }
      });
    },
    // 删除会话中某一条消息 this.deleteConnectMessage(1, '27', 'BUCQ-JP7L-SE84-01I5', 1642399765463);
    deleteConnectMessage(conversationType, targetId, messageUId, sentTime) {
      const conversation = {
        conversationType,
        targetId, // "<目标用户ID>"
      };
      RongIMLib.deleteMessages(conversation, [
        {
          messageUId,
          sentTime,
          messageDirection: RongIMLib.MessageDirection.SEND,
        },
      ])
        .then((res) => {
          if (res.code === 0) {
            console.log('删除消息成功');
          } else {
            console.log(res.code, res.msg);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style lang="less" scoped>
@import url('../assets/css/news-style.less');
</style>
