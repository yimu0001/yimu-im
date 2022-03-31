<template>
  <div>
    <lemon-imui
      :user="user"
      ref="IMUI"
      :contextmenu="contextmenu"
      :contact-contextmenu="contactContextmenu"
      :theme="theme"
      :hide-menu="hideMenu"
      :hide-menu-avatar="hideMenuAvatar"
      :hide-message-name="hideMessageName"
      :hide-message-time="hideMessageTime"
      :sendKey="beforeSend"
      @change-menu="handleChangeMenu"
      @change-contact="handleChangeContact"
      @pull-messages="handlePullMessages"
      @message-click="handleMessageClick"
      @menu-avatar-click="handleMenuAvatarClick"
      @send="handleSend"
      width="100%"
    >
      <template #cover>
        <div>
          <div class="im-cover-box">
            <i class="lemon-icon-message center-icon"></i>
            <p class="center-welcome">你好，欢迎进入闪电云聊天系统</p>
          </div>
        </div>
      </template>
      <!-- 消息筛选 添加群组 -->
      <template #sidebar-message-fixedtop>
        <div class="search-line">
          <Input
            class="search-inp"
            placeholder="请输入姓名或群名称"
            search
            clearable
            @on-focus="handleSearchClick"
          />
          <i class="iconfont icon-tianjia" title="添加" @click="handleCreateGroup"></i>
        </div>
      </template>
      <!-- 用户群组筛选 -->
      <template #sidebar-contact-fixedtop>
        <div class="search-line">
          <Input
            ref="userSearchRef"
            class="search-inp"
            v-model="mailKeyword"
            placeholder="请输入姓名或群名称"
            search
            clearable
          />
          <i class="iconfont icon-tianjia" title="添加" @click="handleCreateGroup"></i>
        </div>
      </template>
      <template #message-title="contact">
        <p class="cur-user">{{ contact.displayName }}</p>
        <small
          v-if="contact.id != 'admin'"
          class="more-setting"
          @click="openRightTool(contact, $refs.IMUI)"
        >
          <i class="iconfont icon-gengduo" title="更多"></i>
        </small>
        <div v-if="drawerVisibleShow" class="right-toolbar-column">
          <!-- this.targetUser -->
          <groupTools
            :contact="targetUser"
            :parentInstance="$refs.IMUI"
            @openHistory="handleOpenHistory"
          />
        </div>
        <br />
      </template>
      <template #editor-footer>
        <div class="bottom-line">
          <div class="reply-box" v-if="replyObj.type">
            <Tag title="回复内容" closable @on-close="cancelReply">
              <div v-if="replyObj.type === 'text'" class="rep-text">
                {{ replyObj.fromUser.displayName }}：{{ replyObj.content }}
              </div>
              <div v-if="replyObj.type === 'image'" class="rep-text">
                {{ replyObj.fromUser.displayName }}：[图片]
              </div>
              <div v-if="replyObj.type === 'file'" class="rep-text">
                {{ replyObj.fromUser.displayName }}：<i class="lemon-icon-attah" />{{
                  replyObj.fileName
                }}
              </div>
            </Tag>
          </div>
          <p class="tips">使用 enter 快捷发送消息</p>
        </div>
      </template>
    </lemon-imui>

    <Modal title="图片预览" v-model="outerVisible" :z-index="2003" width="600" transfer footer-hide>
      <!-- <el-image :src="imgUrl" :preview-src-list="srcList" title="查看大图"> </el-image> -->
      <img class="pre-modal-img" :src="imgUrl" alt="图片" />
    </Modal>

    <Modal title="创建待办" v-model="pendingPop" :z-index="2002" width="600" transfer footer-hide>
      <!-- :orgUserList="orgUserList" -->
      <add-pending
        v-if="pendingPop"
        :msgInfo="curPendingItem"
        :pendGroupId="pendGroupId"
        :directorList="directorList"
        @close="handleClosePending"
      />
    </Modal>
    <Modal title="已读详情" v-model="readingPop" :z-index="2002" width="600" transfer footer-hide>
      <reading-show
        v-if="readingPop"
        :readingContactId="readingContactId"
        :readingMsgId="readingMsgId"
        @close="handleCloseReading"
      />
    </Modal>
    <Modal title="创建群组" v-model="createPop" :z-index="2002" width="800" transfer footer-hide>
      <addGroup v-if="createPop" />
    </Modal>
    <Modal
      title="查看上下文"
      v-model="historyPop"
      :z-index="2002"
      width="600"
      transfer
      footer-hide
      :mask="false"
    >
      <history-record v-if="historyPop" :contact="historyItem" />
    </Modal>
    <textarea id="input_copy"></textarea>
  </div>
