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
      :sendKey="setSendKey"
      @change-menu="handleChangeMenu"
      @change-contact="handleChangeContact"
      @pull-messages="handlePullMessages"
      @message-click="handleMessageClick"
      @menu-avatar-click="handleMenuAvatarClick"
      @send="handleSend"
      width="100%"
    >
      <template #cover>
        <div class="im-cover">
          <i class="lemon-icon-message"></i>
          <p>你好，欢迎进入闪电云聊天系统</p>
        </div>
      </template>
      <!-- 消息筛选 添加群组 -->
      <template #sidebar-message-fixedtop>
        <div class="search-line">
          <el-input
            class="search-inp"
            v-model="historyKeyword"
            size="mini"
            placeholder="请输入"
            clearable
          >
            <i slot="prefix" class="iconfont icon-sousuo"></i>
          </el-input>
          <i class="iconfont icon-tianjia" title="添加"></i>
        </div>
      </template>
      <!-- 用户群组筛选 -->
      <!-- <template #sidebar-contact-fixedtop></template> -->
      <template #message-title="contact">
        <div class="close-line" @click="closeModal">
          <i class="iconfont icon-guanbi1" title="关闭"></i>
        </div>
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
          <groupInfo :contact="targetUser" :parentInstance="$refs.IMUI" />
        </div>
        <br />
      </template>
      <template #editor-footer>
        <div class="bottom-line">
          <div class="reply-box" v-if="replyObj.type">
            <el-tag closable type="info" @close="cancelReply">
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
            </el-tag>
          </div>

          <p class="tips">使用 ctrl + enter 快捷发送消息</p>
        </div>
      </template>
    </lemon-imui>

    <el-dialog title="图片预览" :visible.sync="outerVisible" append-to-body width="600px">
      <el-image :src="imgUrl" :preview-src-list="srcList" title="查看大图"> </el-image>
    </el-dialog>

    <el-dialog title="创建待办" :visible.sync="pendingPop" append-to-body width="600px">
      <add-pending ref="pendingDom" :orgUserList="orgUserList" :msgId="curPendingItem.id" />
    </el-dialog>
  </div>
</template>

<script>
import AddGroup from './AddGroup.vue';
import CreateGroup from './CreateGroup';
import groupInfo from './GroupTools/tools';
import addPending from './message/addPending.vue';
import LemonIMUI from 'lemon-imui';
import LemonPopover from 'lemon-imui';
import 'lemon-imui/dist/index.css';

import { Dialog, Image, Message, Tag, Input } from 'element-ui';
import { uploadFile } from '@/api/data';
import bus from '@/libs/bus';

