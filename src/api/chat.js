/*
 * @文件描述:
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2021-12-22 16:12:19
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2022-03-16 17:29:49
 */
import { BaseUrl, CustomUrl, PAGE_SIZE, BIG_PAGE_SIZE } from './constant';
import commonAxios from 'ym-bridge-shandianyun';

// 数据统计
// 个人统计 message_amount 消息数  mark_amount 标记数  to_do_amount 待完成数  finish_amount 完成数
export const fetchSingleStats = (page, org_id, type, keyword, order_by, sort) => {
  return commonAxios.request({
    url: BaseUrl + '/statistical/person',
    method: 'get',
    params: {
      page,
      per_page: BIG_PAGE_SIZE,
      org_id,
      type, // 1 客服；2 管理员；3 普通用户；
      keyword, // 搜索关键字
      order_by, // 排序字段；message_amount 等
      sort, // asc；desc
    },
  });
};
// 群组统计 message_amount 消息数  person_amount 人数  mark_amount 标记数  to_do_amount 待完成数  finish_amount 完成数
export const fetchGroupStats = (page, org_id, keyword, order_by, sort) => {
  return commonAxios.request({
    url: BaseUrl + '/statistical/group',
    method: 'get',
    params: {
      page,
      per_page: BIG_PAGE_SIZE,
      org_id,
      keyword, // 搜索关键字
      order_by, // 排序字段；message_amount 等
      sort, // asc；desc
    },
  });
};

// 获取客服模块侧边栏配置
export const fetchCustomConfig = () => {
  return commonAxios.request({
    url: BaseUrl + '/module/side-options',
    method: 'get',
  });
};

// 消息上下文 offset 	默认5	前后分别多少条
export const fetchMessageContext = (id, offset) => {
  return commonAxios.request({
    url: BaseUrl + '/message-history/message/' + id + '/around',
    method: 'get',
    params: { offset: 6 },
  });
};

// 消息历史滚动加载 offset 	默认5	前后分别多少条 	> 0 向后 ；< 0 向前
export const fetchMessageHistory = (id, page) => {
  return commonAxios.request({
    url: BaseUrl + '/message-history/message/' + id + '/after',
    method: 'get',
    params: { offset: page * BIG_PAGE_SIZE },
  });
};

// 消息标记扩展 module 模块名 (cs客服)  operate:{type 操作类型  checked}
export const setBackExpansion = (module, msg_uid, extra_content, operate) => {
  return commonAxios.request({
    url: BaseUrl + '/message/expression',
    method: 'post',
    data: { module, msg_uid, extra_content, operate },
  });
};

// 群组公告查看
export const fetchGroupNoticeList = (id, page) => {
  return commonAxios.request({
    url: BaseUrl + '/group/' + id + '/notice-list',
    method: 'get',
    params: {
      page,
      per_page: PAGE_SIZE,
    },
  });
};

// 发布公告/group/ {ID} /notice
export const createGroupNotice = (id, content) => {
  return commonAxios.request({
    url: BaseUrl + '/group/' + id + '/notice',
    method: 'post',
    data: { content },
  });
};

// 自己退群 　/group/ID/quit
export const userQuitGroup = (id) => {
  return commonAxios.request({
    url: BaseUrl + '/group/' + id + '/quit',
    method: 'post',
  });
};
// 判断自己是不是群主 　/group/ {ID} /owner
export const checkGroupOwner = (id) => {
  return commonAxios.request({
    url: BaseUrl + '/group/' + id + '/owner',
    method: 'get',
  });
};
// 群主减人
export const kickGroupMember = (id, members) => {
  return commonAxios.request({
    url: BaseUrl + '/group/' + id + '/member-dec',
    method: 'post',
    data: { members },
  });
};

// 获取群聊已读情况
export const checkGroupReadStatus = (groupId, msg_uids) => {
  return commonAxios.request({
    url: BaseUrl + '/message-read-status/group/' + groupId,
    method: 'get',
    params: { msg_uids: msg_uids.join() }, // JSON.stringify(msg_uids)
    // params: qs.stringify({ msg_uids }),
  });
};

// 获取单聊已读情况
export const checkSingleReadStatus = (userId) => {
  return commonAxios.request({
    url: BaseUrl + '/message-read-status/person/' + userId,
    method: 'get',
  });
};

/**
 * @功能描述: 获取设置项
 * @参数:
 * @返回值:  "data": { "is_notify": 1, "font_size": 1 }
 */

export const getSettingOptions = () => {
  return commonAxios.request({
    url: BaseUrl + '/chat-option',
    method: 'get',
  });
};
/**
 * @功能描述: 保存设置项
 * @参数: is_notify	1接收消息 0不接受消息;  font_size 0小 1中 2大
 * @返回值:
 */
export const saveSettingOptions = (is_notify, font_size) => {
  return commonAxios.request({
    url: BaseUrl + '/chat-option',
    method: 'post',
    data: { is_notify, font_size },
  });
};
