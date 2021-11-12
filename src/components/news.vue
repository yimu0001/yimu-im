<template>
  <div>
    <div class="tipDom" v-if="!showList" @click="showList = !showList">
      <Avatar :size="38" fit='cover' src="https://i.loli.net/2017/08/21/599a521472424.jpg"></Avatar> &nbsp;&nbsp;
      <span>我的IM</span>
    </div>
    <el-dialog
      class="imDialog"
      :visible.sync="showList"
      :show-close='false'
      @opened='handleOpenedDialog'
      center>
      <im-main ref="imMainDom" :messageList = "messageList" :baseUrl='my_baseUrl' :currentUser = 'currentUser' @handleSendMessage="handleSendMessage" 
      @handlePullMessages='handlePullMessages'
      :firstConversationId='firstConversationId'
      @changeMenuMessage='getConnetList'></im-main>
      <span slot="footer" class="dialog-footer">
      </span>
    </el-dialog>
    <!-- <div v-if="showList" style="width: 40%">
      <im-main ref="imMainDom" :messageList = "messageList" :baseUrl='my_baseUrl' :currentUser = 'currentUser' @handleSendMessage="handleSendMessage" 
      @handlePullMessages='handlePullMessages'
      :firstConversationId='firstConversationId'
      @changeMenuMessage='getConnetList'></im-main>
    </div> -->
  </div>
</template>

