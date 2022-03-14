/*
 * @文件描述: 聊天相关 消息处理
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2021-12-23 10:37:04
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2022-03-14 15:15:17
 */
const Type_Key_Obj = {
  'RC:ReferenceMsg': { type: 'text', key: 'content' },
  'RC:ImgMsg': { type: 'image', key: 'imageUri' },
  'RC:TxtMsg': { type: 'text', key: 'content' },
  'RC:VcMsg': { type: 'text', key: null, content: '视频通话' },
  'RC:InfoNtf': { type: 'event', key: 'message' },
  'RC:FileMsg': { type: 'file', key: 'name' },
};

const Default_Content = { type: 'text', key: null, content: '未知消息' };

// 最新一条信息 融云 ==> IM
export const CalcLastCentent = (messageType, content) => {
  let contentObj = content.content instanceof Object ? content.content : content;

  let obj = Type_Key_Obj[messageType] || Default_Content;
  let lastContent = {
    type: obj.type,
    content: obj.key ? contentObj[obj.key] : obj.contentObj,
  };

  if (lastContent.type === 'event') {
    lastContent.content = '[通知]';
  }

  return lastContent;
};

export const getFormatChatInfo = (item, isGroup = false) => {
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
};

export const getFormatNoticeInfo = (item) => {
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
};
