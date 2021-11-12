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
      @change-menu="handleChangeMenu"
      @change-contact="handleChangeContact"
      @pull-messages="handlePullMessages"
      @message-click="handleMessageClick"
      @menu-avatar-click="handleMenuAvatarClick"
      @send="handleSend"
      width='100%'
    >
      <template #cover>
        <div class="cover">
          <i class="lemon-icon-message"></i>
          <p><b>hello </b> 我是易木</p>
        </div>
      </template>
      <template #message-title="contact"> 
        <span>{{ contact.displayName }}</span>
        <small v-if="contact.id != 'admin'" class="more" @click="changeDrawer(contact, $refs.IMUI)">
          <i v-if="!drawerVisibleShow" class="el-icon-s-unfold"/>
          <i v-if="drawerVisibleShow" class="el-icon-s-fold"/>
        </small>
        <br/>
      </template>
    </lemon-imui>
    
    
    <el-dialog title="查看图片(可再次点击放大)" :visible.sync="outerVisible" width="500px">
      <el-image
          :src="imgUrl"
          :preview-src-list="srcList"
      >
      </el-image>
    </el-dialog>
  </div>
</template>

<script>
import AddGroup from './AddGroup.vue'
import CreateGroup from "./CreateGroup";
import groupInfo from './groupInfo'
import { Dialog, Image, Message } from 'element-ui';
import testComponent from './testComponent.vue'
const getTime = () => {

  return new Date().getTime();
};
const generateRandId = () => {
  return Math.random()
    .toString(36)
    .substr(-8);
};
import { getUserByOrgid, uploadFile } from '../api/data'
  export default {
    name: 'imMain',
    props: {
      messageList: {
        type: Array,
        default: () => []
      },
      currentUser: {
        type: Object,
        default: () => {}
      },
      baseUrl: {
        type: String,
        default: 'https://im.shandian8.com'
      },
      menuList: {
        type: Array,
        default: () => [
          {name: 'messages', isBottom: false}, 
          {name: 'contacts', isBottom: false}, 
          {name: 'createGroup', isBottom: true}, 
          {name: 'files', isBottom: false, title: '文档', unread: 0, key: 'test', component: {test: testComponent}}]
      },
      firstConversationId: String || undefined,
    },
    components: {
      AddGroup,
      CreateGroup,
      elDialog: Dialog,
      elImage: Image,
      Message,
      groupInfo
    },
    data() {
      return {
        contextmenu: [
          {
            click: (e, instance, hide) => {
              const { IMUI, message } = instance;
              const data = {
                id: generateRandId(),
                type: "event",
                //使用 jsx 时 click必须使用箭头函数（使上下文停留在vue内）
                content: (
                  <div>
                    <span>
                      你撤回了一条消息{" "}
                      <span
                        v-show={message.type == "text"}
                        style="color:#333;cursor:pointer"
                        content={message.content}
                        on-click={e => {
                          IMUI.setEditorValue(e.target.getAttribute("content"));
                        }}
                      >
                        重新编辑
                      </span>
                    </span>
                  </div>
                ),

                toContactId: message.toContactId,
                sendTime: getTime(),
              };
              IMUI.removeMessage(message.id);
              IMUI.appendMessage(data, true);
              // scrollToBottom=true
              hide();
            },
            visible: instance => {
              return instance.message.fromUser.id == this.user.id;
            },
            text: "撤回消息",
          },
          {
            visible: instance => {
              return instance.message.fromUser.id != this.user.id;
            },
            text: "举报",
          },
          {
            text: "转发",
          },
          {
            visible: instance => {
              return instance.message.type == "text";
            },
            text: "复制文字",
          },
          {
            visible: instance => {
              return instance.message.type == "image";
            },
            text: "下载图片",
          },
          {
            visible: instance => {
              return instance.message.type == "file";
            },
            text: "下载文件",
          },
          {
            click: (e, instance, hide) => {
              const { IMUI, message } = instance;
              IMUI.removeMessage(message.id);
              hide();
            },
            icon: "lemon-icon-folder",
            color: "red",
            text: "删除",
          },
        ],
        contactContextmenu: [
          {
            text: "删除该聊天",
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
            text: "设置备注和标签",
          },
          {
            icon: "lemon-icon-message",
            render: (h, instance, hide) => {
              return (
                <div style="display:flex;justify-content:space-between;align-items:center;width:130px">
                  <span>加入黑名单</span>
                  <span>
                    <input type="checkbox" id="switch" />
                    <label id="switch-label" for="switch">
                      Toggle
                    </label>
                  </span>
                </div>
              );
            },
          },
          {
            click(e, instance, hide) {
              const { IMUI, contact } = instance;
              IMUI.removeContact(contact.id);
              if (IMUI.currentContactId == contact.id) IMUI.changeContact(null);
              hide();
            },
            color: "red",
            text: "删除好友",
          },
        ],
        theme: "default",
        hideMenuAvatar: false,
        hideMenu: false,
        hideMessageName: false,
        hideMessageTime: true,
        user: {
          id: this.currentUser.id || 1,
          displayName: this.currentUser.nickname || '',
          orgid: this.currentUser.orgid || ''
        },
        show_message_list: this.messageList,
        targetUser: {},
        //右侧抽屉
        drawerVisibleShow: true,
        // 新增组
        addGroupOpen: false,
        outerVisible: false,
        imgUrl: undefined,
        srcList: undefined,
        my_baseUrl: this.baseUrl,

        //联系人列表
        all_users: []
      }
    },
    watch: {
      currentUser(newValue, oldValue) {
        this.user = {
          id: newValue.id || 1,
          displayName: newValue.nickname || '',
          orgid: newValue.orgid || ''
        }
      },
      baseUrl(newValue, oldValue) {
        this.my_baseUrl = newValue
      },
      messageList(newValue, oldValue) {
        console.log('数据变化', newValue, oldValue)
        this.show_message_list = newValue
        this.getCurrentOrgUsers()
      }
    },
    mounted () {
      const { IMUI } = this.$refs;
      
      this.getCurrentOrgUsers()

      //处理菜单
      let menus = []
      this.menuList.forEach((menuItem, menuIndex) => {
        if(menuItem.name === 'messages'){
          menus.push({name: "messages"})
        } else if(menuItem.name === 'contacts') {
          menus.push({name: 'contacts'})
        } else if(menuItem.name === 'createGroup') {
          menus.push({
            name: "createGroup",
            title: "添加群组",
            unread: 0,
            renderContainer: () => {
              return (
                <addGroup></addGroup>
              )
            },
            render: menu => {
              return <i class="lemon-icon-group" />;
            },
            isBottom: true,
          })
        } else {
          class VNode {
            constructor (tag, data, value, type) {
              this.tag = tag && tag.toLowerCase()
              this.data = data;
              this.value = value;
              this.type = type;
              this.children = []
            }
            appendChildren(value) {
              this.children.push(value)
            }
          }
          menus.push({
            name: menuItem.name,
            isBottom: menuItem.isBottom,
            title: menuItem.title,
            unread: menuItem.unread,
            renderContainer: (abc) => {
              let menuItemKey = menuItem.component[menuItem.key]
              return <menuItemKey></menuItemKey>
            },
            render: menu => {
              // let iDom = document.createElement('i')
              // iDom.className = "menu-icon-"+menuItem.name
              // let nodeType = iDom.nodeType
              // let nodeName = iDom.nodeName
              // let property = iDom.attributes;
              // let _propertyObj = {}
              // console.log(property, property.length) 
              // for(let i=0; i< property.length; i++) {
              //   _propertyObj[property[i].nodeName] = property[i].nodeValue
              // }
              // let VIDom = new VNode(nodeName, _propertyObj, undefined, nodeType)
              let iClassname = 'lemon-icon-'+menuItem.name
              return <i class={iClassname} />;
            },
          })
        }
      })
      // [
      //   {
      //     name: "messages",
      //   },
      //   {
      //     name: "contacts",
      //   },
      //   {
      //     name: "createGroup",
      //     title: "添加群组",
      //     unread: 0,
      //     renderContainer: () => {
      //       return (
      //         <addGroup></addGroup>
      //       )
      //     },
      //     render: menu => {
      //       return <i class="lemon-icon-group" />;
      //     },
      //     isBottom: true,
      //   },
      // ]
      IMUI.initMenus(menus);

      IMUI.initEditorTools([
        {
          name: "uploadFile",
        },
        {
          name: "uploadImage",
        },
        {
          name: "test1",
          click: () => {
            IMUI.$refs.editor.selectFile("application/vnd.ms-excel");
          },
          render: () => {
            return <span>Excel</span>;
          },
        },
        // {
        //   name: "test1",
        //   click: () => {
        //     IMUI.initEditorTools([{ name: "uploadFile" }, { name: "emoji" }]);
        //   },
        //   render: () => {
        //     return <span>重制工具栏</span>;
        //   },
        // },
        // {
        //   name: "test2",
        //   isRight: true,
        //   title: "上传 Excel",
        //   click: () => {
        //     alert("点击了 ··· ");
        //   },
        //   render: () => {
        //     return <b>···</b>;
        //   },
        // },
      ]);
      // IMUI.initEmoji(EmojiData);
      IMUI.setLastContentRender("image", message => {
        return <span>[图片]</span>;
      });
      IMUI.setLastContentRender("event", message => {
        return message.content;
      });
      IMUI.setLastContentRender("file", message => {
        return <span>[文件]</span>;
      });
    },
    methods: {
      handleChangeMenu(menuName) {
        console.log("Event:change-menu", menuName);
        // if(menuName === 'messages') {
        //   this.$emit('changeMenuMessage')
        // }
      },
      handleChangeContact(contact, instance) {
        console.log("Event:change-contact", contact);
        this.targetUser = contact
        instance.updateContact({
          id: contact.id,
          unread: 0,
        });
        instance.closeDrawer();
      },

      handlePullMessages(contact, next, instance) {
        let args = {
          contact, next
        }
        this.$emit('handlePullMessages', args)
      },

      //历史记录
      pullHistore(list, hasMore, next, otheruser) {
        let messages = list.map(item => {
          let messageContent = ''
          let messageItem = {
            id: item.messageUId,
            status: 'succeed',
            type: 'text',
            sendTime: item.sentTime,
            content: '',
            toContactId: item.targetId,
            fromUser: item.messageDirection == '1'? this.user: otheruser
          }
          switch (item.messageType) {
            case 'RC:TxtMsg':
              messageItem.type = 'text'
              messageItem.content = item.content.content
              break
            case 'RC:ImgMsg':
              messageItem.type = 'image'
              messageItem.content = item.content.imageUri
              break;
            case 'RC:FileMsg':
              messageItem.type = 'file'
              messageItem.content = item.content.fileUrl
              messageItem.fileSize = item.content.size
              messageItem.fileName = item.content.name
              console.log(item)
              break
            case 'RC:InfoNtf':
              messageItem.type = 'event'
              messageItem.content = item.content.content
              break
          }
          
          return messageItem
        })
        console.log(hasMore)
        next(messages, !hasMore);
      },
      handleMessageClick(e, key, message, instance) {
        console.log("点击了消息", e, key, message);
        if (key == "status") {
          instance.updateMessage({
            id: message.id,
            status: "going",
            content: "正在重新发送消息...",
          });
          setTimeout(() => {
            instance.updateMessage({
              id: message.id,
              status: "succeed",
              content: "发送成功",
            });
          }, 2000);
        }
        if (message.type == 'image') {
          this.imgUrl = message.content
          this.srcList = [message.content]
          this.outerVisible = true
        } else if(message.type == 'file') {
          window.open(message.content)
        }
      },
      handleMenuAvatarClick() {
        console.log("Event:menu-avatar-click");
      },
      handleSend(message, next, file) {
        let conversation_type = ''
        let messageContent = {}
        switch (message.type){
          case 'text':
            conversation_type='RC:TxtMsg'
            messageContent = {
              content: message.content
            }
            this.$emit('handleSendMessage', {target_id: this.targetUser.id, isGroup: this.targetUser.isGroup? this.targetUser.isGroup: false, conversation_type, content: messageContent, fun: next})
            break;
          case 'image':
            conversation_type = 'RC:ImgMsg'
            uploadFile(this.my_baseUrl, file).then(res => {
              if(res.status === 200) {
                messageContent = {
                  content: res.data.data.require_thumb,
                  imageUri: res.data.data.file
                }
                this.$emit('handleSendMessage', 
                {
                  target_id: this.targetUser.id, 
                  isGroup: this.targetUser.isGroup? this.targetUser.isGroup: false, 
                  conversation_type, 
                  content: messageContent, 
                  fun: next
                })
              } else {
                Message.error(res.data.msg)
              }
            }).catch(err => {
              console.log(err)
            })
            break;
          case 'file':
            conversation_type = 'RC:FileMsg'
            console.log(message, file)
            let {size, type, name} = file

            uploadFile(this.my_baseUrl, file).then(res => {
              if(res.status === 200) {
                messageContent = {
                  name,
                  size,
                  type,
                  fileUrl: res.data.data.file
                }
                this.$emit('handleSendMessage', {target_id: this.targetUser.id, isGroup: this.targetUser.isGroup? this.targetUser.isGroup: false, conversation_type, content: messageContent, fun: next})
              } else {
                Message.error(res.data.msg)
              }
            }).catch(err => {
              console.log(err)
            })
            break;
          case 'event':
            conversation_type = 'RC:InfoNtf'
            setTimeout(() => {
              next();
            }, 1000);
            break;
        }
       
        // setTimeout(() => {
        //   next();
        // }, 1000);
      },

      //打开抽屉
      changeDrawer(contact, instance) {
        this.$store.dispatch("SetContact", contact)
        instance.changeDrawer({
          //width: 240,
          //height: "90%",
          //offsetX:0 ,
          //offsetY: ,
          //position: "center",
          // inside: true,
          // offsetX: -280,
          // offsetY: -100,
          render: () => {
            return (
              <groupInfo/>
              // <div class="drawer-content">
              //   <p>
              //     <b>自定义抽屉</b>
              //   </p>
              //   <p>{contact.displayName}</p>
              // </div>
            );
          },
          
        });
      },
      
    
      //添加群组
      gbAddGroupOpen() {
        this.addGroupOpen = false
        this.getContactsList()
      },

      //接受新消息
      appendMessage(data) {
        this.$refs.IMUI.appendMessage(data)
      },
      //获取当前机构用户
      getCurrentOrgUsers() {
        let IMUI = this.$refs.IMUI
        let currentOrgUsers = this.$store.state.currentOrgUsers
        let all_user = []
        currentOrgUsers.forEach(userItem => {
          let key = -1
          this.show_message_list.forEach((messageUserItem, messageUserIndex) => {
            if(messageUserItem.id == userItem.id){
              if(messageUserItem.lastContent == ''){
                messageUserItem.lastContent = '未知消息'
              }
              messageUserItem.lastContent = IMUI.lastContentRender(messageUserItem.lastContent)
              key = messageUserIndex
            }
          })
          if(key > -1) {
            userItem.unread = this.show_message_list[key].unread
            userItem.lastSendTime = this.show_message_list[key].lastSendTime
            userItem.lastContent = this.show_message_list[key].lastContent
          }
          all_user.push(userItem)
        })
        this.show_message_list.forEach((messageUserItem, messageUserIndex) => {
          if(messageUserItem.id < 0) {
            let message = messageUserItem.lastContent
            if(!messageUserItem.lastContent){
              message = '未知消息'
            }
            messageUserItem.lastContent = IMUI.lastContentRender(message)
            all_user.push(messageUserItem)
          }
          if(messageUserItem.isGroup) {
            if(!messageUserItem.lastContent){
              messageUserItem.lastContent = '未知消息'
            }
            messageUserItem.lastContent = IMUI.lastContentRender(messageUserItem.lastContent)
            all_user.push(messageUserItem)
          } 
        })
        this.all_users = all_user
        this.$refs.IMUI.initContacts(all_user);
        setTimeout(() => {
          this.firstConversationId && IMUI.changeContact(this.firstConversationId);
        }, 500);
        // getUserByOrgid(this.my_baseUrl, this.user.orgid).then(res => {
        //   if(res.status === 200){
        //     let userList = res.data.data
        //     let all_user = []

        //     userList.forEach(item => {
        //       let key = -1
        //       let userItem = {
        //         id: item.id,
        //         displayName: item.name,
        //         avatar: item.avatar,
        //         index: '[1]群组',
        //         unread: 0,
        //         lastSendTime: '',
        //         lastContent: ''
        //       } 
        //       this.show_message_list.forEach((messageUserItem, messageUserIndex) => {
        //         if(messageUserItem.id == item.id){
        //           if(messageUserItem.lastContent == ''){
        //             messageUserItem.lastContent = '未知消息'
        //           }
        //           messageUserItem.lastContent = IMUI.lastContentRender(messageUserItem.lastContent)
        //           key = messageUserIndex
        //         }
        //       })
        //       if(key > -1) {
        //         userItem.unread = this.show_message_list[key].unread
        //         userItem.lastSendTime = this.show_message_list[key].lastSendTime
        //         userItem.lastContent = this.show_message_list[key].lastContent
        //       }
        //       all_user.push(userItem)
        //     })
        //     this.show_message_list.forEach((messageUserItem, messageUserIndex) => {
        //       if(messageUserItem.id < 0) {
        //         let message = messageUserItem.lastContent
        //         if(!messageUserItem.lastContent){
        //           message = '未知消息'
        //         } else {
        //           console.log(messageUserItem.lastContent)
        //           if(messageUserItem.lastContent.content.imageUri) {
        //             message = messageUserItem.lastContent.content.imageUri
        //             messageUserItem.lastContent.content
        //             messageUserItem.lastContent.type = 'image'
        //           }
        //         }
        //         console.log(message)
        //         messageUserItem.lastContent = IMUI.lastContentRender(message)
        //         all_user.push(messageUserItem)
        //       } else if(messageUserItem.isGroup) {
        //         if(!messageUserItem.lastContent){
        //             messageUserItem.lastContent = '未知消息'
        //           }
        //         messageUserItem.lastContent = IMUI.lastContentRender(messageUserItem.lastContent)
        //         all_user.push(messageUserItem)
        //       } 
        //     })
        //     this.all_users = all_user
        //     this.$refs.IMUI.initContacts(all_user);
        //     setTimeout(() => {
        //       this.show_message_list[0] && IMUI.changeContact(this.show_message_list[0].id);
        //     }, 500);
        //   } else {
        //     Message.error(res.data.msg)
        //   }
        // }).catch(err => {
        //   console.log(err)
        // })
      },
      // 新增新机构
      addNewContact(newContact) {
        this.all_users.push(newContact)
        this.$refs.IMUI.initContacts(all_user);
      },

      //切换联系人
      changeContact(contact) {
        // this.$store.dispatch("SetContact", contact)
        this.$refs.IMUI.changeContact(contact.id)
      }
      
    },
  }
</script>

<style lang="less" scoped>
.more {
  font-size: 12px;
  line-height: 24px;
  height: 24px;
  position: absolute;
  top: 14px;
  right: 14px;
  cursor: pointer;
  user-select: none;
  color: #f1f1f1;
  display: inline-block;
  border-radius: 4px;
  background: #111;
  padding: 0 8px;
  &:active{
    background: #999
  }
}
/deep/.lemon-message-image .lemon-message__content img{
  min-width: auto !important;
}
/deep/ .editorImg{
  height: 70px;
}

/deep/ .lemon-icon-files {
  font-style: normal;
  &:before {
    content: "\2740";
  }
}
</style>