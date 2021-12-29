<template>
  <div>
    <div class="tipDom" v-if="!showList && showComponent" @click="showList = !showList">
      <Avatar :size="38" fit="cover" src="https://i.loli.net/2017/08/21/599a521472424.jpg"></Avatar>
      &nbsp;&nbsp;
      <span>我的IM</span>
    </div>
    <!-- :destroy-on-close="true" -->
    <el-dialog
      class="imDialog"
      :visible.sync="showList"
      :show-close="false"
      @opened="handleOpenedDialog"
      center
    >
      <div class="close-line" @click="handleClose">
        <i class="iconfont icon-guanbi1" title="关闭"></i>
      </div>
      <im-main
        ref="imMainDom"
        :menuList="menuList"
        :messageList="messageList"
        :currentUser="currentUser"
        :firstConversationId="firstConversationId"
        :currentOrgUsers="currentOrgUsers"
        :orgUserList="orgUserList"
        @handleSendMessage="handleSendMessage"
        @handlePullMessages="handlePullMessages"
        @changeMenuMessage="getConnetList"
        @closeModal="handleClose"
      ></im-main>
      <span slot="footer" class="dialog-footer"> </span>
    </el-dialog>
    <!-- <div v-if="showList" style="width: 40%">
      <im-main ref="imMainDom" :messageList = "messageList" :currentUser = 'currentUser' @handleSendMessage="handleSendMessage" 
      @handlePullMessages='handlePullMessages'
      :firstConversationId='firstConversationId'
      @changeMenuMessage='getConnetList'></im-main>
    </div> -->
  </div>
</template>

<script>
import 'element-ui/lib/theme-chalk/index.css';
import imMain from './im-main';
import { Avatar, Dialog, Message } from 'element-ui';
import * as RongIMLib from '@rongcloud/imlib-next';
import {
  registerUser,
  getCurrentUser,
  getTargetInfoById,
  groupInfos,
  getUserByOrgid,
} from '@/api/data.js';
import { setBackExpansion } from '@/api/chat.js';
import bus from '@/libs/bus';
import { CalcTargetId } from '@/libs/tools';
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

const Type_Key_Obj = {
  'RC:ReferenceMsg': { type: 'text', key: 'content' },
  'RC:ImgMsg': { type: 'image', key: 'imageUri' },
  'RC:TxtMsg': { type: 'text', key: 'content' },
  'RC:VcMsg': { type: 'text', key: null, content: '视频通话' },
  'RC:InfoNtf': { type: 'event', key: 'message' },
  'RC:FileMsg': { type: 'file', key: 'name' },
};
const Default_Content = { type: 'text', key: null, content: '未知消息' };

