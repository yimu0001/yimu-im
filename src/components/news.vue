<template>
  <div>
    <!-- TODO 新消息来了之后入口处闪烁两下 边框改变颜色 'notice-border', -->
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
        <!-- <Avatar :size="38" fit="cover" :src="currentUser.avatar"></Avatar> -->
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
      class="imDialog"
      style="z-index: 2000;"
      width="951px"
      :visible.sync="showList"
      :show-close="false"
      :modal="false"
      :close-on-click-modal="false"
      center
      @opened="handleOpenedDialog"
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
        @closeModal="handleClose"
        @change-menu="changeMenu"
        @notice-group-sender="handleNoticeGroupSender"
        @notice-single-sender="handleNoticeSingleSender"
        @notice-change-contact="handleChangeConcat"
        @delete-contact="deleteConnect"
      ></im-main>
      <span slot="footer" class="dialog-footer"> </span>
    </el-dialog>

    <!-- <Modal
      class="imModal"
      v-model="showList"
      width="800"
      :mask="false"
      :mask-closable="false"
      :closable="false"
      footer-hide
      draggable
      @on-visible-change="handleOpenedDialog"
    >
      <span slot="header" class="modal-hedaer"> </span>
    </Modal> -->
  </div>
</template>

<script>
import imMain from './im-main';
import { Avatar, Dialog } from 'element-ui';

import * as RongIMLib from '@rongcloud/imlib-next';
import {
  registerUser,
  getCurrentUser,
  getTargetInfoById,
  groupInfos,
  getUserByOrgid,
  getMyGroupList,
} from '@/api/data.js';
import { setBackExpansion, checkGroupReadStatus, checkSingleReadStatus } from '@/api/chat.js';
import bus from '@/libs/bus';
import { CalcTargetId, CalcLastCentent } from '@/libs/tools';
import testComponent from '../components/testComponent.vue';