export default {
  name: 'imMain',
  props: {
    messageList: {
      type: Array,
      default: () => [],
    },
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
    elDialog: Dialog,
    elInput: Input,
    elImage: Image,
    elTag: Tag,
    Message,
    groupInfo,
    addPending,
    LemonIMUI,
    LemonPopover,
  },
  data() {
    return {
      contextmenu: [
        {
          visible: (instance) => {
            return instance.message.fromUser.id != this.user.id;
          },
          text: '举报',
        },
        {
          text: '转发',
        },
        {
          visible: (instance) => {
            return instance.message.type == 'text';
          },
          text: '复制文字',
        },
        {
          visible: (instance) => {
            return instance.message.type == 'image';
          },
          text: '下载图片',
        },
        {
          visible: (instance) => {
            return instance.message.type == 'file';
          },
          text: '下载文件',
        },
        {
          click: (e, instance, hide) => {
            const { IMUI, message } = instance;
            IMUI.removeMessage(message.id);
            hide();
          },
          icon: 'lemon-icon-folder',
          color: 'red',
          text: '删除',
        },
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
            if (IMUI.currentContactId == contact.id) IMUI.changeContact(null);
            hide();
          },
        },
        {
          text: '设置备注和标签',
        },

        {
          click(e, instance, hide) {
            const { IMUI, contact } = instance;
            IMUI.removeContact(contact.id);
            if (IMUI.currentContactId == contact.id) IMUI.changeContact(null);
            hide();
          },
          color: 'red',
          text: '删除好友',
        },
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
      show_message_list: this.messageList,
      targetUser: {},
      //右侧抽屉
      drawerVisibleShow: false,
      // 新增组
      addGroupOpen: false,
      outerVisible: false,
      imgUrl: undefined,
      srcList: undefined,

      //联系人列表
      all_users: [],
      replyObj: {}, // id: '', type: '', content: '', displayText: ''
      historyKeyword: '',
      pendingPop: false,
      curPendingItem: {},
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
    messageList(newValue, oldValue) {
      console.log('数据变化', newValue, oldValue);
      this.show_message_list = newValue;
      this.getCurrentOrgUsers();
    },
    menuList: {
      handler(list) {
        if (list && list.length > 0) {
          this.$nextTick(() => {
            this.handleMenu();
          });
        }
      },
      // immediate: true,
    },
  },
  mounted() {
    this.getCurrentOrgUsers();
    this.handleMenu();
    bus.$on('reply', (data) => {
      this.replyObj = data;
    });
    bus.$on('openPending', (obj) => {
      this.curPendingItem = obj;
      this.pendingPop = true;
    });

    bus.$on('previewImg', (url) => {
      this.imgUrl = url;
      this.srcList = [url];
      this.outerVisible = true;
    });
  },
  methods: {
    handleMenu() {
      //处理菜单
      const { IMUI } = this.$refs;
      let menus = [];
      this.menuList.forEach((menuItem, menuIndex) => {
        if (menuItem.name === 'messages') {
          menus.push({ name: 'messages' });
        } else if (menuItem.name === 'contacts') {
          menus.push({ name: 'contacts' });
        } else if (menuItem.name === 'createGroup') {
          menus.push({
            name: 'createGroup',
            title: '添加群组',
            unread: 0,
            renderContainer: () => {
              return <addGroup />;
            },
            render: (menu) => {
              return <i class='lemon-icon-group' />;
            },
            isBottom: true,
          });
        } else {
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
        {
          name: 'uploadFile',
        },
        {
          name: 'uploadImage',
        },
        {
          name: 'test1',
          click: () => {
            IMUI.$refs.editor.selectFile('application/vnd.ms-excel');
          },
          render: () => {
            return <span>Excel</span>;
          },
        },
      ]);
      // IMUI.initEmoji(EmojiData);
      IMUI.setLastContentRender('text', (message) => {
        return <span>{message.content}</span>;
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
    closeModal() {
      this.$emit('closeModal');
    },
    closeRightDrawer() {
      if (this.drawerVisibleShow) {
        this.$refs.IMUI.closeDrawer();
        this.drawerVisibleShow = false;
      }
    },
    setSendKey(e) {
      // return e.keyCode == 13;
      return e.keyCode == 13 && e.ctrlKey;
    },
    handleChangeMenu(menuName) {
      this.closeRightDrawer();

      console.log('Event:change-menu', menuName);
      // if(menuName === 'messages') {
      //   this.$emit('changeMenuMessage')
      // }
    },
    handleChangeContact(contact, instance) {
      this.closeRightDrawer();

      console.log('Event:change-contact', contact);
      this.targetUser = contact;
      instance.updateContact({
        id: contact.id,
        unread: 0,
      });
      instance.closeDrawer();
    },

    handlePullMessages(contact, next, instance) {
      let args = {
        contact,
        next,
      };
      this.$emit('handlePullMessages', args);
    },

    //历史记录
    pullHistore(list, hasMore, next, otheruser) {
      let messages = list.map((item) => {
        let messageItem = {
          id: item.messageUId,
          status: 'succeed',
          type: 'text',
          sendTime: item.sentTime,
          content: '',
          toContactId: item.targetId,
          fromUser: item.messageDirection == '1' ? this.user : otheruser,
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
            console.log(item);
            break;
          case 'RC:InfoNtf':
            messageItem.type = 'event';
            messageItem.content = item.content.message;
            break;
        }

        return messageItem;
      });
      next(messages, !hasMore);
    },
    handleMessageClick(e, key, message, instance) {
      console.log('点击了消息', e, key, message);
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
      if (message.type == 'image') {
        this.imgUrl = message.content;
        this.srcList = [message.content];
        this.outerVisible = true;
      } else if (message.type == 'file') {
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
          const updateMsg = { ...message, referMsg, referMsgUserId };
          IMUI.updateMessage(updateMsg);
          IMUI.messageViewToBottom();
        }
      }
    },
    handleSend(message, next, file) {
      let msg = {
        target_id: this.targetUser.id,
        isGroup: this.targetUser.isGroup ? this.targetUser.isGroup : false,
        fun: (data) => {
          if (data.status !== 'failed' && !!this.replyObj.type) {
            this.updateReplyMessage(data);
            this.replyObj = {};
          }

          next();
        },
      };

      switch (message.type) {
        case 'text':
          let isReply = !!this.replyObj.type;
          // 回复消息
          if (isReply) {
            const { id, type, content, fromUser, fileName = '' } = this.replyObj;
            this.$emit('handleSendMessage', {
              ...msg,
              conversation_type: 'RC:ReferenceMsg',
              content: {
                content: message.content,
              },
              referMsgUserId: fromUser.id,
              referMsg: { id, type, content, fileName, displayName: fromUser.displayName },
            });
          } else {
            this.$emit('handleSendMessage', {
              ...msg,
              conversation_type: 'RC:TxtMsg',
              content: {
                content: message.content,
              },
            });
          }

          break;
        case 'image':
          uploadFile(file)
            .then((res) => {
              // 还有图片现在上传结束消息那展示的是blob类型的数据，为了方便回复，建议直接加一个修改该条消息内容改成url/
              if (res.status === 200) {
                // require_thumb(base64) file(url)
                const { file } = res.data.data;
                this.$emit('handleSendMessage', {
                  ...msg,
                  conversation_type: 'RC:ImgMsg',
                  content: {
                    imageUri: file,
                  },
                });
              } else {
                Message.error(res.data.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });
          break;
        case 'file':
          let { name, size, type } = file;
          uploadFile(file)
            .then((res) => {
              if (res.status === 200) {
                this.$emit('handleSendMessage', {
                  ...msg,
                  conversation_type: 'RC:FileMsg',
                  content: { name, size, type, fileUrl: res.data.data.file },
                });
              } else {
                Message.error(res.data.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });
          break;
        case 'event':
          conversation_type = 'RC:InfoNtf';
          setTimeout(() => {
            next();
          }, 1000);
          break;
      }

      // setTimeout(() => {
      //   next();
      // }, 500);
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

    //接受新消息
    appendMessage(data) {
      this.$refs.IMUI.appendMessage(data);
    },
    // 获取当前机构用户
    getCurrentOrgUsers() {
      let IMUI = this.$refs.IMUI;
      let currentOrgUsers = this.currentOrgUsers;

      currentOrgUsers.forEach((item) => {
        if (item.lastContent) {
          item.lastContent = IMUI.lastContentRender(item.lastContent);
        }
      });
      this.$refs.IMUI.initContacts(currentOrgUsers);
      setTimeout(() => {
        this.firstConversationId && IMUI.changeContact(this.firstConversationId);
      }, 500);
    },
    // 新增新机构
    addNewContact(newContact) {
      this.all_users.push(newContact);
      this.$refs.IMUI.initContacts(all_user);
    },

    //切换联系人
    changeContact(contact) {
      this.$refs.IMUI.changeContact(contact.id);
    },
  },
};
</script>

<style lang="less" scoped>
.close-line {
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
.cur-user {
  margin-top: 4px;
  font-size: 16px;
  color: #000;
}
.more-setting {
  position: absolute;
  top: 28px;
  right: 14px;
  height: 22px;
  width: 22px;
  .icon-gengduo {
    font-size: 20px;
    color: #666;
    cursor: pointer;
  }
}
.right-toolbar-column {
  height: 100%;
  width: 50px;
  overflow: auto;
  position: absolute;
  right: -50px;
  top: 0;
  background-color: #f4f4f4;
  border: 1px solid #ececec;
  box-sizing: border-box;
}
/deep/ .lemon-menu .lemon-menu__item {
  padding: 8px 10px;
  /deep/ .iconfont {
    font-size: 24px;
  }
}

/deep/ .editorImg {
  height: 70px;
}

/deep/ .lemon-icon-default {
  font-style: normal;
  &:before {
    content: '\2740';
  }
}

// 消息样式
/deep/ .lemon-message {
  padding: 5px 0;
}
/deep/ .lemon-message__title {
  overflow: hidden;
  padding-bottom: 0;
  margin-bottom: 4px;
}
/deep/ .lemon-message__content {
  color: #666;
}
/deep/.lemon-message-image .lemon-message__content img {
  min-width: auto !important;
}
/deep/ .lemon-message-text {
  padding: 0;
  .lemon-message__content {
    padding: 0;
    background: none;
    border-radius: 0;
    &:before {
      content: '';
    }

    .tool-bar-wrapper .content-show {
      font-size: 14px;
      line-height: 20px;
      padding: 8px 10px;
      background: #fff;
      border-radius: 4px;
      position: relative;
      margin: 0;
    }
  }
}

/deep/ .lemon-message--reverse.lemon-message-file .lemon-message__content:before {
  content: ' ';
  position: absolute;
  top: 6px;
  width: 0;
  height: 0;
  border: 4px solid transparent;
  left: auto;
  right: -4px;
  border-right: none;
  border-left-color: #fff;
}

/deep/ .lemon-message--reverse.lemon-message-text {
  .tool-bar-wrapper .content-show {
    background: #35d863;
  }
}

/deep/ .lemon-editor {
  border: 1px solid #ececec;
}
/deep/ .lemon-drawer {
  top: 0 !important;
  border-left: 1px solid #ececec;
}
.im-cover {
  margin-top: 200px;
  width: 100%;
  text-align: center;
  font-size: 16px;
  .lemon-icon-message {
    font-size: 35px;
    margin-bottom: 10px;
  }
}
/deep/ .lemon-drawer {
  box-shadow: -4px 0px 16px -10px #ccc;
}
.bottom-line {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.reply-box {
  width: 300px;
  margin-right: 20px;
  line-height: 24px;
  box-sizing: border-box;
  .rep-text {
    display: inline-block;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /deep/ .el-tag__close {
    margin-top: -18px;
  }
}

.search-line {
  padding: 14px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ecebeb;
  .search-inp {
    width: 80%;
  }
  .icon-sousuo {
    margin-left: 3px;
    font-size: 15px;
    color: #999;
    line-height: 28px;
  }
  .icon-tianjia {
    cursor: pointer;
    width: 20%;
    text-align: center;
    font-size: 22px;
    color: #999;
  }
}
</style>