export default {
  name: 'yimuIm',
  data() {
    return {
      historyDate: +new Date(),
      concatId: null,
      showList: false,
      im: undefined,
      user_token: '',
      user_id: '',
      messageList: [], // 目前来看这个数组没有用到
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
        // { name: 'createGroup', isBottom: true },
      ],
      menuList: [
        { name: 'messages', isBottom: false },
        { name: 'contacts', isBottom: false },
        // { name: 'createGroup', isBottom: true },
      ],
      loadStep: 0,
      conversationObj: {},
      orgUserList: [], // 创建待办 负责人下拉列表
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
  },
  components: {
    Avatar,
    imMain,
    elDialog: Dialog,
    Message,
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
      if (step === 2) {
        this.messageList = Object.values(this.conversationObj);
        console.log('消息列表', this.messageList);
        this.getCurrentOrgUsers();
      }
    },
  },
  mounted() {
    this.getCurrentChatUser();
    this.im = RongIMLib.init({ appkey: 'cpj2xarlctfmn', connectType: 'comet' });
    this.imWatcher();

    this.connectRongyun();

    bus.$on('createGroupOk', (id) => {
      this.$refs.imMainDom.createPop = false;
      setTimeout(() => {
        // 获取会话列表
        this.getNewConnectList(id);
      }, 500);
    });

    bus.$on('setExpansion', this.setRongExpansion);
    bus.$on('afterQuitGroup', (conversationType, targetId) => {
      this.deleteConnect(conversationType, targetId);
    });
  },
  beforeDestroy() {
    bus.$off('createGroupOk');
    bus.$off('setExpansion');
    bus.$off('afterQuitGroup');
  },
  methods: {
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
        console.log('新接收到的消息内容', messages);
        if (messages && messages.length > 0) {
          that.handleReceiveMessage(messages);
        }
      });
      // 监听消息扩展通知
      RongIMLib.addEventListener(RongIMLib.Events.EXPANSION, (evt) => {
        console.log('监听消息扩展通知');
        console.log(evt);
      });
    },
    setRongExpansion(expansion, message, operate, cb) {
      console.log('setRongExpansion', message);
      let messageType = '';
      switch (message.type) {
        case 'text':
          if (message.referMsg && message.referMsgUserId) {
            messageType = 'RC:ReferenceMsg';
          } else {
            messageType = 'RC:TxtMsg';
          }
          break;
        case 'image':
          messageType = 'RC:ImgMsg';
          break;
        case 'file':
          messageType = 'RC:FileMsg';
      }

      let RongMsg = {
        canIncludeExpansion: true,
        messageUId: message.id,
        senderUserId: message.fromUser ? message.fromUser.id : '',
        targetId: message.toContactId,
        messageType,
      };

      RongIMLib.updateMessageExpansion(expansion, RongMsg).then((res) => {
        cb && cb(res);
        if (res.code === 0 && this.$refs.imMainDom) {
          let newExpansion = { ...message.expansion, ...expansion };
          this.$refs.imMainDom.updateExpansion(newExpansion, message);

          // 为了统计数据 调接口通知IM后端 所设置扩展的情况
          if (this.fromSystem === 'cs') {
            console.log('通知IM后端扩展的情况', this.fromSystem, message.id, expansion, operate);
            setBackExpansion(this.fromSystem, message.id, expansion, operate)
              .then((res) => {
                if (res.status === 200) {
                  console.log('通知后端扩展OK', res);
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
    // 融云消息类型 处理成lemon-ui的格式 并插入
    handleReceiveMessage(messages) {
      console.log('接收到的融云推送', messages);
      messages.forEach((item) => {
        // targetId: "12" conversationType: 3
        let userinfo = item.content.user || {};
        let messageData = {
          id: item.messageUId,
          status: 'succeed',
          sendTime: item.sentTime,
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
                avatar: userinfo.portrait || 'https://im.shandian8.com/public/notify.png',
              },
            };
        }

        !this.showList &&
          ['text', 'image'].includes(messageData.type) &&
          Message({
            // message: `${item.content.user.name}给您发了条消息`,
            message: '收到新消息',
            center: true,
            offset: 1000,
          });
        if (this.$refs.imMainDom) {
          this.$refs.imMainDom.appendMessage(messageData);
        } else if (messageData.id) {
          this.saveMessageList.push(messageData);
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
              } else {
                console.warn('链接失败, code:', res.code);
              }
            });
          } else {
            Message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getConnetList() {
      // 获取会话列表
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

            const { groupList, singleList, noticeList } = this.classifyConnectList(
              conversationList
            );
            this.$nextTick(() => {
              this.handleConnectList(groupList, singleList, noticeList);
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
      this.conversationObj = {};
      conversationList.forEach((it) => {
        this.conversationObj[it.targetId] = it;
      });
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
    handleConnectList(groupList, singleList, noticeList) {
      let groupIds = groupList.map(({ targetId }) => CalcTargetId(targetId)).join();
      let singleIds = singleList.map(({ targetId }) => targetId).join();
      this.loadStep = 0;

      // 群组会话
      groupInfos(groupIds).then((res) => {
        if (res.status === 200) {
          let infos = res.data.data;
          Object.entries(infos).forEach(([id, { content, avatar }]) => {
            let userItem = {
              ...this.conversationObj[`group_${id}`],
              displayName: content || '选题群组',
              avatar,
            };
            this.conversationObj[`group_${id}`] = this.handleChatInfo(userItem, true);
          });
        } else {
          Message.error(res.data.msg);
        }
        this.loadStep += 1;
      });

      // 个人会话
      getTargetInfoById(singleIds)
        .then((res) => {
          if (res.status === 200) {
            let list = res.data.data;
            list.forEach(({ id, nickname, avatar }) => {
              let userItem = {
                ...this.conversationObj[id],
                displayName: nickname || '未知用户',
                avatar: avatar || 'https://im.shandian8.com/public/shenhe.png',
              };
              this.conversationObj[id] = this.handleChatInfo(userItem, false);
            });
          }
          this.loadStep += 1;
        })
        .catch((err) => {
          console.log(err);
        });

      // 通知消息
      noticeList.forEach((item) => {
        this.conversationObj[item.targetId] = this.handleNoticeInfo(item);
      });
    },
    handleChatInfo(item, isGroup = false) {
      let userItem = {
        id: item.targetId,
        // id: isGroup ? `group_${item.targetId}` : item.targetId,
        displayName: item.displayName,
        avatar: item.avatar,
        index: isGroup ? '[1]群聊' : '[2]好友',
        unread: item.unreadMessageCount,
        lastSendTime: item.latestMessage ? item.latestMessage.sentTime : item.lastSendTime,
        lastContent: {},
        isGroup,
      };
      let { messageType, content } = item.latestMessage || {};
      let obj = Type_Key_Obj[messageType] || Default_Content;
      userItem.lastContent = {
        type: obj.type,
        content: obj.key ? content[obj.key] : obj.content,
      };

      return userItem;
    },
    handleNoticeInfo(item) {
      // 通知
      if (item.targetId === '-1') {
        item.displayName = '系统审核';
        item.avatar = 'https://im.shandian8.com/public/shenhe.png';
      } else if (item.targetId === '-2') {
        item.displayName = '通知提醒';
        item.avatar = 'https://im.shandian8.com/public/notify.png';
      } else if (item.targetId === '-3') {
        item.displayName = '内容监控';
        item.avatar = 'https://im.shandian8.com/public/shenhe.png';
      }
      let userItem = {
        id: item.targetId,
        displayName: item.displayName,
        avatar: item.avatar,
        index: '[2]好友',
        unread: item.unreadMessageCount,
        lastSendTime: item.latestMessage.sentTime,
        lastContent: { type: 'text', content: item.latestMessage.content.content },
      };

      return userItem;
    },
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
            console.log('current_user', user);
            bus.$emit('setUserInfo', user);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 创建群组之后 获取会话列表
    getNewConnectList(id) {
      RongIMLib.getConversationList().then(({ code, data: conversationList }) => {
        if (code === 0) {
          console.log('创建群组之后 获取会话列表', conversationList);
          let curConverse = conversationList.filter((item) => item.targetId == id)[0] || null;
          let targetId = `group_${id}`;
          groupInfos(targetId).then((res) => {
            if (res.status === 200) {
              const { content: displayName, avatar } = res.data.data[id];
              let { messageType, content, sentTime } = curConverse.latestMessage;
              let obj = Type_Key_Obj[messageType] || Default_Content;
              let userItem = {
                id: targetId,
                displayName,
                avatar,
                index: '[1]群聊',
                unread: curConverse.unreadMessageCount,
                lastSendTime: sentTime,
                lastContent: {
                  type: obj.type,
                  content: obj.key ? content[obj.key] : obj.content,
                },
                isGroup: true,
              };

              this.currentOrgUsers.push(userItem);
              this.$refs.imMain.refreshContact(this.currentOrgUsers);
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
        fun,
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
          objName: RongIMLib.MessageType.TEXT,
        });
      } else if (conversation_type === 'RC:TxtMsg') {
        message = new RongIMLib.TextMessage(content);
      } else if (conversation_type === 'RC:ImgMsg') {
        // Base64改为线上链接url
        message = new RongIMLib.ImageMessage({
          content: content.content || '', // 图片缩略图，应为 Base64 字符串，且不可超过 80KB
          imageUri: content.imageUri || '', // 图片的远程访问地址
        });
      } else if (conversation_type === 'RC:FileMsg') {
        message = new RongIMLib.FileMessage(content);
      } else if (conversation_type === 'RC:InfoNtf') {
        // web端不会主动发送这种类型消息
      }

      const options = {
        canIncludeExpansion: true,
        expansion: { thumbedIds: [], markedIds: [], collectedIds: [] },
      };

      // 发送消息
      RongIMLib.sendMessage(conversation, message, options).then(({ code, data }) => {
        if (code === 0) {
          // messageUId: "BU0J-LFCJ-1N24-01LT"
          console.log('消息发送成功：', data);
          fun(data, item);
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
    },
    handlePullMessages(args) {
      let { id, isGroup, displayName, avatar } = args.contact;
      let targetId = CalcTargetId(id);
      // 首次进入聊天
      !this.concatId && (this.concatId = id);
      // 聊天对象被切换了
      if (this.concatId !== id) {
        this.historyDate = +new Date();
        this.concatId = id;
      }

      const conversation = {
        targetId, // 原本id 现在group_id
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

              let otheruser = { id: targetId, displayName, avatar };
              this.$refs.imMainDom.pullHistore(list, hasMore, args.next, otheruser);
            }
          })
          .catch((error) => {
            console.log('获取历史消息失败', error.code, error.msg);
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
    //获取当前机构用户
    getCurrentOrgUsers() {
      getUserByOrgid(this.currentUser.orgid)
        .then((res) => {
          if (res.status !== 200) {
            Message.error(res.data.msg);
            return;
          }

          let userList = res.data.data;
          this.orgUserList = userList.map(({ id, name }) => ({ id, name }));
          let curOrgUsers = userList.map((item) => {
            let userItem = {
              id: item.id,
              displayName: item.name,
              avatar: item.avatar,
              index: '[2]好友',
              unread: 0,
              lastSendTime: '',
              lastContent: '',
            };
            // 会话列表-个人

            let curMsg = this.messageList.filter(({ id }) => id == userItem.id);
            if (curMsg && curMsg.length > 0) {
              const { unread, lastSendTime, lastContent } = curMsg[0];
              userItem = { ...userItem, unread, lastSendTime, lastContent };
            }

            return userItem;
          });

          this.messageList.forEach((item) => {
            // 会话列表-通知
            item.id < 0 && curOrgUsers.unshift(item);
            // 会话列表-群组
            item.isGroup && curOrgUsers.unshift(item);
          });

          this.showComponent = true;
          // 目前不是本机构的渲染不出来 不知道如何过滤掉
          this.currentOrgUsers = curOrgUsers;
          // console.log('当前机构用户==currentOrgUsers', this.currentOrgUsers);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 删除会话
    deleteConnect(conversationType, targetId) {
      RongIMLib.removeConversation({
        conversationType, // 1个人 3群聊
        targetId,
      }).then((res) => {
        if (res.code === 0) {
          console.log('删除会话成功', conversationType, targetId);

          let delId = Number(conversationType) === 3 ? `group_${targetId}` : targetId;
          this.currentOrgUsers = this.currentOrgUsers.filter(({ id }) => id !== delId);

          this.$refs.imMainDom.closeRightDrawer();
          this.$refs.imMainDom.refreshContact(this.currentOrgUsers);
        } else {
          console.log(res.code, res.msg);
        }
      });
    },
    // 删除会话中某一条消息
    deleteConnectMessage(targetId, messageUId, sentTime) {
      const conversation = {
        conversationType: RongIMLib.ConversationType.PRIVATE,
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
  bottom: 0px;
  right: 0px;
  height: 55px;
  width: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-size: 14px;
  cursor: pointer;
  &:hover {
    // animation: shake 800ms ease-in-out;
    transform: scale(1.1);
  }
}
@keyframes shake {
  /* 水平抖动，核心代码 */
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(+2px, 0, 0);
  }
  30%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(+4px, 0, 0);
  }
  50% {
    transform: translate3d(-4px, 0, 0);
  }
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