</template>

<script>
import AddGroup from './AddGroup.vue';
import CreateGroup from './CreateGroup';
import groupTools from './GroupTools/tools';
import HistoryRecord from './GroupTools/history';
import addPending from './message/addPending.vue';
import readingShow from './message/readingShow.vue';
import LemonIMUI from 'lemon-imui';
import LemonPopover from 'lemon-imui';
import 'lemon-imui/dist/index.css';

import { Image } from 'element-ui';
import { uploadFile } from '@/api/data';
import bus from '@/libs/bus';
import { reverseArray, CalcTargetId } from '@/libs/tools';

export default {
  name: 'imMain',
  props: {
    currentUser: {
      type: Object,
      default: () => {},
    },
    menuList: {
      type: Array,
      default: () => [],
    },
    firstConversationId: String || undefined,
    currentOrgUsers: {
      type: Array,
      default: () => [],
    },
    orgUserList: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    AddGroup,
    CreateGroup,
    elImage: Image,
    groupTools,
    'history-record': HistoryRecord,
    addPending,
    readingShow,
    LemonIMUI,
    LemonPopover,
  },
  data() {
    return {
      contextmenu: [
        // {
        //   visible: (instance) => {
        //     return instance.message.fromUser.id != this.user.id;
        //   },
        //   text: '举报',
        // },
        // {
        //   text: '转发',
        // },
        // {
        //   visible: (instance) => {
        //     return instance.message.type == 'text';
        //   },
        //   text: '复制文字',
        //   click: this.onTextCopy,
        // },
        // {
        //   visible: (instance) => {
        //     return instance.message.type == 'image';
        //   },
        //   text: '下载图片',
        //   click: (e, instance, hide) => {
        //     const { message } = instance;
        //     window.open(message.content);
        //     hide();
        //   },
        // },
        {
          visible: (instance) => {
            return instance.message.type == 'file';
          },
          text: '下载文件',
          click: (e, instance, hide) => {
            const { message } = instance;
            window.open(message.content);
            hide();
          },
        },
        // {
        //   click: (e, instance, hide) => {
        //     const { IMUI, message } = instance;
        //     IMUI.removeMessage(message.id);
        //     hide();
        //   },
        //   icon: 'lemon-icon-folder',
        //   color: 'red',
        //   text: '删除',
        // },
      ],
      contactContextmenu: [
        {
          text: '删除该聊天',
          click: (e, instance, hide) => {
            const { IMUI, contact } = instance;
            IMUI.updateContact({
              id: contact.id,
              lastContent: null,
            });
            if (IMUI.currentContactId == contact.id) {
              IMUI.changeContact(null);
            }
            this.$emit('delete-contact', contact.isGroup ? 3 : 1, contact.id);
            console.log('删除该聊天', contact);
            hide();
          },
        },
        // {
        //   text: '设置备注和标签',
        // },

        // {
        //   click(e, instance, hide) {
        //     const { IMUI, contact } = instance;
        //     IMUI.removeContact(contact.id);
        //     if (IMUI.currentContactId == contact.id) IMUI.changeContact(null);
        //     hide();
        //   },
        //   color: 'red',
        //   text: '删除好友',
        // },
      ],
      theme: 'default',
      hideMenuAvatar: false,
      hideMenu: false,
      hideMessageName: false,
      hideMessageTime: true,
      user: {
        id: this.currentUser.id || 1,
        displayName: this.currentUser.nickname || '',
        orgid: this.currentUser.orgid || '',
        avatar: this.currentUser.avatar,
      },
      targetUser: {},
      //右侧抽屉
      drawerVisibleShow: false,
      // 新增组
      addGroupOpen: false,
      outerVisible: false,
      imgUrl: undefined,
      srcList: undefined,
      replyObj: {}, // id: '', type: '', content: '', displayText: ''
      mailKeyword: '',
      pendingPop: false,
      readingPop: false,
      readingContactId: null,
      readingMsgId: null,
      curPendingItem: {},
      createPop: false,
      historyPop: false,
      historyItem: {},
      directorList: [],
      pendGroupId: '',
      noticeCount: 0, // 当前会话内的最新n条消息 通知发送方已读
      accepts: ['doc', 'docx', 'pdf', 'jpg', 'png'], // 允许上传的文件格式
    };
  },
  watch: {
    currentUser(newValue, oldValue) {
      this.user = {
        id: newValue.id || 1,
        displayName: newValue.nickname || '',
        orgid: newValue.orgid || '',
        avatar: this.currentUser.avatar,
      };
    },
    menuList: {
      handler(list) {
        if (list && list.length > 0) {
          this.$nextTick(() => {
            this.handleMenu();
          });
        }
      },
    },
    mailKeyword(key) {
      const { IMUI } = this.$refs;
      let currentOrgUsers = this.currentOrgUsers;

      if (!key) {
        IMUI.initContacts(currentOrgUsers);
      } else {
        let newUsers = currentOrgUsers.filter((item) => item.displayName.includes(key));
        IMUI.initContacts(newUsers);
      }
    },
  },
  mounted() {
    this.setCurrentOrgUsers();
    this.handleRender();
    this.handleMenu();

    bus.$on('reply', (data) => {
      this.replyObj = data;
    });
    bus.$on('openPending', (obj) => {
      let contactObj = this.$refs.IMUI.getCurrentContact();
      this.directorList = [];
      if (contactObj.isGroup) {
        this.pendGroupId = contactObj.id;
      } else {
        this.directorList = [
          { id: contactObj.id, nickname: contactObj.displayName },
          { id: this.currentUser.id, nickname: this.currentUser.nickname },
        ];
      }
      this.curPendingItem = { ...obj, isGroup: !!contactObj.isGroup };
      this.pendingPop = true;
    });
    bus.$on('openReading', (contactId, id) => {
      this.readingPop = true;
      this.readingContactId = CalcTargetId(contactId);
      this.readingMsgId = id;
    });

    bus.$on('previewReplyImg', (url) => {
      this.imgUrl = url;
      this.srcList = [url];
      this.outerVisible = true;
    });
  },
  beforeDestroy() {
    bus.$off('reply');
    bus.$off('openPending');
    bus.$off('openReading');
    bus.$off('previewReplyImg');
  },
  methods: {
    onTextCopy(e, instance, hide) {
      const { message } = instance;
      var input = document.getElementById('input_copy');
      input.value = message.content; // 修改文本框的内容
      input.select(); // 选中文本
      document.execCommand('copy'); // 执行浏览器复制命令
      hide();
    },
    handleClosePending() {
      this.pendingPop = false;
      this.pendGroupId = '';
      this.directorList = [];
      this.curPendingItem = {};
    },
    handleCloseReading() {
      this.readingPop = false;
      this.readingContactId = null;
      this.readingMsgId = null;
    },
    handleCreateGroup() {
      this.createPop = true;
    },
    // 处理会话列表消息渲染
    handleRender() {
      const { IMUI } = this.$refs;
      // IMUI.initEmoji(EmojiData);
      IMUI.setLastContentRender('text', (message) => {
        // 特殊字符 替换
        let content = message.content
          ? message.content
              .replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '')
              .replace(/<[^>]*>/g, '')
              .replace(/&lt;[^&gt;]*&gt;/g, '')
              .replace(/<[^>]+?>/g, '')
              .replace(/\s+/g, ' ')
              .replace(/ /g, ' ')
              .replace(/</g, ' ')
              .replace(/>/g, ' ')
          : '';
        return <span>{content}</span>;
        // return <span>{JSON.stringify(message.content)}</span>;
      });
      IMUI.setLastContentRender('image', (message) => {
        return <span>[图片]</span>;
      });
      IMUI.setLastContentRender('event', (message) => {
        return message.content;
      });
      IMUI.setLastContentRender('file', (message) => {
        return <span>[文件]</span>;
      });
    },
    //处理菜单
    handleMenu() {
      const { IMUI } = this.$refs;
      let menus = [];
      this.menuList.forEach((menuItem, menuIndex) => {
        if (menuItem.name === 'messages') {
          menus.push({ name: 'messages' });
        } else if (menuItem.name === 'contacts') {
          menus.push({ name: 'contacts' });
        }
        // else if (menuItem.name === 'createGroup') {
        //   menus.push({
        //     name: 'createGroup',
        //     title: '添加群组',
        //     unread: 0,
        //     renderContainer: () => {
        //       return <addGroup />;
        //     },
        //     render: (menu) => {
        //       return <i class='lemon-icon-group' />;
        //     },
        //     isBottom: true,
        //   });
        // }
        else {
          class VNode {
            constructor(tag, data, value, type) {
              this.tag = tag && tag.toLowerCase();
              this.data = data;
              this.value = value;
              this.type = type;
              this.children = [];
            }
            appendChildren(value) {
              this.children.push(value);
            }
          }
          menus.push({
            name: menuItem.name,
            isBottom: menuItem.isBottom,
            title: menuItem.title,
            unread: menuItem.unread,
            renderContainer: () => {
              let menuItemKey = menuItem.component;
              return <menuItemKey></menuItemKey>;
            },
            render: (menu) => {
              return <i class={menuItem.iconClass}></i>;
            },
          });
        }
      });

      IMUI.initMenus(menus);

      IMUI.initEditorTools([
        // {
        //   name: 'emoji',
        // },
        {
          name: 'uploadFile',
        },
        {
          name: 'uploadImage',
        },
        // {
        //   name: 'test1',
        //   click: () => {
        //     IMUI.$refs.editor.selectFile('application/vnd.ms-excel');
        //   },
        //   render: () => {
        //     return <span>Excel</span>;
        //   },
        // },
      ]);
    },
    closeRightDrawer() {
      if (this.drawerVisibleShow) {
        this.$refs.IMUI.closeDrawer();
        this.drawerVisibleShow = false;
      }
    },
    // enter发送消息  ctrl+enter换行
    beforeSend(e) {
      const IMUI = this.$refs.IMUI;

      if (e.keyCode == 13 && !e.ctrlKey) {
        return true;
      } else if (e.keyCode == 13 && e.ctrlKey) {
        let message = IMUI.getEditorValue();
        message = message + '\n\n';
        IMUI.setEditorValue(message);
        this.keepLastIndex(e.target);
        return false;
      }
    },
    keepLastIndex(obj) {
      if (window.getSelection) {
        obj.focus();
        var range = window.getSelection();
        range.selectAllChildren(obj);
        range.collapseToEnd();
      } else if (document.selection) {
        var range = document.selection.createRange();
        range.moveToElementText(obj);
        range.collapse(false);
        range.select();
      }
    },
    handleSearchClick() {
      this.$refs.IMUI.changeMenu('contacts');
      setTimeout(() => {
        this.$refs.userSearchRef.focus();
      }, 400);
    },
    handleChangeMenu(menuName) {
      this.closeRightDrawer();

      this.$emit('change-menu', menuName);
      // console.log('Event:change-menu', menuName);
      if (menuName === 'messages') {
        this.$refs.IMUI.initContacts(this.currentOrgUsers);
      } else if (this.mailKeyword && menuName === 'contacts') {
        let filterUsers = this.currentOrgUsers.filter((item) =>
          item.displayName.includes(this.mailKeyword)
        );
        this.$refs.IMUI.initContacts(filterUsers);
      }
    },
    clearDraft(contact, instance) {
      if (this.targetUser.id && this.targetUser.id !== contact.id) {
        let lastOne = {};
        for (var i = 0; i < this.currentOrgUsers.length; i++) {
          if (this.currentOrgUsers[i].id === this.targetUser.id) {
            lastOne = this.currentOrgUsers[i];
            break; // 终止循环
          }
        }

        if (
          lastOne.lastContent ===
          '<span style="color:red;">[草稿]</span><span>[object Object]</span>'
        ) {
          let history = instance.getMessages(this.targetUser.id);
          history = reverseArray(history);
          console.log('聊天记录', history[0]);
          lastOne.lastContent = this.getLastContent(history[0]);
          instance.updateContact({
            id: this.targetUser.id,
            lastContent: lastOne.lastContent,
          });
        }
      }
    },
    resetLastContent() {
      let history = this.$refs.IMUI.getMessages(this.targetUser.id);
      history = reverseArray(history);
      this.$refs.IMUI.updateContact({
        id: this.targetUser.id,
        lastContent: this.getLastContent(history[0]),
      });
    },
    getLastContent(message) {
      if (message.type === 'text') {
        // 特殊字符 替换
        let content = message.content
          ? message.content
              .replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '')
              .replace(/<[^>]*>/g, '')
              .replace(/&lt;[^&gt;]*&gt;/g, '')
              .replace(/<[^>]+?>/g, '')
              .replace(/\s+/g, ' ')
              .replace(/ /g, ' ')
              .replace(/</g, ' ')
              .replace(/>/g, ' ')
          : '';
        return <span>{content}</span>;
        // return <span>{message.content}</span>;
      }
      if (message.type === 'image') {
        return <span>[图片]</span>;
      }
      if (message.type === 'event') {
        return <span>[通知]</span>;
      }
      if (message.type === 'file') {
        return <span>[文件]</span>;
      }

      return <span></span>;
    },
    handleChangeContact(contact, instance) {
      this.clearDraft(contact, instance);
      this.closeRightDrawer();

      // 已读相关：防止每次调取过多的消息已读情况 每次重新获取融云接口
      if (this.targetUser.id !== contact.id) {
        this.$refs.IMUI.clearMessages(this.targetUser.id);
      }
      console.log('Event:change-contact', contact);
      // contact.unread: 3   id: "group_12"
      // this.mailKeyword && this.changeIMContact(contact);
      this.targetUser = contact;

      instance.updateContact({
        id: contact.id,
        unread: 0,
      });
      instance.closeDrawer();

      if (contact.unread > 0) {
        //  {399: Array(9), 4575: Array(20), group_12: Array(20)}
        let allLocalMessage = instance.getMessages();
        let curMessage = allLocalMessage[contact.id]; // undefined 说明是没有本地 需要 handlePullMessages
        if (curMessage) {
          this.calcReadNotice(curMessage, contact.unread);
        } else {
          this.noticeCount = contact.unread;
        }
      }
    },
    // 单聊/群聊已读回执 无时效
    calcReadNotice(list, unreadCount) {
      let newMsgs = reverseArray(list);

      if (this.targetUser.isGroup) {
        let msgInfo = {};
        newMsgs.forEach((item, index) => {
          if (index < unreadCount) {
            const { id, senderUserId, fromUser } = item;
            let sender = senderUserId || fromUser.id;
            if (!msgInfo[sender]) {
              msgInfo[sender] = [];
            }
            msgInfo[sender].push(id);
          }
        });
        if (msgInfo) {
          this.$emit('notice-group-sender', this.targetUser.id, msgInfo);
        }
        this.noticeCount = 0;
      } else {
        const { id: msgId, sendTime } = newMsgs[0];
        this.$emit('notice-single-sender', this.targetUser.id, msgId, sendTime);
        this.noticeCount = 0;
      }
    },

    handlePullMessages(contact, next, instance) {
      let args = {
        contact,
        next,
      };
      this.$emit('handlePullMessages', args);
    },
    //历史记录
    pullHistory(listInit, hasMore, next, otheruser) {
      let list = [...listInit];

      let messages = list.map((item) => {
        let fromUser = {};
        // messageDirection 消息方向： 1: 发送，2: 接收
        // 非通知类型
        if (item.messageType !== 'RC:InfoNtf') {
          if (item.messageDirection === 1) {
            // 发送方
            fromUser = this.user;
          } else if (item.messageDirection === 2) {
            // 接收方
            if (item.conversationType === 1) {
              // 单聊
              fromUser = otheruser;
            } else if (item.conversationType === 3) {
              // 群聊
              const { id, name: displayName, portrait: avatar } = item.content.user || {};
              fromUser = { id, displayName, avatar };
            }
          }
        }

        let messageItem = {
          ...item,
          id: item.messageUId,
          status: 'succeed',
          type: 'text',
          conversationType: item.conversationType,
          sendTime: item.sentTime,
          content: '',
          toContactId: item.conversationType === 3 ? `group_${item.targetId}` : item.targetId,
          fromUser,
          canIncludeExpansion: item.canIncludeExpansion || false,
          expansion: item.expansion || {},
        };
        switch (item.messageType) {
          case 'RC:ReferenceMsg':
            messageItem.type = 'text';
            const { content, objName, referMsg, referMsgUserId } = item.content;
            messageItem = { ...messageItem, content, objName, referMsg, referMsgUserId };
            break;
          case 'RC:TxtMsg':
            messageItem.type = 'text';
            messageItem.content = item.content.content;
            break;
          case 'RC:ImgMsg':
            messageItem.type = 'image';
            messageItem.content = item.content.imageUri;
            break;
          case 'RC:FileMsg':
            messageItem.type = 'file';
            messageItem.content = item.content.fileUrl;
            messageItem.fileSize = item.content.size;
            messageItem.fileName = item.content.name;
            break;
          case 'RC:InfoNtf':
            messageItem.type = 'event';
            messageItem.content = item.content.message;
            break;
        }

        return messageItem;
      });

      // console.log('处理后历史记录', messages);
      if (this.noticeCount > 0) {
        // 通知
        this.calcReadNotice(messages, this.noticeCount);
      }

      next(messages, !hasMore);
    },
    handleMessageClick(e, key, message, instance) {
      console.log('点击了消息', message);
      if (key == 'status') {
        instance.updateMessage({
          id: message.id,
          status: 'going',
          content: '正在重新发送消息...',
        });
        setTimeout(() => {
          instance.updateMessage({
            id: message.id,
            status: 'succeed',
            content: '发送成功',
          });
        }, 2000);
      }
      // 图片预览还要保证点击的不是工具栏 i标签
      if (message.type == 'image' && e.target.nodeName === 'IMG') {
        this.imgUrl = message.content;
        this.srcList = [message.content];
        this.outerVisible = true;
      } else if (message.type == 'file' && e.target.nodeName !== 'I') {
        window.open(message.content);
      }
    },
    handleMenuAvatarClick() {
      console.log('Event:menu-avatar-click');
    },

    cancelReply() {
      this.replyObj = {};
      console.log('取消引用', this.replyObj);
    },
    updateReplyMessage(data) {
      const { IMUI } = this.$refs;
      const messages = IMUI.getCurrentMessages();
      if (messages.length > 0) {
        const message = messages[messages.length - 1];
        const { referMsg, referMsgUserId } = data.content;
        if (referMsg) {
          const updateMsg = { ...data, ...message, referMsg, referMsgUserId };
          IMUI.updateMessage(updateMsg);
          IMUI.messageViewToBottom();
        }
      }
    },
    updateExpansion(expandNew, messageUId) {
      const { IMUI } = this.$refs;

      let target_id = expandNew.target_id; // 带有group_
      let isCurContact = target_id === this.targetUser.id;
      let messages = []; // 该消息扩展所属于的会话的消息记录
      if (isCurContact) {
        messages = IMUI.getCurrentMessages();
      } else {
        const allContacts = IMUI.getMessages();
        messages = allContacts[target_id] || [];
      }

      let message = messages.length > 0 ? messages.filter(({ id }) => id === messageUId)[0] : {};
      let oldExpand = JSON.parse(JSON.stringify(message.expansion || {}));
      // 如果接收到的不是当前会话 就没有message 无法修改扩展
      if (expandNew && message) {
        const updateMsg = {
          id: message.id,
          expansion: { ...oldExpand, ...expandNew },
        };

        IMUI.updateMessage(updateMsg);
      }
    },
    // 发完消息之后 处理成lemon格式 传回lemon send方法回调
    calcSendedMsg(data, item) {
      let messageItem = {
        ...data,
        id: data.messageUId,
        status: 'succeed',
        type: 'text',
        conversationType: item.isGroup ? 3 : 1,
        sendTime: data.sentTime || new Date().getTime(), //  sendTime: data.sentTime,  new Date().getTime()
        content: '',
        toContactId: item.target_id,
        fromUser: this.user,
        canIncludeExpansion: true,
        expansion: {},
      };
      switch (item.conversation_type) {
        case 'RC:ReferenceMsg':
          messageItem.type = 'text';
          const { referMsg, referMsgUserId } = item; // objName
          const { content } = item.content;
          messageItem = { ...messageItem, content, referMsg, referMsgUserId };
          break;
        case 'RC:TxtMsg':
          messageItem.type = 'text';
          messageItem.content = item.content.content;
          break;
        case 'RC:ImgMsg':
          messageItem.type = 'image';
          messageItem.content = item.content.imageUri;
          break;
        case 'RC:FileMsg':
          messageItem.type = 'file';
          messageItem.content = item.content.fileUrl;
          messageItem.fileSize = item.content.size;
          messageItem.fileName = item.content.name;
          break;
        case 'RC:InfoNtf':
          messageItem.type = 'event';
          messageItem.content = item.content.message;
          break;
      }

      return messageItem;
    },
    sendMessageCallback(data, msg, next) {
      if (data.status !== 'failed' && !!this.replyObj.type) {
        this.updateReplyMessage(data);
        this.replyObj = {};
      }
      if (data.status === 'failed') {
        console.log('信息发送失败', data);
        next({ status: 'failed' });
        return;
      }

      let message = this.calcSendedMsg(data, msg);
      message.id = data.messageUId;
      message.expansion = {
        thumbedInfo: {}, // {id: {name, type}}
        markedObj: {}, // {id: name}
        collectedIds: [],
        target_id: null, // 为了收到扩展通知的时候能够找到属于哪个会话
      };
      next(message);
    },
    checkFileAccept(name) {
      let arr = name.split('.');
      let suffix = arr[arr.length - 1];

      if (!this.accepts.includes(suffix)) {
        this.$Message.warning('请上传jpg，png，doc，docx，pdf格式文件！');
        return false;
      }

      return true;
    },
    calcUserInfo() {
      const { id, nickname, avatar } = this.currentUser;
      let user = {
        id,
        name: nickname,
        portrait: avatar,
        portraitUri: avatar,
      };

      return user;
    },
    handleSend(message, next, file) {
      let user = this.calcUserInfo();
      // 文字的最前或者最后有换行就去掉
      message.content = message.content.replace(/^\s+|\s+$/g, '');

      let rongMsg = {
        target_id: this.targetUser.id,
        isGroup: this.targetUser.isGroup ? this.targetUser.isGroup : false,
        fun: (data, msg) => {
          this.sendMessageCallback(data, msg, next);
        },
      };

      switch (message.type) {
        case 'text':
          let isReply = !!this.replyObj.type;
          // 回复消息
          if (isReply) {
            const { id, type, content, fromUser, fileName = '' } = this.replyObj;
            rongMsg = {
              ...rongMsg,
              conversation_type: 'RC:ReferenceMsg',
              content: {
                content: message.content,
                user,
              },
              referMsgUserId: fromUser.id,
              referMsg: { id, type, content, fileName, displayName: fromUser.displayName },
            };
          } else {
            rongMsg = {
              ...rongMsg,
              conversation_type: 'RC:TxtMsg',
              content: {
                content: message.content,
                user,
              },
            };
          }

          this.$emit('handleSendMessage', rongMsg);

          break;
        case 'image':
          // jpg png
          if (!this.checkFileAccept(file.name)) {
            this.$refs.IMUI.removeMessage(message.id);
            this.resetLastContent();
            return;
          }

          uploadFile(file)
            .then((res) => {
              // 还有图片现在上传结束消息那展示的是blob类型的数据，为了方便回复，建议直接加一个修改该条消息内容改成url/
              if (res.status === 200) {
                const { thumb, file } = res.data.data;
                rongMsg = {
                  ...rongMsg,
                  conversation_type: 'RC:ImgMsg',
                  content: { content: thumb, imageUri: file, user },
                };
                this.$emit('handleSendMessage', rongMsg);
              } else {
                this.$Message.error(res.data.msg);
                next({ status: 'failed' });
              }
            })
            .catch((err) => {
              console.log(err);
            });
          break;
        case 'file':
          // doc docx pdf
          let { name, size, type } = file;
          if (!this.checkFileAccept(name)) {
            this.$refs.IMUI.removeMessage(message.id);
            this.resetLastContent();
            return;
          }

          uploadFile(file)
            .then((res) => {
              if (res.status === 200) {
                rongMsg = {
                  ...rongMsg,
                  conversation_type: 'RC:FileMsg',
                  content: { name, size, type, fileUrl: res.data.data.file, user },
                };
                this.$emit('handleSendMessage', rongMsg);
              } else {
                this.$Message.error(res.data.msg);
                next({ status: 'failed' });
              }
            })
            .catch((err) => {
              console.log(err);
            });
          break;
        case 'event':
          conversation_type = 'RC:InfoNtf';
          setTimeout(() => {
            next(rongMsg);
          }, 1000);
          break;
      }
    },
    //打开右侧工具栏 contact, instance
    openRightTool() {
      this.drawerVisibleShow = !this.drawerVisibleShow;
    },

    //添加群组
    gbAddGroupOpen() {
      this.addGroupOpen = false;
      this.getContactsList();
    },

    // 接受新消息
    appendMessage(data) {
      this.$refs.IMUI.appendMessage(data, true); // Message, scrollToBottom
      // setTimeout(() => {
      //   this.$refs.IMUI.initContacts(this.currentOrgUsers);
      // }, 500);
    },
    // 设置当前机构通讯录及会话列表
    setCurrentOrgUsers() {
      let IMUI = this.$refs.IMUI;
      let currentOrgUsers = this.currentOrgUsers || [];

      currentOrgUsers.forEach((item) => {
        if (item.lastContent && item.lastSendTime) {
          item.lastContent.content = item.lastContent.content || '';
          item.lastContent = IMUI.lastContentRender(item.lastContent);
        }
      });
      IMUI.initContacts(currentOrgUsers);
      setTimeout(() => {
        this.firstConversationId && IMUI.changeContact(this.firstConversationId);
      }, 500);
    },
    // 来了新消息之后 切换到最新的会话框
    changeLastestConnect() {
      setTimeout(() => {
        if (this.firstConversationId) {
          let IMUI = this.$refs.IMUI;
          IMUI.changeContact(this.firstConversationId);
        }
      }, 500);
    },
    // 新增或删除会话 (建群、退群...)
    refreshContact(all_user) {
      let IMUI = this.$refs.IMUI;
      let users = all_user;
      users.forEach((item) => {
        if (item.isNew && item.lastContent) {
          item.lastContent = IMUI.lastContentRender(item.lastContent);
        }
      });

      IMUI.initContacts(users);
      setTimeout(() => {
        this.firstConversationId && IMUI.changeContact(this.firstConversationId);
      }, 500);
    },

    //切换联系人
    changeIMContact(contact) {
      this.$refs.IMUI.changeContact(contact.id);
    },
    handleOpenHistory(item) {
      this.historyPop = true;
      this.historyItem = item;
    },
  },
};
</script>

<style lang="less" scoped>
@import url('../assets/css/im-style.less');
</style>