import Vue from 'vue';
import LemonMessageImage from '@/components/message/image.vue';
import LemonMessageText from '@/components/message/text.vue';
import LemonMessageFile from '@/components/message/file.vue';
setTimeout(() => {
  Vue.component(LemonMessageImage.name, LemonMessageImage);
  Vue.component(LemonMessageText.name, LemonMessageText);
  Vue.component(LemonMessageFile.name, LemonMessageFile);
}, 0);
// TODO 先用着测试域名 之后替换正式域名
// https://im.shandian8.com/public/shenhe2.png
// https://im.shandian8.com/public/qunliao.png
// https://im.shandian8.com/public/danliao.png
// https://im.shandian8.com/public/tongzhi.png

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
      // 会话第一个联系人id
      firstConversationId: undefined,
      currentOrgUsers: [], //本机构联系人
      showComponent: false, //展示组件与否
      baseMenuList: [
        { name: 'messages', isBottom: false },
        { name: 'contacts', isBottom: false },
      ],
      menuList: [
        { name: 'messages', isBottom: false },
        { name: 'contacts', isBottom: false },
      ],
      loadStep: 0,
      orgUserList: [], // 创建待办 负责人下拉列表
      waitingOpen: false,
      hasUnread: false,
      isSharing: false, // 来了新消息 边框颜色闪烁
      msgTypeList: { groupList: [], singleList: [], noticeList: [] },
      allGroupsList: [],
      allFriendsList: [],
      // 弃用
      conversationObj: {},
      messageList: [],
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
        this.handleConnectList();
      }
    },
    showComponent(bool) {
      if (bool && this.waitingOpen) {
        this.openChatDialog();
      }
    },
  },
  mounted() {
    // setTimeout(() => {
    //   this.deleteConnectMessage(1, '27', 'BUCQ-JP7L-SE84-01I5', 1642399765463);
    //   this.deleteConnect(1, '27');
    // }, 3000);

    this.loadStep = 0;
    this.getCurrentChatUser();
    this.im = RongIMLib.init({ appkey: 'cpj2xarlctfmn', connectType: 'comet' });
    this.imWatcher();
    this.connectRongyun();

    bus.$on('createGroupOk', (id) => {
      this.$refs.imMainDom.createPop = false;
      this.getNewConnectList(id); // 获取会话列表
    });
    bus.$on('setExpansion', this.setRongExpansion);
    bus.$on('afterQuitGroup', this.deleteConnect);

    const Events = RongIMLib.Events;
    // 监听响应
    RongIMLib.addEventListener(Events.MESSAGE_RECEIPT_RESPONSE, this.onMessageReceiptResponse);
    RongIMLib.addEventListener(Events.READ_RECEIPT_RECEIVED, this.onReadReceiptReceived);
  },
  beforeDestroy() {
    bus.$off('createGroupOk');
    bus.$off('setExpansion');
    bus.$off('afterQuitGroup');

    const Events = RongIMLib.Events;
    RongIMLib.removeEventListener(Events.MESSAGE_RECEIPT_RESPONSE, this.onMessageReceiptResponse);
    RongIMLib.removeEventListener(Events.READ_RECEIPT_RECEIVED, this.onReadReceiptReceived);
  },
  methods: {
    onMessageReceiptResponse({ conversation, messageUId, senderUserId }) {
      // senderUserId 为已查看发送消息用户id
      // {conversationType: 3, targetId: '12', channelId: ''}  BU51-48QJ-9TKC-01H1 {1000053: 1641353350477}
      if (CalcTargetId(this.contactId) === conversation.targetId) {
        console.log('群聊已读回执', conversation, messageUId, senderUserId);
        this.$refs.imMainDom.updateReadState(messageUId, senderUserId);
      } else {
        // 后端自己存起来 更新已读的参数
      }
    },
    onReadReceiptReceived({ conversation, messageUId, sentTime }) {
      // {conversationType: 1, targetId: '1000053', channelId: ''}  undefined 1641350108871
      if (this.contactId === conversation.targetId) {
        console.log('单聊已读回执', conversation, messageUId, sentTime);
        this.$refs.imMainDom.updateReadState(messageUId, null, sentTime);
      } else {
        // 后端自己存起来 更新已读的参数
        // 每次切换会话框的时候 this.$refs.IMUI.getCurrentMessages 返回当前聊天窗口的所有消息 用来调接口获取已读人数
      }
    },

    handleChangeConcat(id, msg_uids) {
      // TODO api获取消息已读人数 当前用户是sendUserId
      this.contactId = CalcTargetId(id);
      // console.log('api获取消息已读', this.contactId, msg_uids);
      // TODO 接口500
      return;

      if (Number(this.contactId) <= 0) {
        console.log('系统消息没有已读数量');
        return;
      }

      if (msg_uids) {
        checkGroupReadStatus(this.contactId, msg_uids).then((res) => {
          console.log('群聊已读人数', res);
          if (res.status === 200) {
            // const { list } = res.data.data;
            // bus.$emit('setGroupReadStatus', list);
          }
        });
      } else {
        checkSingleReadStatus(this.contactId).then((res) => {
          console.log('单聊已读人数', res);
          if (res.status === 200) {
            const { last_message_send_time } = res.data.data;
            bus.$emit('setSingleReadStatus', last_message_send_time);
          }
        });
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
    // 为了切换菜单的时候 重新获取接口
    changeMenu(menuName) {
      this.$emit('change-menu', menuName);
    },
    imWatcher() {
      let that = this;
      // 添加事件监听
      const Events = RongIMLib.Events;
      RongIMLib.addEventListener(Events.CONNECTING, function() {
        console.log('正在链接服务器');
      });
      RongIMLib.addEventListener(Events.CONNECTED, function() {
        console.log('已经链接到服务器');
      });
      RongIMLib.addEventListener(Events.MESSAGES, function({ messages }) {
        if (messages && messages.length > 0) {
          // that.historyList = that.historyList.concat(messages);
          that.handleReceiveMessage(messages);
        }
      });
      // 监听消息扩展通知
      RongIMLib.addEventListener(RongIMLib.Events.EXPANSION, (evt) => {
        console.log('监听消息扩展通知', evt);
        if (evt && evt.updatedExpansion) {
          const { expansion, messageUId } = evt.updatedExpansion;

          // 有用户收藏不需要其他用户更新消息
          if (!expansion.thumbedInfo && !expansion.markedObj && expansion.collectedIds) return;

          // 其他用户操作了标记或者点赞 更新消息体
          this.$refs.imMainDom && this.$refs.imMainDom.updateExpansion(expansion, messageUId);
        }
      });
    },
    // 融云消息类型 处理成lemon-ui的格式 并插入
    handleReceiveMessage(messages) {
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
          // todo 来自客户端的消息不可设置扩展
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
        }

        if (!this.showList && Number(item.senderUserId) < 0) {
          this.closeAllNotice();
          console.log('收到系统通知消息', messageData);
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
                messageData.content || '通知消息，点击查看'
              );
            },
          });
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
    handleNoticeGroupSender(targetId, msgIds) {
      // msgIds ['BS4S-U34I-T4G6-9GPP', 'BS4S-T49L-M8Y6-9GPP']
      this.contactId = CalcTargetId(targetId);
      this.clearUnread(true, this.contactId);

      console.log('群聊-发送响应回执', this.contactId, this.currentUser.id, msgIds);
      this.currentUser.id &&
        RongIMLib.sendReadReceiptResponseV2(this.contactId, { [this.currentUser.id]: msgIds })
          .then((res) => {
            if (res.code === 0) {
              console.log('响应回执请求成功', res.code, res.data);
            } else {
              console.log('响应回执请求成功', res.code, res.msg);
            }
          })
          .catch((error) => {
            console.log(error);
          });
    },
    handleNoticeSingleSender(targetId, msgId, sendTime) {
      this.contactId = targetId;
      this.clearUnread(false, this.contactId);
      console.log('单聊-发送响应回执', this.contactId, msgId, sendTime);
      RongIMLib.sendReadReceiptMessage(this.contactId, msgId, sendTime)
        .then((res) => {
          if (res.code === 0) {
            console.log('响应回执成功', res.code, res.data);
          } else {
            console.log('响应回执成功', res.code, res.msg);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // 逐个清空新消息通知框
    closeAllNotice() {
      if (this.$Notice) {
        try {
          this.$Notice.close('noticeMsg');
        } catch (err) {
          console.log('closeAllNotice出错', err);
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
                // this.getUnreadNumber();
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
      // 获取会话列表 失败 导致右下角不展示
      RongIMLib.getConversationList()
        .then(({ code, data: conversationList }) => {
          if (code === 0) {
            console.log('获取会话列表成功', conversationList);
            conversationList.forEach((item) => {
              let { targetId, conversationType } = item;
              let id = conversationType === 3 ? `group_${targetId}` : targetId;
              item.targetId = id;
            });

            if (conversationList[0]) {
              let { targetId } = conversationList[0];
              this.firstConversationId = targetId;
            }

            this.msgTypeList = this.classifyConnectList(conversationList);
            this.$nextTick(() => {
              this.loadStep += 1;
              // this.handleConnectList1(groupList, singleList, noticeList);
            });
          } else {
            console.log('获取会话列表失败: ', error.code, error.msg);
          }
        })
        .catch((err) => {
          console.log('获取会话列表失败err', err);
        });
    },
    getUnreadNumber() {
      RongIMLib.getTotalUnreadCount()
        .then((res) => {
          if (res.code === 0) {
            console.log('获取所有会话未读数ok', res.code, res.data);
          } else {
            console.log('获取所有会话未读数no', res.code, res.msg);
          }
        })
        .catch((error) => {
          console.log(error);
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
    // 用户列表 群组列表 合并成通讯录
    handleConnectList() {
      this.currentOrgUsers = [];
      const { groupList, singleList, noticeList } = this.msgTypeList;

      // 会话列表-群组
      this.allGroupsList.forEach((item) => {
        item.targetId = `group_${item.id}`;
        let curMsg = groupList.filter(({ targetId }) => CalcTargetId(targetId) == item.id)[0];
        if (curMsg) {
          const { targetId, unreadMessageCount, latestMessage } = curMsg;
          item = { ...item, targetId, unreadMessageCount, latestMessage };
        }
        this.currentOrgUsers.push(this.handleChatInfo(item, true));
      });

      // 会话列表-个人
      this.allFriendsList.forEach((userItem) => {
        userItem.targetId = userItem.id;
        let curMsg = singleList.filter(({ targetId }) => targetId == userItem.id)[0];
        if (curMsg) {
          const { unreadMessageCount, latestMessage } = curMsg;
          userItem = { ...userItem, unreadMessageCount, latestMessage };
        }
        this.currentOrgUsers.push(this.handleChatInfo(userItem, false));
      });

      // 通知消息
      noticeList.forEach((item) => {
        this.currentOrgUsers.push(this.handleNoticeInfo(item));
      });

      console.log('this.currentOrgUsers====>', this.currentOrgUsers);

      this.showComponent = true;
    },
    handleChatInfo(item, isGroup = false) {
      let defaultName = isGroup ? '选题群组' : '未知用户';
      let defaultAvatar = isGroup
        ? 'https://im.shandian8.com/public/qunliao.png'
        : 'https://im.shandian8.com/public/danliao.png';

      let userItem = {
        id: item.targetId,
        displayName: item.displayName || defaultName,
        avatar: item.avatar || defaultAvatar,
        index: isGroup ? '[2]群聊' : '[1]好友',
        unread: item.unreadMessageCount,
        lastSendTime: item.latestMessage ? item.latestMessage.sentTime : item.lastSendTime,
        lastContent: {},
        isGroup,
      };

      if (item.latestMessage) {
        let { messageType, content } = item.latestMessage || {};
        userItem.lastContent = CalcLastCentent(messageType, content);
      }

      return userItem;
    },
    handleNoticeInfo(item) {
      // 通知
      if (item.targetId === '-1') {
        item.displayName = '系统审核';
        item.avatar = 'https://im.shandian8.com/public/shenhe2.png';
      } else if (item.targetId === '-2') {
        item.displayName = '通知提醒';
        item.avatar = 'https://im.shandian8.com/public/tongzhi.png';
      } else if (item.targetId === '-3') {
        item.displayName = '内容监控';
        item.avatar = 'https://im.shandian8.com/public/shenhe2.png';
      }
      let userItem = {
        id: item.targetId,
        displayName: item.displayName,
        avatar: item.avatar,
        index: '[3]通知',
        unread: item.unreadMessageCount,
        lastSendTime: item.latestMessage.sentTime,
        lastContent: { type: 'text', content: item.latestMessage.content.content },
      };

      return userItem;
    },
    // 创建群组之后 获取会话列表
    getNewConnectList(id) {
      RongIMLib.getConversationList().then(({ code, data: conversationList }) => {
        if (code === 0) {
          let curConverse = conversationList.filter((item) => item.targetId == id)[0] || {};
          let targetId = `group_${id}`;
          console.log('会话列表中包含新群吗', id, curConverse);
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
              let lastContent = CalcLastCentent(messageType, content);

              let userItem = {
                id: targetId,
                displayName,
                avatar,
                index: '[2]群聊',
                unread: curConverse.unreadMessageCount,
                lastSendTime: sentTime,
                lastContent,
                isGroup: true,
                isNew: true, // for render lastContent
              };

              this.currentOrgUsers.push(userItem);
              this.$refs.imMainDom.refreshContact(this.currentOrgUsers);
            }
          });
        } else {
          console.log('获取会话列表失败: ', error.code, error.msg);
        }
      });
    },
    // 仅当发送消息时指定 canIncludeExpansion 值为 true，才可对消息进行拓展
    handleSendMessage(item) {
      // TODO 如果当前用户已被移除群聊 消息发不出去
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
                  console.log('群聊-发起已读回执请求成功', res.code, res.data);
                } else {
                  console.log('群聊-发起已读回执请求失败', res.code, res.msg);
                }
              })
              .catch((error) => {
                console.log(error);
              });
        } else {
          console.log('消息发送失败：', code);
          fun({ status: 'failed' });
        }
      });
    },
    handleOpenedDialog() {
      this.saveMessageList.forEach((res) => {
        this.$refs.imMainDom.appendMessage(res);
      });
      this.saveMessageList = [];
      this.hasUnread = false;
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
              let otheruser = { id: targetId, displayName, avatar }; // 给单聊用的
              console.log('融云历史记录', targetId, list);
              this.$refs.imMainDom.pullHistory(list, hasMore, args.next, otheruser);
              let msg_uids = list.map(({ messageUId }) => messageUId);
              this.handleChangeConcat(targetId, msg_uids);
            } else {
              args.next([], true);
              this.$Message.error('获取聊天记录失败，请刷新重试');
            }
          })
          .catch((error) => {
            console.log('获取聊天记录失败', error.code, error.msg);
          });
    },
    // 从聊天界面点击关闭会话
    handleClose() {
      this.showList = false;
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
          this.allGroupsList = list.map((item) => {
            let userItem = {
              id: item.id,
              displayName: item.name,
              avatar: item.avatar,
              index: '[2]群聊',
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
              index: '[1]好友',
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

    // 删除会话
    deleteConnect(conversationType, contactId) {
      let targetId = CalcTargetId(contactId);
      RongIMLib.removeConversation({
        conversationType, // 1个人 3群聊
        targetId,
      }).then((res) => {
        if (res.code === 0) {
          console.log('删除会话', conversationType, targetId);
        } else {
          console.log(res.code, res.msg);
        }
      });
    },
    // 删除会话中某一条消息
    deleteConnectMessage(conversationType, targetId, messageUId, sentTime) {
      const conversation = {
        conversationType,
        targetId, // "<目标用户ID>"
      };
      RongIMLib.deleteMessages(conversation, [
        {
          messageUId, // : "BS4O-P5AO-D1O6-9GPP"
          sentTime, // 1632728405345
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
.tipDom {
  position: fixed;
  bottom: 50px;
  right: -82px;
  height: 46px;
  width: 116px;
  box-sizing: content-box;
  transition: transform 0.5s;

  padding: 0 7px;
  display: flex;
  align-items: center;
  // box-shadow: 0 2px 4px rgba(#0c135f, 0.5);
  border-radius: 55px;
  font-size: 14px;
  cursor: pointer;
  z-index: 101;

  &:hover {
    // transform: scale(1.1);
    transform: translateX(-66%);
  }

  .avatar-box {
    width: 38px;
    height: 38px;
    position: relative;
    .red-dot {
      position: absolute;
      top: 0px;
      right: 0px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      overflow: hidden;
      background-color: red;
    }
  }
  .nickname-box {
    padding-left: 6px;
    width: 78px;
    line-height: 30px;
    height: 30px;
    box-sizing: border-box;
  }
}
.light-color {
  background-color: #e2ecf7;
  border: 3px solid #b2d2f3;
  color: #333;
}
.deep-color {
  background-color: #2a339b;
  // border: 3px solid #4050a3;
  border: 3px solid #4b7af6;
  color: #fff;
}
// 消息闪烁效果
.animImage {
  animation-name: imageAnim;
  animation-duration: 0.5s;
  animation-iteration-count: 3;
  animation-direction: alternate;
  animation-timing-function: ease;
  animation-play-state: running;
  /* Safari 和 Chrome */
  -webkit-animation-name: imageAnim;
  -webkit-animation-duration: 0.5s;
  -webkit-animation-iteration-count: 3;
  -webkit-animation-direction: alternate;
  -webkit-animation-timing-function: ease;
  -webkit-animation-play-state: running;
}

@keyframes imageAnim {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@-webkit-keyframes imageAnim {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.notice-border {
  border-color: #09a4f9;
}
.imDialog {
  .el-dialog {
    width: 800px;
  }
  /deep/.el-dialog__header {
    padding: 0;
  }
  /deep/.el-dialog__body {
    padding: 0;
  }
  /deep/.el-dialog--center .el-dialog__footer {
    padding: 0;
  }
}
// .imModal /deep/ .ivu-modal-content-drag .ivu-modal-body {
//   padding: 0;
// }

.close-line {
  z-index: 11;
  position: absolute;
  top: 0;
  right: 0;
  padding: 2px 0;
  width: 30px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #fff;
    background-color: rgb(250, 97, 97);
  }
  .icon-guanbi1 {
    font-size: 12px;
  }
}
</style>