<script>
import 'element-ui/lib/theme-chalk/index.css';
import imMain from './im-main'
import { Avatar, Dialog, Message} from 'element-ui';
import * as RongIMLib from '@rongcloud/imlib-v4'
import { registerUser, getCurrentUser, getTargetInfoById, groupInfos, getUserByOrgid } from '../api/data.js'
import Bus from '../libs/bus';
  export default {
    name: 'yimuIm',
    props: {
      baseUrl: {
        type: String,
        default: 'https://im.shandian8.com'
      },
    },
    components: {
      Avatar, imMain,
      elDialog: Dialog,
      Message
    },
    mounted () {
      this.getCurrentUser()
      this.im = RongIMLib.init({ appkey: 'cpj2xarlctfmn' ,connectType: 'comet'})
      this.imWatcher()
      
      this.connectRongyun()

      Bus.$on('createGroupOk', (id) => {
        setTimeout(() => {
          this.im.Conversation.getList({
            count: 10,
            startTime: 0,
            order: 0
          }).then(conversationList => {
            console.log('获取会话列表成功', conversationList);
            conversationList.forEach(item => {
              if(item.targetId == id){
                // this.getConnetList()
                groupInfos(this.my_baseUrl, id).then(res =>{
                  if(res.status === 200 ){
                      newConversation.displayName = res.data.data[id].content
                      newConversation.avatar = res.data.data[id].avatar
                      let userItem = {
                        id: id,
                        displayName: newConversation.displayName,
                        avatar: newConversation.avatar,
                        index: '[2]群组',
                        unread: newConversation.unreadMessageCount,
                        lastSendTime: newConversation.latestMessage.sentTime,
                        lastContent: {},
                        isGroup: true
                      }
                      if(newConversation.latestMessage.messageType == 'RC:ImgMsg'){
                        userItem.lastContent = {type: 'image', content: item.latestMessage.content.imageUri}
                      } else if(newConversation.latestMessage.messageType == 'RC:TxtMsg') {
                        userItem.lastContent = {type: 'text', content: item.latestMessage.content.content}
                      } else if(newConversation.latestMessage.messageType == '"RC:VcMsg"') {
                        userItem.lastContent = {type: 'text', content: '视频通话'}
                      } else {
                        console.log(newConversation.latestMessage.messageType)
                        userItem.lastContent = {type: 'text', content: '未知消息'}
                      }
                      console.log(userItem)
                      this.$refs.imMain.addNewContact(userItem)
                    }
                })
              }
            })
          });
        }, 500)
        
        
      });
    },
    watch: {
      baseUrl(newValue, oldValue) {
        this.my_baseUrl = newValue
        this.$store.commit('setAxiosBaseUrl', newValue)
      }
    },
    data() {
      return {
        value: true,
        showList: false,
        im: undefined,
        my_baseUrl: this.baseUrl,
        user_token: '',
        user_id: '',
        messageList: [],
        currentUser: {},
        //用来储存
        saveMessageList: [],
        // 会话第一个联系人id
        firstConversationId: undefined
      }
    },
    methods: {
      imWatcher() {
        let im = this.im
        let _this = this
        _this.im.watch({
          // 监听会话列表变更事件
          conversation (event) {
            // 假定存在 getExistedConversationList 方法，以获取当前已存在的会话列表数据
            console.log(event)
            // _this.getConnetList()
            // 发生变更的会话列表
            // const updatedConversationList = event.updatedConversationList;
            // 通过 im.Conversation.merge 计算最新的会话列表
            // const latestConversationList = this.im.Conversation.merge({ conversationList, updatedConversationList })
          },
          // 监听消息通知
          message (event) {
            // 新接收到的消息内容
            const message = event.message;
            let messageData = {}
            switch(message.messageType){
              case 'RC:TxtMsg':
                messageData = {
                  id: message.messageUId,
                  status: 'succeed',
                  type: 'text',
                  sendTime: message.sentTime,
                  content: message.content.content,
                  toContactId: message.targetId,
                  fromUser: {
                    id: message.content.user.id,
                    displayName: message.content.user.name,
                    avatar: message.content.user.portrait
                  }
                }
                break;
              case 'RC:ImgMsg':
                messageData = {
                  id: message.messageUId,
                  status: 'succeed',
                  type: 'image',
                  sendTime: message.sentTime,
                  content: message.content.imageUri,
                  toContactId: message.targetId,
                  fromUser: {
                    id: message.content.user.id,
                    displayName: message.content.user.name,
                    avatar: message.content.user.portrait
                  }
                }
                break
              case 'RC:InfoNtf':
                messageData = {
                  id: message.messageUId,
                  status: 'succeed',
                  type: 'event',
                  sendTime: message.sentTime,
                  content: message.content.msg,
                  toContactId: message.targetId,
                  fromUser: {
                    id: message.content.user.id || -1,
                    displayName: message.content.user.name || '系统通知',
                    avatar: message.content.user.portrait || 'https://im.shandian8.com/public/notify.png'
                  }
                }
            }
            !_this.showList && (Message({ message: '`${message.content.user.name}给您发了条消息`', center: true, offset: 1000 }))
            if(_this.$refs.imMainDom){
              _this.$refs.imMainDom.appendMessage(messageData)
            } else {
              messageData.id && _this.saveMessageList.push(messageData)
            }

            // IMUI.appendMessage(data);
          },
          // 监听 IM 连接状态变化
          status (event) {
            console.log('connection status:', event.status);
          },
          // 监听聊天室 KV 数据变更
          chatroom (event) {
            /**
             * 聊天室 KV 存储数据更新
             * @example
             * [
             *  {
             *    "key": "name",
             *    "value": "我是小融融",
             *    "timestamp": 1597591258338, 
             *    "chatroomId": "z002", 
             *    "type": 1 // 1: 更新（ 含:修改和新增 ）、2: 删除
             *  },
             * ]
             */
            const updatedEntries = event.updatedEntries
          },
          expansion (event) {
            /**
             * 更新的消息拓展数据
             * @example {
             *    expansion: { key: 'value' },      // 设置或更新的扩展值
             *    messageUId: 'URIT-URIT-ODMF-DURR' // 设置或更新扩展的消息 uid
             * }
             */
            const updatedExpansion = event.updatedExpansion;
            /**
             * 删除的消息拓展数据
             * @example {
             *    deletedKeys: ['key1', 'key2'],    // 设置或更新的扩展值
             *    messageUId: 'URIT-URIT-ODMF-DURR' // 设置或更新扩展的消息 uid
             * }
             */
            const deletedExpansion = event.deletedExpansion;
          }
        });
      },
      connectRongyun() {
        registerUser(this.my_baseUrl).then(res => {
          if(res.status === 200){
            this.user_token = res.data.data.token
            this.user_id = res.data.data.userId
            this.im.connect({ token: this.user_token }).then(user => {
              console.log('链接成功, 链接用户 id 为: ', user.id);
              this.getConnetList()
            }).catch(error => {
              console.log('链接失败: ', error.code, error.msg);
            });
          } else{
            Message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      },
      getConnetList() {
        this.im.Conversation.getList().then(conversationList => {
          console.log('获取会话列表成功', conversationList);
          this.firstConversationId = conversationList[0]? conversationList[0].targetId: undefined
          // type类型注解 1系统
          // target => id
          let exit_message_list = []
          for(let item of conversationList){
            if(item.type == 3){
              // const conversation = this.im.Conversation.get({
              //   targetId: item.targetId,
              //   type: RongIMLib.CONVERSATION_TYPE.PRIVATE
              // });
              // conversation.destory().then(() => console.log('删除会话成功', item.targetId));
              groupInfos(this.my_baseUrl, item.targetId).then(res => {
                if(res.status === 200 ){
                  item.displayName = res.data.data[item.targetId].content
                  item.avatar = res.data.data[item.targetId].avatar
                  let userItem = {
                    id: item.targetId,
                    displayName: item.displayName,
                    avatar: item.avatar,
                    index: '[2]群组',
                    unread: item.unreadMessageCount,
                    lastSendTime: item.latestMessage.sentTime,
                    lastContent: {},
                    isGroup: true
                  }
                  if(item.latestMessage.messageType == 'RC:ImgMsg'){
                    userItem.lastContent = {type: 'image', content: item.latestMessage.content.imageUri}
                  } else if(item.latestMessage.messageType == 'RC:TxtMsg') {
                    userItem.lastContent = {type: 'text', content: item.latestMessage.content.content}
                  } else if(item.latestMessage.messageType == "RC:VcMsg") {
                    userItem.lastContent = {type: 'text', content: '视频通话'}
                  } else if(item.latestMessage.messageType == "RC:InfoNtf"){
                    userItem.lastContent = {type: 'event', content: item.latestMessage.content.message}
                  } else if(item.latestMessage.messageType == "RC:FileMsg"){
                    userItem.lastContent = {type: 'file', content: item.latestMessage.content.namne}
                  } else {
                    userItem.lastContent = {type: 'text', content: '未知消息'}
                  }
                  exit_message_list.push(userItem) 
                } else {
                  Message.error(res.data.msg)
                }
              })
            } else {
              if(Number(item.targetId) > 0){
                getTargetInfoById(this.my_baseUrl, item.targetId).then(res => {
                  if(res.status === 200  && res.data.data.length){
                    item.displayName = res.data.data[0].nickname
                    item.avatar = res.data.data[0].avatar
                    let userItem = {
                      id: item.targetId,
                      displayName: item.displayName,
                      avatar: item.avatar,
                      index: '[1]群组',
                      unread: item.unreadMessageCount,
                      lastSendTime: item.latestMessage.sentTime,
                      lastContent: {},
                    }
                    if(item.latestMessage.messageType == 'RC:ImgMsg'){
                      userItem.lastContent = {type: 'image', content: item.latestMessage.content.imageUri}
                    } else if(item.latestMessage.messageType == 'RC:TxtMsg') {
                      userItem.lastContent = {type: 'text', content: item.latestMessage.content.content}
                    } else if(item.latestMessage.messageType == '"RC:VcMsg"') {
                      userItem.lastContent = {type: 'text', content: '视频通话'}
                    } else if(item.latestMessage.messageType == "RC:InfoNtf"){
                      userItem.lastContent = {type: 'event', content: item.latestMessage.content.message}
                    }  else if(item.latestMessage.messageType == "RC:FileMsg"){
                      userItem.lastContent = {type: 'file', content: item.latestMessage.content.namne}
                    } else {
                      userItem.lastContent = {type: 'text', content: '未知消息'}
                    }
                    exit_message_list.push(userItem) 
                  } else if(res.status === 200  && !res.data.data.length) {
                    let userItem = {
                      id: item.targetId,
                      displayName: '未知用户',
                      avatar: 'https://im.shandian8.com/public/shenhe.png',
                      index: '[1]群组',
                      unread: item.unreadMessageCount,
                      lastSendTime: item.latestMessage.sentTime,
                      lastContent: {},
                    }
                    if(item.latestMessage.messageType == 'RC:ImgMsg'){
                      userItem.lastContent = {type: 'image', content: item.latestMessage.content.imageUri}
                    } else if(item.latestMessage.messageType == 'RC:TxtMsg') {
                      userItem.lastContent = {type: 'text', content: item.latestMessage.content.content}
                    } else if(item.latestMessage.messageType == '"RC:VcMsg"') {
                      userItem.lastContent = {type: 'text', content: '视频通话'}
                    } else if(item.latestMessage.messageType == "RC:InfoNtf"){
                      userItem.lastContent = {type: 'event', content: item.latestMessage.content.message}
                    } else if(item.latestMessage.messageType == "RC:FileMsg"){
                      userItem.lastContent = {type: 'file', content: item.latestMessage.content.namne}
                    } else {
                      userItem.lastContent = {type: 'text', content: '未知消息'}
                    }
                    exit_message_list.push(userItem) 
                  }
                }).catch(err => {
                  console.log(err)
                })
              } else {
                if(item.targetId === '-1') {
                  item.displayName = '系统审核'
                  item.avatar = 'https://im.shandian8.com/public/shenhe.png'
                } else if(item.targetId === '-2'){
                  item.displayName = '通知提醒'
                  item.avatar = 'https://im.shandian8.com/public/notify.png'
                } else if(item.targetId === '-3'){
                  item.displayName = '内容监控'
                  item.avatar = 'https://im.shandian8.com/public/shenhe.png'
                }
                let userItem = {
                    id: item.targetId,
                    displayName: item.displayName,
                    avatar: item.avatar,
                    index: '[1]群组',
                    unread: item.unreadMessageCount,
                    lastSendTime: item.latestMessage.sentTime,
                    lastContent: {type: 'text', content: item.latestMessage.content.content},
                  }
                  // if(item.latestMessage.content.messageType == 'RC:ImgMsg'){
                  //   userItem.lastContent = '[图片]'
                  // }
                  exit_message_list.push(userItem)
              } 
              // const conversation = this.im.Conversation.get({
              //   targetId: item.targetId,
              //   type: RongIMLib.CONVERSATION_TYPE.GROUP
              // });
              // conversation.destory().then(() => console.log('删除会话成功'+item.targetId));
            }
            
          }
          // if(this.messageList.length){
          //   setTimeout(() => {
          //     console.log('sjkdkljasdjklsadkjlsadfjklfjklsda', exit_message_list)
          //     this.messageList = exit_message_list
          //   }, 1500)
          // } else {
          this.messageList = exit_message_list
          console.log(this.messageList)
          // }
          this.getCurrentOrgUsers()
          
        }).catch(error => {
          console.log('获取会话列表失败: ', error, error.code, error.msg);
        });
      },
      getCurrentUser() {
        getCurrentUser(this.my_baseUrl).then(res => {
          if(res.status === 200) {
            this.currentUser = res.data.data
          }
        }).catch(err => {
          console.log(err)
        })
      },
      handleSendMessage(item) {
        let {target_id, conversation_type, content, fun, isGroup, imageUri} = item
        const conversation = this.im.Conversation.get({
          targetId: target_id,
          type: isGroup? RongIMLib.CONVERSATION_TYPE.GROUP: RongIMLib.CONVERSATION_TYPE.PRIVATE
        });
        // 向会话内发消息
        conversation.send({
          // 消息类型，其中 RongIMLib.MESSAGE_TYPE 为 IMLib 内部的内置消息类型常量定义
          messageType: conversation_type, // 'RC:TxtMsg'
          // 消息内容
          content: content
        }).then(function(message){
          console.log(fun)
          fun()
        }).catch(error => {
          console.log('发送文字消息失败', error.code, error.msg);
          fun({status:'failed'})
        });
      },
      handleOpenedDialog() {
        console.log(this.saveMessageList)
        this.saveMessageList.forEach(res => {
          this.$refs.imMainDom.appendMessage(res)
        })
        this.saveMessageList = []
      },
      handlePullMessages(args) {
        const conversation = this.im.Conversation.get({
          targetId: args.contact.id,
          type: args.contact.isGroup? RongIMLib.CONVERSATION_TYPE.GROUP: RongIMLib.CONVERSATION_TYPE.PRIVATE
        });
        const otheruser = {
          id: args.contact.id,
          displayName: args.contact.displayName,
          avatar: args.contact.avatar,
        };
        const option = {
          // 获取历史消息的时间戳，默认为 0，表示从当前时间获取
          timestamp: +new Date(),
          // 获取条数，有效值 1-20，默认为 20
          count: 20,
        };
        conversation.getMessages(option).then(result => {
          const list = result.list;       // 获取到的消息列表
          const hasMore = result.hasMore; // 是否还有历史消息可获取
          console.log('获取历史消息成功', list, hasMore);
          this.$refs.imMainDom.pullHistore(list, hasMore, args.next, otheruser)
        }).catch(error => {
          console.log('发送文字消息失败', error.code, error.msg);
        });
      },

      //唤起会话
      changeContact(contact) {
        this.showList = true
        setTimeout(() => {
          this.$refs.imMainDom.changeContact(contact)
        }, 500)
      },
      //获取当前机构用户
      getCurrentOrgUsers() {
        getUserByOrgid(this.my_baseUrl, this.currentUser.orgid).then(res => {
          if(res.status === 200){
            let userList = res.data.data
            let currentorgUsers = userList.map(item => {
              let userItem = {
                id: item.id,
                displayName: item.name,
                avatar: item.avatar,
                index: '[1]群组',
                unread: 0,
                lastSendTime: '',
                lastContent: ''
              } 
              return userItem
            })
            this.$store.commit('setCurrentOrgUsers', currentorgUsers)
          } else {
            Message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      },
    },
    
  }
</script>

<style lang="less" scoped>
.tipDom{
  position: fixed;
  bottom: 0px;
  right: 0px;
  height: 55px;
  width: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .5);
  font-size: 14px;
  cursor: pointer;
  &:hover{
    // animation: shake 800ms ease-in-out;
    transform: scale(1.1);
  }
}
@keyframes shake { /* 水平抖动，核心代码 */
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(+2px, 0, 0); }
  30%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(+4px, 0, 0); }
  50% { transform: translate3d(-4px, 0, 0); }
}
.imDialog{
  /deep/.el-dialog__header{
    padding: 0
  }
  /deep/.el-dialog__body{
    padding: 0;
  }
  /deep/.el-dialog--center .el-dialog__footer{
    padding: 0;
  }
}
</style>